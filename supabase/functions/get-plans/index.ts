import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const plans = [
    {
      id: "pro",
      name: "Pro",
      description: "Ideal para la mayoría de las empresas que buscan automatización estable",
      price: 29990,
      currency: "CLP",
      features: [
        "1 Chatbot Activo Integrado",
        "1.000 Contactos por mes",
        "Entrenamiento Base",
        "Soporte Estándar",
        "Panel Estadísticas"
      ],
      mp_plan_id: Deno.env.get("MP_PLAN_PRO_ID") || "b2a75ff35c44491f81721b5134112f19"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Para grandes operaciones con necesidades extremas",
      price: 99990,
      currency: "CLP",
      features: [
        "Múltiples Chatbots",
        "10.000 Contactos por mes",
        "Entrenamiento Personalizado",
        "Soporte Dedicado Prioritario",
        "Marca Blanca Total"
      ],
      mp_plan_id: Deno.env.get("MP_PLAN_ENTERPRISE_ID") || "c579d6146d16485ba450b55e2ee10613"
    }
  ]

  return new Response(
    JSON.stringify(plans),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  )
})
