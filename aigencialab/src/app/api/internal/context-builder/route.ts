/**
 * GET /api/internal/context-builder?client_id=xxx
 * Returns the full system prompt that would be injected for a given client.
 * Admin-only: requires ADMIN_EMAIL session or service role header.
 * Used in /admin/auditorias and /demo-empresa for architecture demonstration.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminSB } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function sb() {
  return createAdminSB(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    return (
      user.app_metadata?.role === 'admin' ||
      user.email === process.env.ADMIN_EMAIL ||
      user.email === 'admin@aigencialab.cl'
    );
  } catch { return false; }
}

export interface ContextSnapshot {
  client_id: string;
  company: string;
  bot_name: string;
  model: string;
  language: string;
  temperature: number;
  max_tokens: number;
  system_prompt_source: 'custom' | 'generated';
  system_prompt: string;
  faqs_count: number;
  faqs: { q: string; a: string }[];
  knowledge_files: { name: string; size: number; created_at: string }[];
  context_token_estimate: number;
  built_at: string;
}

export async function GET(req: NextRequest) {
  // Allow admin OR internal service header
  const serviceHeader = req.headers.get('x-service-key');
  const hasServiceKey = serviceHeader === process.env.SUPABASE_SERVICE_ROLE_KEY;
  const hasAdmin = await isAdmin();

  if (!hasAdmin && !hasServiceKey) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('client_id');

  if (!clientId) {
    return NextResponse.json({ error: 'client_id required' }, { status: 400 });
  }

  const supabase = sb();

  // Load client + bot config
  const [{ data: client }, { data: bot }] = await Promise.all([
    supabase.from('clients')
      .select('id, company_name, company, website, faqs, contact_name')
      .eq('id', clientId)
      .maybeSingle(),
    supabase.from('bot_configs')
      .select('bot_name, model, language, temperature, max_tokens, system_prompt, active, welcome_message, llm_config')
      .eq('client_id', clientId)
      .maybeSingle(),
  ]);

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  // Try to load knowledge_files if table exists
  let knowledgeFiles: { name: string; size: number; created_at: string }[] = [];
  try {
    const { data: files } = await supabase
      .from('knowledge_files')
      .select('name, size, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(10);
    knowledgeFiles = files ?? [];
  } catch { /* table may not exist yet */ }

  // Build FAQs array
  const rawFaqs = client.faqs ?? bot?.llm_config?.faqs ?? [];
  const faqs: { q: string; a: string }[] = Array.isArray(rawFaqs) ? rawFaqs : [];

  // Build system prompt
  const company = client.company_name || client.company || 'la empresa';
  const language = bot?.language ?? 'es';
  const botName  = bot?.bot_name  ?? 'Asistente IA';
  const website  = client.website ?? '';

  const customPrompt = (bot?.system_prompt ?? '').trim();

  let systemPrompt: string;
  let source: 'custom' | 'generated';

  if (customPrompt) {
    systemPrompt = customPrompt;
    source = 'custom';
  } else {
    // Generated prompt with FAQ injection
    const faqBlock = faqs.length
      ? `\n\n---\nBASE DE CONOCIMIENTOS (responde basándote en esto):\n${faqs.map((f, i) => `${i + 1}. P: ${f.q}\n   R: ${f.a}`).join('\n')}\n---`
      : '';

    const fileBlock = knowledgeFiles.length
      ? `\n\nDocumentos disponibles: ${knowledgeFiles.map(f => f.name).join(', ')}`
      : '';

    systemPrompt =
      `Eres ${botName}, el asistente virtual de ${company}. ` +
      `Atiendes en ${language === 'es' ? 'español' : language}. ` +
      (website ? `El sitio web del cliente es ${website}. ` : '') +
      `Sé amable, conciso y profesional. ` +
      `Si no sabes algo, di que transferirás al equipo humano. ` +
      `NO inventes información que no esté en la base de conocimientos.` +
      faqBlock +
      fileBlock;

    source = 'generated';
  }

  // Rough token estimate (4 chars ≈ 1 token)
  const tokenEstimate = Math.round(systemPrompt.length / 4);

  const snapshot: ContextSnapshot = {
    client_id:               clientId,
    company,
    bot_name:                bot?.bot_name    ?? 'Asistente IA',
    model:                   bot?.model       ?? 'llama-3.1-8b-instant',
    language,
    temperature:             bot?.temperature ?? 0.7,
    max_tokens:              bot?.max_tokens  ?? 512,
    system_prompt_source:    source,
    system_prompt:           systemPrompt,
    faqs_count:              faqs.length,
    faqs,
    knowledge_files:         knowledgeFiles,
    context_token_estimate:  tokenEstimate,
    built_at:                new Date().toISOString(),
  };

  return NextResponse.json(snapshot);
}
