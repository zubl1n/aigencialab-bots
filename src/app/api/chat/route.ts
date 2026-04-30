/**
 * POST /api/chat  — Motor de agente AIgenciaLab
 * GET  /api/chat  — Health check
 *
 * Fixes aplicados:
 * - Timeout de 10s en todas las llamadas externas (Groq, Supabase)
 * - CORS headers para widgets embebidos en dominios externos
 * - Fallback garantizado si Supabase no responde
 * - Sin dependencia de buildAgentContext que colgaba
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const GROQ_KEY     = process.env.GROQ_API_KEY ?? '';

// ── CORS ──────────────────────────────────────────────────────
const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-client-id, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'aigencialab-chat' }, { headers: CORS });
}

// ── Rate Limit (en memoria) ───────────────────────────────────
const rlStore = new Map<string, { n: number; reset: number }>();
function rateOk(id: string, limit = 200): boolean {
  const now = Date.now();
  const e = rlStore.get(id);
  if (!e || e.reset < now) { rlStore.set(id, { n: 1, reset: now + 3_600_000 }); return true; }
  if (e.n >= limit) return false;
  e.n++; return true;
}

// ── Fetch con timeout ─────────────────────────────────────────
async function fetchWithTimeout(url: string, opts: RequestInit, ms = 10000): Promise<Response> {
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(tid);
  }
}

// ── Llamada a Groq ────────────────────────────────────────────
async function callGroq(
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY no configurada en el servidor');
  const res = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
    },
    12000
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

// ── Cargar bot_config desde Supabase con timeout ──────────────
async function loadBotConfig(clientId: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Usar Promise.race para garantizar timeout
    const result = await Promise.race([
      supabase
        .from('bot_configs')
        .select('active, model, temperature, max_tokens, system_prompt, bot_name, language, welcome_message')
        .eq('client_id', clientId)
        .maybeSingle(),
      new Promise<{ data: null; error: Error }>((_, rej) =>
        setTimeout(() => rej(new Error('Supabase timeout')), 5000)
      ),
    ]);
    return (result as any).data ?? null;
  } catch {
    return null;
  }
}

// ── Guardar conversación (non-blocking, no bloquea la respuesta) ──
function saveConversation(clientId: string, sessionId: string | undefined, message: string, reply: string) {
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    void (async () => {
      try {
        await supabase.from('conversations').insert({
          client_id:    clientId,
          channel:      'widget',
          contact_name: 'Visitante',
          status:       'open',
          session_id:   sessionId ?? null,
          last_message: reply.slice(0, 200),
          metadata:     { user_message: message.slice(0, 200) },
        });
      } catch { /* non-blocking */ }
    })();
  } catch { /* non-blocking */ }
}

// ── POST Handler ──────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const headers = { ...CORS, 'Content-Type': 'application/json' };

  try {
    // 1. Parsear body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'JSON inválido en el body' }, { status: 400, headers });
    }

    const { message, history = [], session_id } = body;
    if (!message?.trim()) {
      return NextResponse.json({ error: 'El campo "message" es requerido' }, { status: 400, headers });
    }

    // 2. Obtener clientId desde header
    const clientId = request.headers.get('x-client-id')?.trim();
    if (!clientId) {
      return NextResponse.json({ error: 'Header x-client-id requerido' }, { status: 401, headers });
    }

    // 3. Rate limit
    if (!rateOk(clientId)) {
      return NextResponse.json(
        { error: 'Límite de mensajes alcanzado. Intenta en 1 hora.' },
        { status: 429, headers }
      );
    }

    // 4. Cargar configuración del bot (con timeout — no bloquea si Supabase falla)
    const bot = await loadBotConfig(clientId);

    // Si el bot está explícitamente inactivo, responder sin LLM
    if (bot !== null && bot?.active === false) {
      return NextResponse.json({
        reply: 'Este asistente está temporalmente inactivo.',
        latency_ms: Date.now() - startTime,
      }, { headers });
    }

    // 5. Configurar modelo y prompt
    const MODEL_MAP: Record<string, string> = {
      'llama-3.1-8b-instant':    'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',
      'llama3-8b-8192':          'llama-3.1-8b-instant',
      'llama3-70b-8192':         'llama-3.3-70b-versatile',
      'gemma2-9b-it':            'gemma2-9b-it',
    };
    const modelKey  = MODEL_MAP[bot?.model ?? ''] ?? 'llama-3.1-8b-instant';
    const temp      = Math.min(2, Math.max(0, bot?.temperature ?? 0.7));
    const maxTok    = Math.min(2048, Math.max(64, bot?.max_tokens ?? 1024));
    const botName   = (bot?.bot_name ?? 'Asistente IA').trim();
    const lang      = bot?.language ?? 'es';

    const systemPrompt = (bot?.system_prompt ?? '').trim() || (
      lang === 'es'
        ? `Eres ${botName}, un asistente virtual amable y útil. Responde siempre en español de forma concisa. Si no sabes algo, dilo honestamente. No inventes información ni precios. Sé directo y ayuda al usuario.`
        : `You are ${botName}, a friendly and helpful virtual assistant. Always respond in English concisely and honestly.`
    );

    // 6. Construir mensajes
    const safeHistory = Array.isArray(history)
      ? history.slice(-12).filter((m: any) => m?.role && m?.content && typeof m.content === 'string')
      : [];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message.trim() },
    ];

    // 7. Llamar a Groq
    let reply = '';
    try {
      reply = await callGroq(modelKey, messages, temp, maxTok);
    } catch (llmErr: any) {
      console.error('[api/chat] LLM error:', llmErr.message);
      return NextResponse.json({
        reply: 'Lo siento, en este momento no puedo responder. Por favor intenta de nuevo en unos momentos.',
        error: llmErr.message,
        latency_ms: Date.now() - startTime,
      }, { headers });
    }

    if (!reply) {
      reply = 'No pude generar una respuesta. Por favor intenta de nuevo.';
    }

    // 8. Persistir conversación (sin bloquear la respuesta)
    saveConversation(clientId, session_id, message, reply);

    // 9. Responder
    return NextResponse.json({
      reply,
      model: modelKey,
      latency_ms: Date.now() - startTime,
    }, { headers });

  } catch (err: any) {
    console.error('[api/chat] Unhandled error:', err);
    return NextResponse.json({
      reply: 'Error interno del servidor. Por favor intenta de nuevo.',
      error: err.message,
      latency_ms: Date.now() - startTime,
    }, { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
}
