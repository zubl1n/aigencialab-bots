import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { to, subject, type, data } = await req.json();

    let html = "";
    if (type === "welcome") {
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #0066CC;">¡Bienvenido a AIgenciaLab!</h1>
          <p>Hola <strong>${data.name}</strong>,</p>
          <p>Gracias por registrarte. Estamos emocionados de ayudarte a automatizar tu negocio con IA.</p>
          <p>Por favor, confirma tu email para comenzar el onboarding.</p>
          <a href="${data.url}" style="display: inline-block; padding: 12px 24px; background-color: #0066CC; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirmar Email</a>
          <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">AIgenciaLab Team</p>
        </div>
      `;
    } else if (type === "onboarding_complete") {
      html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">Onboarding Completado</h2>
          <p>El cliente <strong>${data.company_name}</strong> ha terminado la configuración.</p>
          <p><strong>Bot:</strong> ${data.bot_name}</p>
          <p><strong>Email:</strong> ${to}</p>
          <p>Revisa el dashboard de administración para activar el servicio.</p>
        </div>
      `;
    }

    const { data: emailData, error } = await resend.emails.send({
      from: "AIgenciaLab <onboarding@aigencialab.com>",
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) throw error;

    return new Response(JSON.stringify(emailData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
