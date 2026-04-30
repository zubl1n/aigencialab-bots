/**
 * widget-handler.ts — Lógica del widget sin caracteres especiales en la ruta
 * Este archivo es importado desde widget/[clientId]/route.ts
 * VERSIÓN: 2.0 — Fix crítico addEventListener + timeout + CORS
 */
import { createClient } from '@supabase/supabase-js'

export const WIDGET_VERSION = '2.0.0'

export async function handleWidgetRequest(clientId: string): Promise<Response> {
  let bot: any = null
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const result = await Promise.race([
      supabase
        .from('bot_configs')
        .select('active, widget_color, welcome_message, name, bot_name, language')
        .eq('client_id', clientId)
        .maybeSingle(),
      new Promise<{ data: null }>((_, r) => setTimeout(() => r({ data: null }), 4000))
    ])
    bot = (result as any).data ?? null
  } catch { /* usa defaults */ }

  const color    = (bot?.widget_color ?? '#7C3AED').trim()
  const botName  = (bot?.bot_name || bot?.name || 'Asistente IA').trim()
  const welcome  = (bot?.welcome_message || '\u00a1Hola! \u00bfEn qu\u00e9 puedo ayudarte hoy?').trim()
  const apiBase  = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl')
    .trim().replace(/[\r\n\t]/g, '').replace(/\/$/, '')
  const inactive = bot && bot.active === false
  const v        = `${WIDGET_VERSION}.${Date.now()}`

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${botName}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,system-ui,sans-serif;background:#0A0A0F;color:#F1F0F5;display:flex;flex-direction:column;height:100vh;overflow:hidden}
  .hdr{background:#111118;border-bottom:1px solid rgba(255,255,255,.08);padding:14px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
  .av{width:36px;height:36px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:18px}
  .bn{font-weight:700;font-size:14px}
  .bs{font-size:11px;color:#6B6480;display:flex;align-items:center;gap:4px}
  .dot{width:6px;height:6px;border-radius:50%;background:#34d399;display:inline-block;animation:pulse 2s infinite}
  #msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .m{max-width:82%;padding:10px 14px;border-radius:14px;font-size:13px;line-height:1.5;animation:fu .2s ease;word-break:break-word;white-space:pre-wrap}
  .m.b{background:#16161E;border:1px solid rgba(255,255,255,.06);align-self:flex-start;border-bottom-left-radius:4px}
  .m.u{background:${color};color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
  .m.e{background:#2d1515;border:1px solid rgba(248,113,113,.3);color:#fca5a5;align-self:flex-start;font-size:12px}
  .ty{display:flex;gap:4px;align-items:center;padding:10px 14px;background:#16161E;border:1px solid rgba(255,255,255,.06);border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start}
  .ty span{width:6px;height:6px;border-radius:50%;background:#6B6480;animation:bo 1.2s infinite}
  .ty span:nth-child(2){animation-delay:.2s}.ty span:nth-child(3){animation-delay:.4s}
  .ftr{flex-shrink:0;border-top:1px solid rgba(255,255,255,.08)}
  .row{display:flex;gap:8px;padding:12px 14px;align-items:flex-end}
  #agl-inp{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 12px;color:#F1F0F5;font-size:13px;outline:none;resize:none;max-height:80px;min-height:40px;font-family:inherit;transition:border-color .15s}
  #agl-inp:focus{border-color:${color}}
  #agl-inp:disabled,#agl-sb:disabled{opacity:.4;cursor:not-allowed}
  #agl-sb{background:${color};border:none;border-radius:8px;width:38px;height:38px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s}
  #agl-sb:hover:not(:disabled){opacity:.85}
  #agl-sb svg{width:16px;height:16px;pointer-events:none}
  .off{flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#6B6480;font-size:14px;text-align:center;padding:20px}
  @keyframes fu{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
  @keyframes bo{0%,60%,100%{transform:none}30%{transform:translateY(-5px)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
</style>
</head>
<body>
<div class="hdr">
  <div class="av">&#x1F916;</div>
  <div style="flex:1">
    <div class="bn">${botName}</div>
    <div class="bs">${inactive
      ? '<span style="color:#f87171">&#x26D4; Inactivo temporalmente</span>'
      : '<span class="dot"></span>&nbsp;En l&#xED;nea &middot; Responde al instante'
    }</div>
  </div>
</div>
${inactive
  ? `<div class="off"><span style="font-size:40px">&#x1F634;</span><p>Este asistente est&#xE1; pausado temporalmente.</p></div>`
  : `<div id="msgs"><div class="m b">${welcome.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div></div>
<div class="ftr"><div class="row">
  <textarea id="agl-inp" placeholder="Escribe tu consulta&#x2026;" rows="1"></textarea>
  <button id="agl-sb" aria-label="Enviar"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><path d="M22 2 11 13M22 2l-7 20-4-7-7-4 20-7z"/></svg></button>
</div></div>
<script>
/* AIgenciaLab Widget v${v} */
(function(){
  var BASE='${apiBase}';
  var CID='${clientId}';
  var hist=[];
  var busy=false;

  var SID=(function(){
    try{
      var k='agl_${clientId.slice(0,8)}';
      var s=sessionStorage.getItem(k);
      if(!s){s='s'+Math.random().toString(36).slice(2)+Date.now();sessionStorage.setItem(k,s);}
      return s;
    }catch(e){return 's'+Math.random().toString(36).slice(2);}
  })();

  var box=document.getElementById('msgs');
  var inp=document.getElementById('agl-inp');
  var btn=document.getElementById('agl-sb');

  function lock(v){
    busy=v;
    inp.disabled=v;
    btn.disabled=v;
    if(!v){try{inp.focus();}catch(e){}}
  }

  function append(txt,cls){
    var d=document.createElement('div');
    d.className='m '+cls;
    d.textContent=txt;
    box.appendChild(d);
    box.scrollTop=box.scrollHeight;
  }

  function showTyping(){
    var t=document.createElement('div');
    t.className='ty';
    t.id='agl-ty';
    t.innerHTML='<span></span><span></span><span></span>';
    box.appendChild(t);
    box.scrollTop=box.scrollHeight;
  }

  function rmTyping(){
    var t=document.getElementById('agl-ty');
    if(t)t.remove();
  }

  inp.addEventListener('input',function(){
    this.style.height='auto';
    this.style.height=Math.min(this.scrollHeight,80)+'px';
  });

  inp.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.shiftKey){
      e.preventDefault();
      send();
    }
  });

  btn.addEventListener('click',function(e){
    e.preventDefault();
    send();
  });

  async function send(){
    if(busy)return;
    var txt=inp.value.trim();
    if(!txt)return;
    inp.value='';
    inp.style.height='auto';
    lock(true);
    append(txt,'u');
    hist.push({role:'user',content:txt});
    showTyping();

    var ctrl=new AbortController();
    var tid=setTimeout(function(){ctrl.abort();},15000);

    try{
      var r=await fetch(BASE+'/api/chat',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'x-client-id':CID
        },
        body:JSON.stringify({
          message:txt,
          history:hist.slice(-10),
          session_id:SID
        }),
        signal:ctrl.signal
      });
      clearTimeout(tid);
      rmTyping();

      if(!r.ok){
        var er={};
        try{er=await r.json();}catch(x){}
        append((er.error||'Error '+r.status)+'. Intenta de nuevo.','e');
      }else{
        var d=await r.json();
        var rep=d.reply||d.message||'Sin respuesta del servidor.';
        append(rep,'b');
        hist.push({role:'assistant',content:rep});
      }
    }catch(e){
      clearTimeout(tid);
      rmTyping();
      if(e.name==='AbortError'){
        append('La respuesta tard\u00f3 demasiado. Intenta de nuevo.','e');
      }else{
        append('No se pudo conectar. Verifica tu conexi\u00f3n.','e');
      }
    }finally{
      lock(false);
    }
  }

  inp.focus();
})();
</script>`
}
</body>
</html>`

  return new Response(html, {
    headers: {
      'Content-Type':                'text/html; charset=utf-8',
      'Cache-Control':               'no-store, no-cache, must-revalidate',
      'Pragma':                      'no-cache',
      'Expires':                     '0',
      'X-Frame-Options':             'ALLOWALL',
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy':     'frame-ancestors *',
      'X-Widget-Version':            v,
    },
  })
}
