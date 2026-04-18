import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import OpenAI from "npm:openai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Rate Limiter (optional — gracefully skipped if Upstash env vars missing) ──
let ratelimit: { limit: (id: string) => Promise<{ success: boolean }> } | null = null;

const upstashUrl   = Deno.env.get("UPSTASH_REDIS_REST_URL")   || "";
const upstashToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN") || "";

if (upstashUrl && upstashToken) {
  try {
    const { Redis }     = await import("https://esm.sh/@upstash/redis@1.28.4");
    const { Ratelimit } = await import("https://esm.sh/@upstash/ratelimit@1.0.1");
    const redis = new Redis({ url: upstashUrl, token: upstashToken });
    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: true,
    });
    console.log("[CHAT] Upstash rate limiter initialized");
  } catch (e) {
    console.warn("[CHAT] Upstash init failed — rate limiting disabled:", (e as Error).message);
  }
} else {
  console.warn("[CHAT] UPSTASH env vars missing — rate limiting disabled");
}

// ── Helper: structured JSON error response ────────────────────────────────────
function jsonError(msg: string, status: number) {
  return new Response(JSON.stringify({ error: msg }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 0. Parse & validate input ────────────────────────────────────────────
    let body: { api_key?: string; message?: string; session_id?: string };
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    const { api_key, message, session_id } = body;

    if (!message?.trim()) return jsonError("Missing required field: message", 400);
    if (!session_id)       return jsonError("Missing required field: session_id", 400);
    if (!api_key && !req.headers.get("Authorization")) {
      return jsonError("Missing authentication: provide api_key or Authorization header", 401);
    }

    // ── 1. Supabase client (service role) ────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("[CHAT] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
      return jsonError("Server configuration error", 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // ── 2. Identify client (JWT → API key) ───────────────────────────────────
    let clientId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) clientId = user.id;
    }

    if (!clientId && api_key) {
      // Support both api_keys table AND x-client-id-style direct lookup
      const { data: keyData } = await supabase
        .from("api_keys")
        .select("client_id, active")
        .eq("key", api_key)
        .eq("active", true)
        .maybeSingle();

      if (keyData?.client_id) {
        clientId = keyData.client_id;
      } else {
        // Fallback: also try matching api_key = client_id directly (for widget tester)
        const { data: directClient } = await supabase
          .from("clients")
          .select("id")
          .eq("id", api_key)
          .maybeSingle();
        if (directClient) clientId = directClient.id;
      }
    }

    if (!clientId) {
      console.warn("[CHAT] Auth failed — api_key not found:", api_key?.slice(0, 8) + "...");
      return jsonError("Unauthorized: invalid api_key", 401);
    }

    // ── 3. Rate limiting (optional) ──────────────────────────────────────────
    if (ratelimit) {
      const { success } = await ratelimit.limit(clientId);
      if (!success) return jsonError("Too many requests", 429);
    }

    // ── 4. Bot config & client info ──────────────────────────────────────────
    const [{ data: botConfig }, { data: client }] = await Promise.all([
      supabase.from("bot_configs").select("*").eq("client_id", clientId).maybeSingle(),
      supabase.from("clients").select("company_name, website").eq("id", clientId).maybeSingle(),
    ]);

    if (!botConfig) {
      return jsonError("Bot not configured for this account", 503);
    }

    if (!botConfig.active) {
      return new Response(JSON.stringify({
        reply: botConfig.away_message || "El asistente no está disponible en este momento.",
        leadDetected: false,
        conversationId: null,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }

    // ── 5. Conversation ──────────────────────────────────────────────────────
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", session_id)
      .eq("client_id", clientId)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: newConvError } = await supabase
        .from("conversations")
        .insert({ session_id, client_id: clientId, channel: "web", status: "open" })
        .select()
        .single();
      if (newConvError) {
        console.error("[CHAT] Conversation insert error:", newConvError.message);
        return jsonError("Failed to create conversation: " + newConvError.message, 500);
      }
      conversation = newConv;
    }

    // ── 6. Save user message ─────────────────────────────────────────────────
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      direction: "in",
      content: message.trim(),
    });

    // ── 7. OpenAI completion ─────────────────────────────────────────────────
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error("[CHAT] OPENAI_API_KEY not set");
      return jsonError("AI service not configured", 500);
    }

    const openai = new OpenAI({ apiKey: openaiKey });

    // History (last 6 messages)
    const { data: history } = await supabase
      .from("messages")
      .select("direction, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(6);

    const chatHistory = (history ?? []).reverse().map((m) => ({
      role: m.direction === "in" ? "user" : "assistant",
      content: m.content,
    })) as { role: "user" | "assistant"; content: string }[];

    const systemPrompt =
      botConfig?.llm_config?.system_prompt ||
      botConfig?.system_prompt ||
      `Eres el asistente virtual de ${client?.company_name || "la empresa"}. ` +
      `Nombre del bot: ${botConfig?.bot_name || "Asistente"}. ` +
      `Idioma: ${botConfig?.language || "es"}. ` +
      `Sé amable, conciso y profesional. ` +
      `Si el usuario quiere cotizar o ser contactado, invítalo a dejar su nombre y email.`;

    const model = botConfig?.model || "gpt-4o-mini";

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...chatHistory],
        max_tokens: botConfig?.max_tokens || 512,
        temperature: botConfig?.temperature ?? 0.7,
      });
    } catch (openaiErr: unknown) {
      const msg = openaiErr instanceof Error ? openaiErr.message : String(openaiErr);
      console.error("[CHAT] OpenAI error:", msg);
      return jsonError("AI provider error: " + msg, 502);
    }

    const reply = completion.choices[0]?.message?.content ?? "";

    if (!reply) {
      console.error("[CHAT] Empty reply from OpenAI");
      return jsonError("Empty response from AI model", 502);
    }

    // ── 8. Lead detection ────────────────────────────────────────────────────
    const keywords = ["contacto", "cotizar", "comprar", "reunion", "agendar", "interesado", "precio", "costo", "presupuesto"];
    const leadDetected =
      keywords.some((k) => message.toLowerCase().includes(k)) ||
      reply.toLowerCase().includes("deja tus datos") ||
      reply.toLowerCase().includes("email");

    if (leadDetected) {
      await supabase.from("conversations").update({ lead_detected: true }).eq("id", conversation.id);
    }

    // ── 9. Save bot message ──────────────────────────────────────────────────
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      direction: "out",
      content: reply,
    });

    return new Response(
      JSON.stringify({ reply, leadDetected, conversationId: conversation.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[CHAT UNHANDLED ERROR]:", msg);
    return jsonError("Internal server error", 500);
  }
});
