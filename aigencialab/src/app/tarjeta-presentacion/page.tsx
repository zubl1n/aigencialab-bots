'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const LOGO_SVGS = {
  gcp: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
  openai: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  meta: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
};

const PartnerBadges = ({ theme = 'light', mode = 'horizontal' }) => (
  <div className={`flex ${mode === 'vertical' ? 'flex-col gap-2' : 'flex-wrap gap-2 items-center'} mt-auto pt-4 border-t ${theme === 'light' ? 'border-black/5' : 'border-white/10'}`}>
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[0.55rem] font-bold tracking-wider border ${theme === 'light' ? 'border-black/10 bg-white/50 text-slate-800' : 'border-white/10 bg-black/20 text-slate-200'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.gcp} className="w-3.5 h-3.5 object-contain" alt="Google Cloud" />
      CLOUD PARTNER
    </div>
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[0.55rem] font-bold tracking-wider border ${theme === 'light' ? 'border-black/10 bg-white/50 text-slate-800' : 'border-white/10 bg-black/20 text-slate-200'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.openai} className={`w-3 h-3 object-contain ${theme === 'light' ? '' : 'invert opacity-90'}`} alt="OpenAI" />
      AI INTEGRATOR
    </div>
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[0.55rem] font-bold tracking-wider border ${theme === 'light' ? 'border-black/10 bg-white/50 text-slate-800' : 'border-white/10 bg-black/20 text-slate-200'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.meta} className="w-3.5 h-3.5 object-contain" alt="Meta" />
      TECH PROVIDER
    </div>
  </div>
);

const Logo = ({ theme = 'dark', className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-11 h-11 rounded-[0.8rem] flex items-center justify-center shadow-[0_4px_15px_rgba(168,85,247,0.4)]">
      <span className="text-white font-black text-xl font-['Outfit'] tracking-tighter">AI</span>
    </div>
    <span className={`font-black text-[1.7rem] tracking-tight font-['Outfit'] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
      genciaLab
    </span>
  </div>
);

export default function TarjetasPage() {
  const [printId, setPrintId] = useState<number | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => setPrintId(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = (id: number) => {
    setPrintId(id);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const qrUrl = "https://aigencialab.cl/audit";

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 selection:bg-purple-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');

        @media print {
          title { display: none; }
          @page { margin: 0; size: auto; }
          body, html { margin: 0; padding: 0; background: white !important; }
          body * { visibility: hidden; }
          
          .print-target, .print-target * { visibility: visible; }
          .print-target { 
            position: absolute !important; left: 0 !important; top: 0 !important; margin: 0 !important; padding: 0 !important;
            transform: scale(0.95); transform-origin: top left;
          }
          .no-print { display: none !important; }
        }

        .card-wrapper-inner { width: 900px; display: flex; gap: 30px; font-family: 'Inter', sans-serif; }
        .card-panel {
          width: 900px; height: 500px; border-radius: 18px; overflow: hidden; position: relative;
          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          flex-shrink: 0; box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        /* 1. CYBERPUNK ORIGINAL */
        .t1-bg { background: #0a0c14; }
        .t1-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(147,51,234,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,.1) 1px, transparent 1px); background-size: 30px 30px; }
        
        /* 2. EXECUTIVE MINIMAL */
        .t2-line { position: absolute; top:0; bottom:0; left: 0; width: 8px; background: linear-gradient(180deg, #6b21a8, #3b82f6); }
        
        /* 3. NEON GLASSMORPHISM */
        .t3-blob1 { position: absolute; width: 500px; height: 500px; background: #9333ea; filter: blur(120px); border-radius: 50%; top: -200px; left: -100px; opacity:0.6; }
        .t3-blob2 { position: absolute; width: 400px; height: 400px; background: #3b82f6; filter: blur(100px); border-radius: 50%; bottom: -100px; right: -50px; opacity:0.5; }
        
        /* 4. CORPORATE ELITE */
        .t4-accent::after { content:''; position:absolute; right:-60px; top:-60px; width:250px; height:250px; border-radius:50%; border: 40px solid rgba(0, 207, 255, 0.05); }
        
        /* 5. DARK MATTER & GOLD */
        .t5-bg { background: #050505; }
        .t5-gold { background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .t5-border { border: 1px solid rgba(252, 246, 186, 0.2); }
        
        /* 6. ECO TECH */
        .t6-bg { background: border-box #022c22; }
        .t6-emerald { color: #34d399; }
        .t6-glow { box-shadow: 0 0 40px rgba(52,211,153,0.2); }
        
        /* 7. HOLOGRAPHIC MESH */
        .t7-bg { background-image: radial-gradient(at 40% 20%, hsla(250,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(333,100%,70%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(33,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%); background-color: #f8fafc; }
        
        /* 8. BRUTALISM */
        .t8-bg { background: #fff; border: 12px solid #000; box-sizing: border-box; }
        
        /* 9. FROST GLASS */
        .t9-bg { background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%); }
        .t9-glass { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.8); }
        
        /* 10. AI MATRIX */
        .t10-bg { background: #000; }
        .t10-grid { position:absolute; bottom:0; left:0; width:100%; height:60%; background-image: linear-gradient(transparent 95%, rgba(0, 255, 128, 0.4) 1px), linear-gradient(90deg, transparent 95%, rgba(0, 255, 128, 0.4) 1px); background-size: 40px 40px; transform: perspective(500px) rotateX(60deg); transform-origin: bottom; }
      `}} />

      <div className="max-w-[1000px] mx-auto flex flex-col gap-16 pb-20">
        
        <div className="text-center no-print space-y-4 mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight font-['Outfit']">Business Cards Collection</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            10 Variaciones Ultra-Premium enfocadas en UX y Marketing.<br/>
            Incluyen sellos de Partners Oficiales listos para imprimir.
          </p>
        </div>

        {/* ---------------- 1. CYBERPUNK ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 1 ? 'no-print' : ''} ${printId === 1 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">1. Cyberpunk Original</h3><p className="text-sm text-gray-500">Dark mode con gradientes. El clásico restaurado con insignias.</p></div>
            <button onClick={() => handlePrint(1)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 1</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t1-bg text-white flex">
              <div className="t1-grid"></div>
              <div className="absolute top-[-100px] right-[100px] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[80px]"></div>
              <div className="relative z-10 flex flex-col justify-between p-12 w-2/3 border-r border-white/10">
                <div>
                  <Logo theme="dark" />
                  <p className="mt-4 text-purple-200 font-medium tracking-widest text-sm uppercase">Automatización B2B</p>
                </div>
                <div className="flex flex-col gap-4 text-sm text-gray-300">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">🌐</span> aigencialab.cl</div>
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">📸</span> @aigencialab</div>
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded bg-white/5 flex items-center justify-center border border-white/10">✉️</span> hola@aigencialab.cl</div>
                </div>
                <PartnerBadges theme="dark" />
              </div>
              <div className="relative z-10 w-1/3 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md">
                <div className="bg-white p-3 rounded-2xl shadow-xl"><QRCode value={qrUrl} size={150} level="H" /></div>
                <p className="mt-6 text-center text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Auditoría IA<br/><span className="text-white opacity-50">Escanea aquí</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 2. EXECUTIVE MINIMAL ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 2 ? 'no-print' : ''} ${printId === 2 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">2. Executive Minimal</h3><p className="text-sm text-gray-500">Diseño B2B blanco corporativo con máxima legibilidad.</p></div>
            <button onClick={() => handlePrint(2)} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 2</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel bg-white text-slate-900 flex">
              <div className="t2-line"></div>
              <div className="flex-1 p-[60px] flex flex-col justify-center">
                <Logo theme="light" />
                <p className="text-slate-500 text-sm font-semibold tracking-[0.15em] uppercase mt-2">Data & Artificial Intelligence</p>
                <div className="mt-12 pl-4 border-l-2 border-slate-200 flex flex-col gap-4 text-[0.95rem] font-medium text-slate-600">
                  <div className="flex items-center gap-4"><span className="text-slate-400 font-bold w-6 text-center">W</span> aigencialab.cl</div>
                  <div className="flex items-center gap-4"><span className="text-slate-400 font-bold w-6 text-center">@</span> @aigencialab</div>
                  <div className="flex items-center gap-4"><span className="text-slate-400 font-bold w-6 text-center">E</span> hola@aigencialab.cl</div>
                </div>
                <div className="mt-auto pt-4"><PartnerBadges theme="light" /></div>
              </div>
              <div className="w-[300px] pr-[60px] flex flex-col justify-center items-end">
                <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg"><QRCode value={qrUrl} size={150} level="M" fgColor="#0f172a" /></div>
                <p className="mt-4 text-center text-[0.7rem] uppercase tracking-widest text-slate-500 font-bold w-[176px]">Auditoría Gratuita Escanear Código</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 3. NEON GLASSMORPHISM ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 3 ? 'no-print' : ''} ${printId === 3 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">3. Neon Glassmorphism</h3><p className="text-sm text-gray-500">Diseño vibrante tipo Fintech/Startup para impactar.</p></div>
            <button onClick={() => handlePrint(3)} className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 3</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel bg-[#030712] text-white flex overflow-hidden">
              <div className="t3-blob1"></div><div className="t3-blob2"></div>
              <div className="relative z-10 m-8 w-[calc(100%-64px)] rounded-2xl border border-white/20 bg-white/5 backdrop-blur-2xl flex shadow-2xl">
                <div className="flex-1 p-10 flex flex-col justify-between">
                  <Logo theme="dark" />
                  <div className="flex flex-col gap-4 text-sm font-medium tracking-wide">
                    <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">🌐</div> aigencialab.cl</div>
                    <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">📸</div> @aigencialab</div>
                    <div className="flex items-center gap-4"><div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/5">✉️</div> hola@aigencialab.cl</div>
                  </div>
                  <PartnerBadges theme="dark" />
                </div>
                <div className="w-[300px] border-l border-white/10 bg-black/20 flex flex-col items-center justify-center rounded-r-2xl">
                  <div className="bg-white/95 p-3 rounded-xl"><QRCode value={qrUrl} size={150} level="M" fgColor="#312e81" /></div>
                  <p className="mt-6 text-sm font-bold tracking-widest uppercase text-white/90 text-center">Escanea<br/>Diagnóstico IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 4. CORPORATE ELITE ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 4 ? 'no-print' : ''} ${printId === 4 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">4. Corporate Elite</h3><p className="text-sm text-gray-500">Azul marino corporativo (Navy), máxima seriedad.</p></div>
            <button onClick={() => handlePrint(4)} className="bg-cyan-700 hover:bg-cyan-800 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 4</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel bg-[#011627] text-white flex">
              <div className="flex-1 p-[50px] flex flex-col">
                <Logo theme="dark" />
                <p className="text-[#00cfff] font-medium text-sm tracking-[0.2em] uppercase mt-2">Soluciones de Inteligencia Artificial</p>
                <div className="mt-12 flex flex-col gap-4 text-[#94a3b8]">
                  <div className="flex items-center gap-3"><span className="text-[#00cfff] text-lg">◆</span> aigencialab.cl</div>
                  <div className="flex items-center gap-3"><span className="text-[#00cfff] text-lg">◆</span> @aigencialab</div>
                  <div className="flex items-center gap-3"><span className="text-[#00cfff] text-lg">◆</span> hola@aigencialab.cl</div>
                </div>
                <PartnerBadges theme="dark" />
              </div>
              <div className="w-[350px] bg-[#0a2540] relative overflow-hidden flex flex-col items-center justify-center p-10 t4-accent border-l border-white/5">
                <div className="bg-white p-4 rounded-2xl shadow-2xl relative z-10"><QRCode value={qrUrl} size={160} level="M" fgColor="#011627" /></div>
                <p className="text-white text-center font-bold text-sm tracking-[0.2em] uppercase mt-6 relative z-10">Auditoría IA<br/><span className="text-[#00cfff] font-normal">Sin Costo</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 5. DARK MATTER & GOLD ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 5 ? 'no-print' : ''} ${printId === 5 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">5. Dark Matter & Gold</h3><p className="text-sm text-gray-500">Lujo absoluto. Negro puro con acabados dorados metalizados.</p></div>
            <button onClick={() => handlePrint(5)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 5</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t5-bg text-white border border-white/10 flex p-[30px]">
              <div className="flex-1 border border-[#bf953f]/30 rounded-xl p-10 flex flex-col relative overflow-hidden backdrop-blur-sm bg-black/50">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#bf953f] blur-[150px] opacity-10 rounded-full"></div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-[#bf953f] to-[#aa771c] w-11 h-11 rounded-[0.8rem] flex items-center justify-center">
                    <span className="text-black font-black text-xl font-['Outfit'] tracking-tighter">AI</span>
                  </div>
                  <span className="font-black text-[1.7rem] tracking-tight font-['Outfit'] text-white">genciaLab</span>
                </div>
                
                <p className="t5-gold font-bold text-xs tracking-[0.3em] uppercase mt-4">Premium Business Solutions</p>
                
                <div className="mt-auto grid grid-cols-2 gap-4 text-sm font-medium tracking-wider text-slate-300">
                  <div className="col-span-2 flex items-center gap-3"><span className="t5-gold">W.</span> aigencialab.cl</div>
                  <div className="flex items-center gap-3"><span className="t5-gold">I.</span> @aigencialab</div>
                  <div className="flex items-center gap-3"><span className="t5-gold">E.</span> hola@aigencialab.cl</div>
                </div>
                <div className="mt-6"><PartnerBadges theme="dark" /></div>
              </div>
              <div className="w-[280px] flex flex-col items-center justify-center pl-[30px]">
                <div className="bg-gradient-to-br from-[#fcf6ba] to-[#bf953f] p-1 rounded-xl shadow-[0_0_30px_rgba(191,149,63,0.3)]">
                  <div className="bg-white p-3 rounded-lg"><QRCode value={qrUrl} size={150} level="Q" fgColor="#050505" /></div>
                </div>
                <p className="t5-gold text-center font-bold text-xs tracking-[0.3em] uppercase mt-6">Scan for Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 6. ECO TECH (EMERALD) ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 6 ? 'no-print' : ''} ${printId === 6 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">6. Eco Tech (Emerald)</h3><p className="text-sm text-gray-500">Verde oscuro corporativo, transmite eficiencia y tecnología sostenible.</p></div>
            <button onClick={() => handlePrint(6)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 6</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t6-bg text-white flex">
              <div className="w-2 bg-[#34d399] h-full"></div>
              <div className="flex-1 p-[60px] flex flex-col justify-center">
                <Logo theme="dark" />
                <p className="t6-emerald text-sm tracking-[0.2em] font-semibold uppercase mt-3">Smart Automation</p>
                <div className="mt-12 flex flex-col gap-5 text-[1rem] text-emerald-50 font-light">
                  <div className="flex items-center gap-4"><span className="text-[#34d399] font-bold">›</span> aigencialab.cl</div>
                  <div className="flex items-center gap-4"><span className="text-[#34d399] font-bold">›</span> @aigencialab</div>
                  <div className="flex items-center gap-4"><span className="text-[#34d399] font-bold">›</span> hola@aigencialab.cl</div>
                </div>
                <div className="mt-auto"><PartnerBadges theme="dark" /></div>
              </div>
              <div className="w-[320px] bg-black/20 flex flex-col items-center justify-center border-l border-[#34d399]/20">
                <div className="bg-white p-4 rounded-xl t6-glow"><QRCode value={qrUrl} size={150} level="M" fgColor="#022c22" /></div>
                <div className="mt-8 px-6 py-2 border border-[#34d399]/50 text-[#34d399] rounded-full text-xs font-bold tracking-widest uppercase">Escanear QR</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 7. HOLOGRAPHIC MESH ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 7 ? 'no-print' : ''} ${printId === 7 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">7. Holographic Mesh</h3><p className="text-sm text-gray-500">Gradiente multicolor complejo, diseño creativo y vanguardista.</p></div>
            <button onClick={() => handlePrint(7)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 7</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t7-bg flex items-center p-12">
              <div className="bg-white/40 backdrop-blur-3xl border border-white/60 p-10 rounded-2xl w-full h-full shadow-[0_8px_32px_rgba(31,38,135,0.1)] flex">
                <div className="flex-1 flex flex-col">
                  <Logo theme="light" />
                  <p className="text-slate-800/80 font-bold tracking-[0.1em] text-sm mt-2 uppercase">Digital Creators & AI</p>
                  
                  <div className="mt-10 flex flex-col gap-4 font-semibold text-slate-800">
                    <div className="bg-white/50 px-4 py-2 rounded-lg max-w-[250px] border border-white text-sm">🌐 aigencialab.cl</div>
                    <div className="bg-white/50 px-4 py-2 rounded-lg max-w-[250px] border border-white text-sm">📸 @aigencialab</div>
                    <div className="bg-white/50 px-4 py-2 rounded-lg max-w-[250px] border border-white text-sm">✉️ hola@aigencialab.cl</div>
                  </div>
                  <div className="mt-auto"><PartnerBadges theme="light" /></div>
                </div>
                <div className="w-[200px] flex flex-col items-center justify-center">
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-white"><QRCode value={qrUrl} size={150} level="M" fgColor="#000" /></div>
                  <p className="mt-4 text-center font-black uppercase text-[0.65rem] tracking-widest text-slate-900 bg-white/60 px-4 py-1 border border-white rounded-full">Auditoría IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 8. BRUTALISM ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 8 ? 'no-print' : ''} ${printId === 8 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">8. Monocromo Brutalism</h3><p className="text-sm text-gray-500">Blanco y negro puro. Tipografía gigante, diseño radical y honesto.</p></div>
            <button onClick={() => handlePrint(8)} className="bg-black text-white px-5 py-2 rounded-none font-bold shadow">🖨️ Imprimir 8</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t8-bg flex text-black font-['Space_Grotesk']">
              <div className="flex-1 p-[40px] flex flex-col justify-between border-r-[12px] border-black">
                <div>
                  <h1 className="text-[4rem] font-bold leading-none tracking-tighter">AIGENCIA<br/>LAB.</h1>
                  <p className="text-xl font-bold mt-2 uppercase border-b-4 border-black pb-4 inline-block tracking-widest">Inteligencia Artificial</p>
                </div>
                <div className="flex flex-col gap-1 text-xl font-bold tracking-tight">
                  <div className="bg-black text-white px-3 py-1 self-start uppercase mb-2">Contacto</div>
                  <div>aigencialab.cl</div>
                  <div>@aigencialab</div>
                  <div>hola@aigencialab.cl</div>
                </div>
                <div className="mt-4 border-t-[4px] border-black pt-4">
                  <PartnerBadges theme="light" />
                </div>
              </div>
              <div className="w-[300px] flex flex-col p-[30px] justify-between">
                <div className="text-[3rem] font-black leading-none">SCAN<br/>HERE<br/>↓</div>
                <div className="border-[8px] border-black p-2 mt-auto"><QRCode value={qrUrl} size={200} level="M" fgColor="#000" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 9. FROST GLASS (SaaS LIGHT) ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 9 ? 'no-print' : ''} ${printId === 9 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">9. Frost Glass (SaaS Dashboard)</h3><p className="text-sm text-gray-500">Estilo aplicación web moderna (Dashboard UI) en modo claro.</p></div>
            <button onClick={() => handlePrint(9)} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 9</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t9-bg p-8 flex gap-8 items-stretch">
              {/* Sidebar mímic */}
              <div className="w-[240px] t9-glass rounded-2xl p-6 flex flex-col">
                <Logo theme="light" className="scale-[0.8] origin-left" />
                <div className="mt-8 flex flex-col gap-3 font-medium text-sm text-slate-600">
                  <div className="flex items-center gap-3 bg-white/70 px-3 py-2 rounded-lg shadow-sm border border-white">🏠 Home</div>
                  <div className="flex items-center gap-3 px-3 py-2">🌐 aigencialab.cl</div>
                  <div className="flex items-center gap-3 px-3 py-2">📸 @aigencialab</div>
                  <div className="flex items-center gap-3 px-3 py-2">✉️ hola@</div>
                </div>
                <div className="mt-auto">
                  <PartnerBadges theme="light" mode="vertical" />
                </div>
              </div>
              {/* Main content mímic */}
              <div className="flex-1 t9-glass rounded-2xl p-8 flex flex-col items-center justify-center relative shadow-lg">
                <div className="absolute top-4 left-6 text-sm font-bold text-slate-400">Project / Audit</div>
                <h2 className="text-3xl font-black text-slate-800 font-['Outfit'] mb-8 text-center">Inicia tu<br/>Auditoría IA</h2>
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                  <QRCode value={qrUrl} size={160} level="M" fgColor="#1e293b" />
                </div>
                <button className="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm tracking-widest uppercase">Escanear Ahora</button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- 10. AI MATRIX GRID ---------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 10 ? 'no-print' : ''} ${printId === 10 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div><h3 className="font-bold text-lg">10. AI Matrix Grid</h3><p className="text-sm text-gray-500">Perspectiva 3D con grilla neón. Estilo hacking/Desarrollo hardcore.</p></div>
            <button onClick={() => handlePrint(10)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow">🖨️ Imprimir 10</button>
          </div>
          <div className="card-wrapper-inner mx-auto scale-[0.45] sm:scale-75 md:scale-100 origin-top">
            <div className="card-panel t10-bg text-[#00ff80] flex flex-col relative font-['Geist_Mono']">
              <div className="t10-grid"></div>
              <div className="relative z-10 p-12 flex justify-between items-start h-full pb-0">
                <div className="flex flex-col h-[350px]">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#00ff80] text-black font-black text-3xl px-3 py-1 font-['Outfit'] rounded shadow-[0_0_20px_#00ff80]">AI</div>
                    <span className="font-black text-4xl text-white font-['Outfit'] tracking-tight">genciaLab</span>
                  </div>
                  <div className="mt-8 flex flex-col gap-4 text-sm font-bold tracking-widest bg-black/40 p-6 border border-[#00ff80]/30 rounded-xl backdrop-blur-md">
                    <div><span className="text-white/50">host:</span> aigencialab.cl</div>
                    <div><span className="text-white/50">user:</span> @aigencialab</div>
                    <div><span className="text-white/50">mail:</span> hola@aigencialab.cl</div>
                  </div>
                  <div className="mt-12"><PartnerBadges theme="dark" /></div>
                </div>
                
                <div className="bg-black/80 border-2 border-[#00ff80] p-4 rounded shadow-[0_0_30px_rgba(0,255,128,0.4)] backdrop-blur-md z-10 flex flex-col items-center">
                   <div className="bg-white p-2 mb-4"><QRCode value={qrUrl} size={150} level="M" fgColor="#000" /></div>
                   <span className="animate-pulse text-xs uppercase font-bold tracking-[0.3em]">System.Audit()</span>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
