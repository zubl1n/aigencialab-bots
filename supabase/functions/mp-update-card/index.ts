import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })

  return new Response(
    JSON.stringify({ url: "https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=b2a75ff35c44491f81721b5134112f19" }),
    { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
  )
})
