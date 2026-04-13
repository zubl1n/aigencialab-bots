import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { api_key, name, email, conversation_id } = await req.json();

    if (!api_key || !name || !email) {
      const authError = new Error("UNAUTHORIZED");
      authError.name = "AuthError";
      throw authError;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Validate API Key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("client_id")
      .eq("key", api_key)
      .single();

    if (keyError || !keyData) {
      const authError = new Error("UNAUTHORIZED");
      authError.name = "AuthError";
      throw authError;
    }

    // 2. Check if it's a demo bot
    const { data: botConfig } = await supabase
      .from("bot_configs")
      .select("id, is_demo")
      .eq("client_id", keyData.client_id)
      .single();

    if (botConfig?.is_demo) {
      // Insert into demo_leads
      const { data: lead, error: leadError } = await supabase
        .from("demo_leads")
        .insert({
          bot_id: botConfig.id,
          name: name,
          email: email,
          conversation_id: conversation_id,
          metadata: { source: 'demo_widget' }
        })
        .select()
        .single();
      
      if (leadError) throw leadError;

      return new Response(JSON.stringify({ success: true, lead, type: 'demo' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 3. Insert Regular Lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        client_id: keyData.client_id,
        contact_name: name,
        email: email,
        conversation_id: conversation_id,
        source: 'landing',
        status: 'new'
      })
      .select()
      .single();

    if (leadError) throw leadError;

    return new Response(JSON.stringify({ success: true, lead }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CAPTURE-LEAD ERROR]:", error.message);
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
