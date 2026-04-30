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
    const url = new URL(req.url);
    const apiKey = url.searchParams.get("api_key");

    if (!apiKey) {
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
      .eq("key", apiKey)
      .single();

    if (keyError || !keyData) {
      const authError = new Error("UNAUTHORIZED");
      authError.name = "AuthError";
      throw authError;
    }

    // 2. Get Bot Config
    const { data: botConfig, error: botError } = await supabase
      .from("bot_configs")
      .select("bot_name, active, widget_color, language, welcome_message")
      .eq("client_id", keyData.client_id)
      .single();

    if (botError) throw botError;

    return new Response(JSON.stringify(botConfig), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[BOT-CONFIG ERROR]:", error.message);
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
