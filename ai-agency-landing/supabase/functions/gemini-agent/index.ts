// ═══════════════════════════════════════════════════════════════
//  AigenciaLab.cl — GEMINI AGENT EDGE FUNCTION v1.0
//  /supabase/functions/gemini-agent/index.ts
//
//  Deploy:  npx supabase functions deploy gemini-agent
//  Env vars en Supabase Dashboard → Settings → Edge Functions:
//    GEMINI_API_KEY            (Google AI Studio → aistudio.google.com)
//    SUPABASE_URL              (auto-provisioned)
//    SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role key)
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ── CORS ─────────────────────────────────────────────────────── */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  "Content-Type": "application/json",
};

const GEMINI_MODEL = "gemini-1.5-flash-latest";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/* ══════════════════════════════════════════════════════════════
   1. SYSTEM INSTRUCTION — Cerebro del Agente Nova
   ══════════════════════════════════════════════════════════════ */
const SYSTEM_INSTRUCTION = {
  role: "user",
  parts: [{
    text: `Eres Nova, Agente Experta de Ventas de AigenciaLab.cl — agencia chilena de automatización con IA B2B.

TONO: Profesional, consultivo, chileno neutro. Directo y conciso (máx 3 líneas por respuesta). Persuasivo sin presión. Máx 2 emojis por mensaje.

CATÁLOGO (SOLO estos precios, nunca inventes):
• Plan Starter: UF 5/mes + Setup UF 6 (60% OFF sobre UF 15)
• Plan Pro: UF 12/mes + Setup UF 14 (60% OFF sobre UF 35) — RECOMENDADO
• Plan Enterprise: UF 28/mes + Setup UF 32 (60% OFF sobre UF 80)
• Auditoría Gratuita: aigencialab.cl/audit/

REGLAS ABSOLUTAS:
1. NUNCA inventes precios ni características fuera del catálogo.
2. Prioridad #1: capturar el lead (nombre + empresa + WhatsApp) usando registrar_lead_calificado.
3. Si no sabes algo → usar derivar_a_humano, nunca inventar.
4. Si detectas frustración o urgencia → derivar_a_humano inmediatamente.
5. Nunca digas que eres GPT, OpenAI o cualquier otro modelo. Eres Nova.
6. Cumples Ley N°21.663 Chile — no solicites RUT ni datos bancarios.

ROI PARA OBJECIONES DE PRECIO:
• Agente IA 24/7 vs costo CS humano mínimo $800.000 CLP/mes
• Plan Pro ($456.000 CLP) = 43% más barato que 1 ejecutivo
• ROI estimado 250-400% en 6 meses para ecommerce

FLUJO IDEAL: Saludo → Identificar dolor → Solución relevante → Capturar lead → Ofrecer Auditoría Gratuita`,
  }],
};

/* ══════════════════════════════════════════════════════════════
   2. HERRAMIENTAS (Function Calling)
   ══════════════════════════════════════════════════════════════ */
const TOOLS = [{
  functionDeclarations: [
    {
      name: "registrar_lead_calificado",
      description:
        "Registra un prospecto calificado en Supabase cuando tiene nombre + empresa + contacto. Llamar SIEMPRE que el usuario proporcione sus datos de contacto.",
      parameters: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING", description: "Nombre completo del prospecto" },
          empresa: { type: "STRING", description: "Nombre de la empresa" },
          whatsapp: { type: "STRING", description: "WhatsApp formato +569XXXXXXXX" },
          email: { type: "STRING", description: "Email (opcional)" },
          dolor_principal: {
            type: "STRING",
            description: "Problema o necesidad principal expresada por el prospecto",
          },
          plan_interes: {
            type: "STRING",
            enum: ["starter", "pro", "enterprise", "sin_definir"],
            description: "Plan de mayor interés según la conversación",
          },
          score_calificacion: {
            type: "NUMBER",
            description: "Puntuación 0-100. 100=listo para comprar, 0=solo curiosidad",
          },
        },
        required: ["nombre", "empresa", "dolor_principal"],
      },
    },
    {
      name: "consultar_estado_ticket",
      description:
        "Consulta el estado de un ticket de soporte usando su ID numérico o alfanumérico.",
      parameters: {
        type: "OBJECT",
        properties: {
          ticket_id: { type: "STRING", description: "ID del ticket (ej: TK-1234 o 4521)" },
          cliente_empresa: {
            type: "STRING",
            description: "Empresa del cliente para validar acceso (opcional)",
          },
        },
        required: ["ticket_id"],
      },
    },
    {
      name: "derivar_a_humano",
      description:
        "Escala la conversación a un agente humano cuando la IA no puede resolver la consulta, hay frustración, reclamo grave o negociación personalizada.",
      parameters: {
        type: "OBJECT",
        properties: {
          motivo_escalamiento: {
            type: "STRING",
            description: "Razón exacta del escalamiento",
          },
          urgencia: {
            type: "STRING",
            enum: ["alta", "media", "baja"],
            description: "Nivel de urgencia",
          },
          resumen_conversacion: {
            type: "STRING",
            description: "Resumen para el agente humano",
          },
        },
        required: ["motivo_escalamiento", "urgencia"],
      },
    },
  ],
}];

/* ══════════════════════════════════════════════════════════════
   3. EJECUTORES DE HERRAMIENTAS
   ══════════════════════════════════════════════════════════════ */
type SupabaseClient = ReturnType<typeof createClient>;

async function executeTool(
  name: string,
  args: Record<string, unknown>,
  supabase: SupabaseClient,
): Promise<unknown> {
  console.log(`[Tool:${name}]`, JSON.stringify(args));

  // ── registrar_lead_calificado ─────────────────────────────
  if (name === "registrar_lead_calificado") {
    const {
      nombre, empresa, whatsapp = "", email = "",
      dolor_principal, plan_interes = "sin_definir", score_calificacion,
    } = args as Record<string, string | number>;

    const score = typeof score_calificacion === "number"
      ? Math.min(100, Math.max(0, score_calificacion))
      : 75;
    const tier = score >= 80 ? "hot" : score >= 50 ? "warm" : "cold";

    const { data, error } = await supabase.from("leads").insert({
      company: empresa,
      contact_name: nombre,
      whatsapp: whatsapp,
      email: email,
      source: "chatbot",
      tier,
      score,
      notes: `[Nova/Gemini] Dolor: ${dolor_principal}. Plan: ${plan_interes}.`,
      created_at: new Date().toISOString(),
    }).select("id").single();

    if (error) {
      console.error("[Tool] Supabase insert error:", error.message);
      return { success: false, message: "Error al registrar. La conversación continúa." };
    }
    return {
      success: true,
      lead_id: data?.id,
      mensaje: `Lead de ${nombre} (${empresa}) registrado. Tier: ${tier}.`,
    };
  }

  // ── consultar_estado_ticket ───────────────────────────────
  if (name === "consultar_estado_ticket") {
    const { ticket_id } = args as { ticket_id: string };
    const cleanId = String(ticket_id).replace(/[^a-zA-Z0-9-]/g, "").toUpperCase();

    const { data } = await supabase.from("leads")
      .select("id, company, tier, notes, created_at")
      .ilike("notes", `%${cleanId}%`)
      .limit(1).maybeSingle();

    if (!data) {
      return {
        found: false,
        mensaje: `No encontré el ticket ${cleanId}. Verifica el número o contacta a soporte.`,
      };
    }
    const estados: Record<string, string> = {
      hot: "En proceso — alta prioridad",
      warm: "En revisión",
      cold: "Pendiente de asignación",
    };
    return {
      found: true,
      ticket_id: cleanId,
      estado: estados[data.tier] ?? "En proceso",
      empresa: data.company,
      fecha_creacion: new Date(data.created_at).toLocaleDateString("es-CL"),
    };
  }

  // ── derivar_a_humano ──────────────────────────────────────
  if (name === "derivar_a_humano") {
    const { motivo_escalamiento, urgencia, resumen_conversacion = "" } =
      args as Record<string, string>;

    await supabase.from("leads").insert({
      company: `ESCALAMIENTO_${Date.now()}`,
      contact_name: "Derivación Automática",
      source: "chatbot",
      tier: urgencia === "alta" ? "hot" : "warm",
      score: urgencia === "alta" ? 90 : 60,
      notes: `[ESCALAR ${urgencia.toUpperCase()}] ${motivo_escalamiento}. Resumen: ${resumen_conversacion}`,
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      mensaje: "Escalamiento registrado. Equipo notificado.",
      instruccion: "Informa al usuario que un ejecutivo lo contactará en breve por WhatsApp.",
    };
  }

  return { error: `Herramienta desconocida: ${name}` };
}

/* ══════════════════════════════════════════════════════════════
   4. LLAMADA A GEMINI CON RETRY (Exponential Backoff)
   ══════════════════════════════════════════════════════════════ */
async function callGemini(
  payload: object,
  apiKey: string,
  attempt = 0,
): Promise<Response> {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok && attempt < 2) {
    await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    return callGemini(payload, apiKey, attempt + 1);
  }
  return res;
}

/* ══════════════════════════════════════════════════════════════
   5. BUCLE PRINCIPAL — Agent Execution Loop
   texto ──► [Gemini] ──► functionCall ──► execute ──► [Gemini] ──► texto final
   ══════════════════════════════════════════════════════════════ */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método no permitido" }), { status: 405, headers: CORS });
  }

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY no configurada" }), {
      status: 500, headers: CORS,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Parse body
  let userMessage: string, history: unknown[], context: Record<string, string>;
  try {
    const body = await req.json();
    userMessage = String(body.userMessage ?? "").trim();
    history = Array.isArray(body.history) ? body.history : [];
    context = body.context ?? {};
  } catch {
    return new Response(JSON.stringify({ error: "Body JSON inválido" }), { status: 400, headers: CORS });
  }

  // Validaciones básicas
  if (!userMessage || userMessage.length > 2000) {
    return new Response(JSON.stringify({ error: "Mensaje vacío o demasiado largo" }), {
      status: 400, headers: CORS,
    });
  }

  // Anti-Prompt Injection
  const BLOCKED_RX = [
    /ignore\s+(previous|all|above|system)/i,
    /act\s+as\s+(a\s+)?(different|new)/i,
    /system\s*prompt/i,
    /reveal\s+your\s+instructions/i,
    /jailbreak/i,
  ];
  if (BLOCKED_RX.some((rx) => rx.test(userMessage))) {
    return new Response(
      JSON.stringify({ text: "No puedo procesar esa solicitud. ¿En qué más puedo ayudarte? 😊" }),
      { headers: CORS },
    );
  }

  // Construir contents con historial + namespace de contexto del cliente
  const contextNote = context.companyName
    ? `\n[Contexto: Este agente está configurado para ${context.companyName}]`
    : "";

  const contents = [
    SYSTEM_INSTRUCTION,
    ...history,
    { role: "user", parts: [{ text: userMessage + contextNote }] },
  ];

  const basePayload = {
    contents,
    tools: TOOLS,
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ],
    generationConfig: {
      temperature: 0.75,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
      candidateCount: 1,
    },
  };

  try {
    // ── Primera llamada Gemini ────────────────────────────────
    const firstRes = await callGemini(basePayload, GEMINI_API_KEY);
    if (!firstRes.ok) {
      console.error("[Gemini] HTTP", firstRes.status, await firstRes.text());
      return new Response(
        JSON.stringify({ text: "Estoy teniendo problemas técnicos momentáneos. ¿Podrías intentar de nuevo? 🙏" }),
        { headers: CORS },
      );
    }

    const firstJson = await firstRes.json();
    const candidate = firstJson.candidates?.[0];
    if (!candidate) {
      return new Response(
        JSON.stringify({ text: "No pude generar una respuesta. ¿Reformulas tu pregunta?" }),
        { headers: CORS },
      );
    }

    const parts = candidate.content?.parts ?? [];
    const textPart = parts.find((p: { text?: string }) => typeof p.text === "string");
    const fnCallPart = parts.find((p: { functionCall?: unknown }) => p.functionCall);

    // CASO A: Respuesta de texto directo ──────────────────────
    if (textPart && !fnCallPart) {
      const newHistory = [
        ...history,
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: textPart.text }] },
      ];
      return new Response(
        JSON.stringify({ text: textPart.text, history: newHistory }),
        { headers: CORS },
      );
    }

    // CASO B: Function Call → ejecutar → segunda llamada ─────
    if (fnCallPart?.functionCall) {
      const { name, args } = fnCallPart.functionCall as {
        name: string;
        args: Record<string, unknown>;
      };

      console.log(`[AgentLoop] FunctionCall: ${name}`);
      const toolResult = await executeTool(name, args ?? {}, supabase);

      // Segunda llamada con el resultado de la función
      const secondPayload = {
        ...basePayload,
        contents: [
          ...basePayload.contents,
          { role: "model", parts: [{ functionCall: { name, args } }] },
          { role: "user", parts: [{ functionResponse: { name, response: toolResult } }] },
        ],
      };

      const secondRes = await callGemini(secondPayload, GEMINI_API_KEY);
      const secondJson = secondRes.ok ? await secondRes.json() : null;
      const finalText: string =
        secondJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Acción completada. ¿En qué más puedo ayudarte? 😊";

      const newHistory = [
        ...history,
        { role: "user", parts: [{ text: userMessage }] },
        { role: "model", parts: [{ text: finalText }] },
      ];

      return new Response(
        JSON.stringify({ text: finalText, toolExecuted: name, toolResult, history: newHistory }),
        { headers: CORS },
      );
    }

    // CASO C: Respuesta bloqueada / vacía ─────────────────────
    return new Response(
      JSON.stringify({ text: "No puedo responder eso. ¿Tienes alguna pregunta sobre nuestros servicios? 😊" }),
      { headers: CORS },
    );
  } catch (err) {
    console.error("[EdgeFn] Error:", err);
    return new Response(
      JSON.stringify({ text: "Error interno. Por favor intenta de nuevo." }),
      { status: 500, headers: CORS },
    );
  }
});
