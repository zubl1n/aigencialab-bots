/**
 * GET /api/embed?cid=xxx — Embed script for widget
 * No brackets in path = no Windows/Vercel upload issues
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const clientId = request.nextUrl.searchParams.get('cid')
  if (!clientId || clientId.length < 10) {
    return new NextResponse('// Missing cid parameter', {
      status: 400,
      headers: { 'Content-Type': 'application/javascript' },
    })
  }

  // Load bot color with timeout
  let color = '#7C3AED'
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const result = await Promise.race([
      supabase
        .from('bot_configs')
        .select('widget_color')
        .eq('client_id', clientId)
        .maybeSingle(),
      new Promise<{ data: null }>((_, r) => setTimeout(() => r({ data: null }), 4000))
    ])
    const bot = (result as any).data
    if (bot?.widget_color) color = bot.widget_color.trim()
  } catch { /* use default */ }

  const widgetBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl')
    .trim().replace(/[\r\n\t]/g, '').replace(/\/$/, '')
  const widgetUrl = `${widgetBase}/api/wh?cid=${clientId}`

  const script = `
(function() {
  'use strict';
  if (window.__AIgenciaLabLoaded) return;
  window.__AIgenciaLabLoaded = true;

  var PRIMARY = '${color}';
  var WIDGET_URL = '${widgetUrl}';

  var style = document.createElement('style');
  style.innerHTML = [
    '#agl-btn { position:fixed; bottom:24px; right:24px; z-index:99999; width:60px; height:60px; border-radius:50%; background:' + PRIMARY + '; border:none; cursor:pointer; box-shadow:0 4px 20px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; transition:transform .2s; }',
    '#agl-btn:hover { transform:scale(1.1); }',
    '#agl-btn svg { width:28px; height:28px; fill:#fff; }',
    '#agl-frame { position:fixed; bottom:96px; right:24px; z-index:99998; width:380px; height:580px; border-radius:16px; border:none; box-shadow:0 20px 60px rgba(0,0,0,0.4); transition:opacity .25s,transform .25s; display:none; transformOrigin:bottom right; }',
    '#agl-frame.open { display:block; animation: aglFadeIn .25s ease; }',
    '@keyframes aglFadeIn { from { opacity:0; transform:scale(0.95) translateY(8px); } to { opacity:1; transform:none; } }',
    '@media(max-width:480px) { #agl-frame { width:calc(100vw - 16px); height:70vh; bottom:80px; right:8px; left:8px; } }',
  ].join('');
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.id = 'agl-btn';
  btn.setAttribute('aria-label', 'Abrir chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>';
  document.body.appendChild(btn);

  var frame = document.createElement('iframe');
  frame.id = 'agl-frame';
  frame.src = WIDGET_URL;
  frame.allow = 'microphone';
  document.body.appendChild(frame);

  var open = false;
  btn.addEventListener('click', function() {
    open = !open;
    frame.className = open ? 'open' : '';
    btn.setAttribute('aria-expanded', String(open));
    btn.innerHTML = open
      ? '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" fill="#fff"/></svg>';
  });
})();
`.trim()

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
