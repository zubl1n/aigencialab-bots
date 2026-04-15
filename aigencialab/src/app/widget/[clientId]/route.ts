import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: bot } = await supabase
    .from('bot_configs')
    .select('active, widget_color, welcome_message, name, bot_name, language')
    .eq('client_id', clientId)
    .single()

  const color    = bot?.widget_color ?? '#7C3AED'
  const botName  = bot?.bot_name || bot?.name || 'Asistente IA'
  const welcome  = bot?.welcome_message || '¡Hola! ¿En qué puedo ayudarte hoy?'
  const apiBase  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'
  const inactive = bot && !bot.active

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${botName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,system-ui,sans-serif;background:#0A0A0F;color:#F1F0F5;display:flex;flex-direction:column;height:100vh;overflow:hidden}
  .header{background:#111118;border-bottom:1px solid rgba(255,255,255,0.08);padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
  .avatar{width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px}
  .bot-info{flex:1}
  .bot-name{font-weight:700;font-size:14px;color:#F1F0F5}
  .bot-status{font-size:11px;color:#6B6480;display:flex;align-items:center;gap:4px}
  .dot{width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block}
  .messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .msg{max-width:80%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;animation:fadeUp .2s ease}
  .msg.bot{background:#16161E;border:1px solid rgba(255,255,255,0.06);color:#F1F0F5;align-self:flex-start;border-bottom-left-radius:4px}
  .msg.user{background:${color};color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  .typing{display:flex;gap:4px;align-items:center;padding:10px 14px;background:#16161E;border:1px solid rgba(255,255,255,0.06);border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start}
  .typing span{width:6px;height:6px;border-radius:50%;background:#6B6480;animation:bounce 1.2s infinite}
  .typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
  .form-area{flex-shrink:0;border-top:1px solid rgba(255,255,255,0.08);background:#0A0A0F}
  .lead-form{padding:16px;background:#111118}
  .lead-form p{font-size:12px;color:#A09CB0;margin-bottom:10px}
  .lead-form input{width:100%;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px 12px;color:#F1F0F5;font-size:13px;margin-bottom:8px}
  .lead-form input::placeholder{color:#6B6480}
  #lead-btn{background:${color};border:none;color:#fff;padding:10px 20px;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;width:100%}
  .input-row{display:flex;gap:8px;padding:12px 14px;align-items:center}
  #chat-input{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:10px 12px;color:#F1F0F5;font-size:13px;outline:none;resize:none;max-height:80px}
  #chat-input:focus{border-color:${color}}
  #send-btn{background:${color};border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  #send-btn:hover{opacity:0.85}
  #send-btn svg{width:16px;height:16px}
  @keyframes fadeUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
  .offline{flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#6B6480;font-size:14px}
</style>
</head>
<body>
<div class="header">
  <div class="avatar">🤖</div>
  <div class="bot-info">
    <div class="bot-name">${botName}</div>
    <div class="bot-status">${inactive ? '<span style="color:#f87171">⛔ Bot temporalmente inactivo</span>' : '<span class="dot"></span> En línea · Responde al instante'}</div>
  </div>
</div>
${inactive ? `<div class="offline"><span style="font-size:36px">😴</span><p>Este asistente está pausado temporalmente.</p></div>` : `
<div class="messages" id="msgs">
  <div class="msg bot">${welcome}</div>
</div>
<div class="form-area">
  <div id="lead-capture" class="lead-form" style="display:none">
    <p>Para continuar, déjanos tu información:</p>
    <input id="li-name" placeholder="Tu nombre *" />
    <input id="li-email" type="email" placeholder="Email" />
    <input id="li-phone" placeholder="WhatsApp / Teléfono" />
    <button id="lead-btn" onclick="submitLead()">Continuar la conversación →</button>
  </div>
  <div id="chat-row" class="input-row">
    <textarea id="chat-input" placeholder="Escribe tu consulta…" rows="1"></textarea>
    <button id="send-btn" onclick="sendMessage()" aria-label="Enviar">
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M22 2 11 13M22 2l-7 20-4-7-7-4 20-7z"/></svg>
    </button>
  </div>
</div>
<script>
var CLIENT_ID='${clientId}',API_BASE='${apiBase}',leadSaved=false,msgCount=0,history=[];
var msgs=document.getElementById('msgs'),input=document.getElementById('chat-input');
function addMsg(text,role){var d=document.createElement('div');d.className='msg '+role;d.textContent=text;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;}
function showTyping(){var t=document.createElement('div');t.className='typing';t.id='typing';t.innerHTML='<span></span><span></span><span></span>';msgs.appendChild(t);msgs.scrollTop=msgs.scrollHeight;return t;}
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
async function sendMessage(){
  var text=input.value.trim();if(!text)return;
  input.value='';addMsg(text,'user');history.push({role:'user',content:text});msgCount++;
  if(msgCount===2&&!leadSaved){
    var t=showTyping();await new Promise(r=>setTimeout(r,1000));t.remove();
    addMsg('Antes de continuar, ¿me dejas tus datos de contacto?','bot');
    history.push({role:'assistant',content:'Datos de contacto'});
    document.getElementById('lead-capture').style.display='block';
    document.getElementById('chat-row').style.display='none';return;
  }
  var t=showTyping();
  try{
    var res=await fetch(API_BASE+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json','x-client-id':CLIENT_ID},body:JSON.stringify({message:text,history:history.slice(-10)})});
    var data=await res.json();t.remove();
    var reply=data.reply||data.message||'No pude responder en este momento.';
    addMsg(reply,'bot');history.push({role:'assistant',content:reply});
  }catch(e){t.remove();addMsg('Error al conectar. Intenta de nuevo.','bot');}
}
async function submitLead(){
  var name=document.getElementById('li-name').value.trim();
  var email=document.getElementById('li-email').value.trim();
  var phone=document.getElementById('li-phone').value.trim();
  if(!name){alert('Por favor ingresa tu nombre');return;}
  leadSaved=true;
  document.getElementById('lead-capture').style.display='none';
  document.getElementById('chat-row').style.display='flex';
  fetch(API_BASE+'/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client_id:CLIENT_ID,contact_name:name,email,whatsapp:phone,source:'widget'})}).catch(console.error);
  addMsg('¡Gracias, '+name+'! ¿En qué más puedo ayudarte?','bot');
}
</script>`}
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type':                   'text/html; charset=utf-8',
      'X-Frame-Options':                'ALLOWALL',
      'Access-Control-Allow-Origin':    '*',
      'Content-Security-Policy':        "frame-ancestors *",
    },
  })
}
