/**
 * POST /api/chat
 * Real AI chat endpoint — calls LLM using the bot's config from DB.
 * Supports: gpt-4o-mini (OpenAI), llama3-8b-8192 (Groq free), gemini-1.5-flash (Google free)
 *
 * Auth: x-client-id header (from widget) OR api_key in body
 * No sessions required — widget uses client_id directly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY    = process.env.OPENAI_API_KEY        ?? '';
const GROQ_KEY      = process.env.GROQ_API_KEY          ?? '';
const GEMINI_KEY    = process.env.GEMINI_API_KEY        ?? '';

// Free/low-cost models supported (updated April 2025 — old llama3/mixtral decommissioned by Groq)
const MODEL_CONFIGS: Record<string, { provider: 'openai' | 'groq' | 'gemini'; model: string }> = {
  // ─── Groq (free tier) — ACTIVE models ───────────────────
  'llama-3.1-8b-instant':      { provider: 'groq',   model: 'llama-3.1-8b-instant' },
  'llama-3.3-70b-versatile':   { provider: 'groq',   model: 'llama-3.3-70b-versatile' },
  'llama-3.1-70b-versatile':   { provider: 'groq',   model: 'llama-3.1-70b-versatile' },
  'gemma2-9b-it':              { provider: 'groq',   model: 'gemma2-9b-it' },
  'compound-beta':             { provider: 'groq',   model: 'compound-beta' },
  // ─── Legacy aliases → map to active models ───────────────
  'llama3-8b-8192':            { provider: 'groq',   model: 'llama-3.1-8b-instant' },
  'llama3-70b-8192':           { provider: 'groq',   model: 'llama-3.3-70b-versatile' },
  'mixtral-8x7b-32768':        { provider: 'groq',   model: 'llama-3.1-8b-instant' },
  // ─── Google Gemini ────────────────────────────────────────
  'gemini-1.5-flash':          { provider: 'gemini', model: 'gemini-1.5-flash' },
  'gemini-2.0-flash':          { provider: 'gemini', model: 'gemini-2.0-flash' },
  // ─── OpenAI (optional, needs OPENAI_API_KEY) ─────────────
  'gpt-4o-mini':               { provider: 'openai', model: 'gpt-4o-mini' },
  'gpt-3.5-turbo':             { provider: 'openai', model: 'gpt-3.5-turbo' },
};

const DEFAULT_MODEL = 'llama-3.1-8b-instant'; // Groq free — always available

// Rate limiting: simple in-memory store (resets on serverless restart — sufficient for basic protection)
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

function checkRateLimit(clientId: string, limitPerHour = 100): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + 3_600_000 });
    return true;
  }
  if (entry.count >= limitPerHour) return false;
  entry.count++;
  return true;
}

/** Call OpenAI-compatible API */
async function callOpenAI(
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY no configurada');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/** Call Groq API (OpenAI-compatible) */
async function callGroq(
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  if (!GROQ_KEY) throw new Error('GROQ_API_KEY no configurada');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Groq ${res.status}: ${err?.error?.message ?? res.statusText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

/** Call Google Gemini API */
async function callGemini(
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
): Promise<string> {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY no configurada');
  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
  const systemInstruction = messages.find(m => m.role === 'system')?.content ?? '';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents,
        generation_config: { temperature, max_output_tokens: maxTokens },
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { message, history = [], api_key, session_id } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'message requerido' }, { status: 400 });
    }

    // Identify client: x-client-id header (widget) OR api_key in body
    const clientIdHeader = request.headers.get('x-client-id');
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let clientId: string | null = clientIdHeader ?? null;

    // If api_key provided, resolve client_id from api_keys table
    if (!clientId && api_key) {
      const { data: keyRow } = await supabase
        .from('api_keys')
        .select('client_id, active')
        .eq('key', api_key)
        .maybeSingle();
      if (!keyRow?.active) {
        return NextResponse.json({ error: 'API key inválida o inactiva' }, { status: 401 });
      }
      clientId = keyRow.client_id;
    }

    if (!clientId) {
      return NextResponse.json({ error: 'Se requiere x-client-id o api_key' }, { status: 401 });
    }

    // Rate limiting
    if (!checkRateLimit(clientId, 200)) {
      return NextResponse.json({ error: 'Límite de mensajes alcanzado. Intenta en 1 hora.' }, { status: 429 });
    }

    // Load bot config
    const { data: bot, error: botErr } = await supabase
      .from('bot_configs')
      .select('active, model, temperature, max_tokens, system_prompt, bot_name, language, welcome_message')
      .eq('client_id', clientId)
      .maybeSingle();

    if (botErr) {
      console.error('[api/chat] bot config error:', botErr.message);
    }

    // If bot is inactive, return polite refusal
    if (bot && !bot.active) {
      return NextResponse.json({
        reply: 'Este asistente está temporalmente inactivo. Vuelve más tarde.',
        latency_ms: Date.now() - startTime,
      });
    }

    // Resolve model config
    const modelKey = bot?.model ?? DEFAULT_MODEL;
    const modelCfg = MODEL_CONFIGS[modelKey] ?? MODEL_CONFIGS[DEFAULT_MODEL];
    const temperature = Math.min(2, Math.max(0, bot?.temperature ?? 0.7));
    const maxTokens   = Math.min(4096, Math.max(64, bot?.max_tokens ?? 512));

    // Build system prompt
    const language = bot?.language ?? 'es';
    const botName  = bot?.bot_name ?? 'Asistente IA';
    const customSystemPrompt = bot?.system_prompt ?? '';

    const defaultSystem = language === 'es'
      ? `Eres ${botName}, un asistente virtual de atención al cliente. Responde siempre en español de manera amable, concisa y útil. Si no sabes algo, dilo honestamente. No inventes información.`
      : `You are ${botName}, a customer service virtual assistant. Always respond in English in a friendly, concise and helpful way.`;

    const systemPrompt = customSystemPrompt.trim()
      ? customSystemPrompt
      : defaultSystem;

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
      // Include recent history (max last 10 turns = 20 messages)
      ...history.slice(-20).filter((m: any) => m.role && m.content),
      { role: 'user', content: message.trim() },
    ];

    // Call LLM
    let reply = '';
    try {
      switch (modelCfg.provider) {
        case 'openai':
          reply = await callOpenAI(modelCfg.model, messages, temperature, maxTokens);
          break;
        case 'groq':
          reply = await callGroq(modelCfg.model, messages, temperature, maxTokens);
          break;
        case 'gemini':
          reply = await callGemini(modelCfg.model, messages, temperature, maxTokens);
          break;
        default:
          reply = await callOpenAI(DEFAULT_MODEL, messages, temperature, maxTokens);
      }
    } catch (llmErr: any) {
      console.error(`[api/chat] LLM error (${modelCfg.provider}/${modelCfg.model}):`, llmErr.message);
      // Graceful fallback message
      return NextResponse.json({
        reply: 'Lo siento, en este momento no puedo responder. Por favor intenta de nuevo en unos momentos.',
        error: llmErr.message,
        latency_ms: Date.now() - startTime,
      });
    }

    // Save conversation to DB (non-blocking)
    void Promise.resolve(
      supabase.from('conversations').insert({
        client_id:    clientId,
        channel:      'widget',
        contact_name: 'Visitante',
        status:       'open',
        session_id:   session_id ?? null,
        last_message: message.slice(0, 200),
      })
    ).catch(() => {});

    return NextResponse.json({
      reply: reply.trim(),
      model: `${modelCfg.provider}/${modelCfg.model}`,
      latency_ms: Date.now() - startTime,
    });

  } catch (err: any) {
    console.error('[api/chat] fatal error:', err.message);
    return NextResponse.json({ error: err.message ?? 'Error interno' }, { status: 500 });
  }
}

// CORS preflight for cross-origin widget usage
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-client-id',
    },
  });
}
