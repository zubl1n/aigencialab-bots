import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import OpenAI from "npm:openai";
import { Redis } from "https://esm.sh/@upstash/redis@1.28.4";
import { Ratelimit } from "https://esm.sh/@upstash/ratelimit@1.0.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 0. Initialize Rate Limiter (Upstash Redis)
const redis = new Redis({
  url: Deno.env.get("UPSTASH_REDIS_REST_URL") || "",
  token: Deno.env.get("UPSTASH_REDIS_REST_TOKEN") || "",
});

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "60 s"),
  analytics: true,
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { api_key, message, session_id } = await req.json();

    if ((!api_key && !req.headers.get("Authorization")) || !message || !session_id) {
      throw new Error("Missing required fields: api_key (or auth token), message, session_id");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Identify Client (JWT or API Key)
    let clientId: string | null = null;
    const authHeader = req.headers.get("Authorization");

    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) clientId = user.id;
    }

    if (!clientId && api_key) {
      const { data: keyData, error: keyError } = await supabase
        .from("api_keys")
        .select("client_id")
        .eq("key", api_key)
        .single();
      if (!keyError && keyData) {
        clientId = keyData.client_id;
      }
    }

    if (!clientId) {
      const authError = new Error("UNAUTHORIZED");
      authError.name = "AuthError";
      throw authError;
    }

    // 2. Perform Rate Limiting
    const identifier = clientId; // Limit per client
    const { success } = await ratelimit.limit(identifier);

    if (!success) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 429,
      });
    }

    // 3. Get Bot Config & Client info
    const { data: botConfig } = await supabase
      .from("bot_configs")
      .select("*")
      .eq("client_id", clientId)
      .single();
    
    const { data: client } = await supabase
      .from("clients")
      .select("company_name, website")
      .eq("id", clientId)
      .single();

    // 4. Get or Create Conversation
    let { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("session_id", session_id)
      .eq("client_id", clientId)
      .maybeSingle();

    if (!conversation) {
      const { data: newConv, error: newConvError } = await supabase
        .from("conversations")
        .insert({
          session_id,
          client_id: clientId,
          channel: 'web',
          status: 'open'
        })
        .select()
        .single();
      if (newConvError) throw newConvError;
      conversation = newConv;
    }

    // 5. Save User Message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      direction: 'in',
      content: message
    });

    // 6. Call OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    // Get history for context (last 5 messages)
    const { data: history } = await supabase
      .from("messages")
      .select("direction, content")
      .eq("conversation_id", conversation.id)
      .order("timestamp", { ascending: false })
      .limit(6);

    const chatHistory = history?.reverse().map(m => ({
      role: m.direction === 'in' ? 'user' : 'assistant',
      content: m.content
    })) || [];

    const customPrompt = botConfig?.llm_config?.system_prompt;
    const systemPrompt = customPrompt || `Eres un asistente virtual de ${client?.company_name || 'AIgenciaLab'}. 
    Tu objetivo es ayudar a los visitantes de su sitio web (${client?.website || ''}).
    
    Configuración:
    - Nombre: ${botConfig?.bot_name || 'Asistente'}
    - Bienvenida: ${botConfig?.welcome_message}
    - Idioma: ${botConfig?.language || 'es'}
    
    Pautas:
    - Sé amable, conciso y profesional.
    - Si el usuario muestra interés en contratar, cotizar o dejar datos, dile que puede dejar su nombre y correo para ser contactado.
    - Si detectas que el usuario quiere ser contactado, incluye discretamente la mención de "deja tus datos" o algo similar para activar el formulario.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory
      ],
    });

    const reply = completion.choices[0].message.content;

    // 7. Simple Lead Detection Logic
    const keywords = ['contacto', 'cotizar', 'comprar', 'reunion', 'agendar', 'interesado', 'precio', 'costo'];
    const userInterested = keywords.some(k => message.toLowerCase().includes(k));
    const botPrompted = reply?.toLowerCase().includes("deja tus datos") || reply?.toLowerCase().includes("email");
    
    let leadDetected = false;
    if (userInterested || botPrompted) {
      leadDetected = true;
      await supabase.from("conversations").update({ lead_detected: true }).eq("id", conversation.id);
    }

    // 8. Save Bot Message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      direction: 'out',
      content: reply
    });

    return new Response(JSON.stringify({ 
      reply, 
      leadDetected,
      conversationId: conversation.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CHAT ERROR]:", error.message);
    const isAuthError = error.name === "AuthError";
    return new Response(
      JSON.stringify({ error: isAuthError ? "Unauthorized" : "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: isAuthError ? 401 : 500,
      }
    );
  }
});

