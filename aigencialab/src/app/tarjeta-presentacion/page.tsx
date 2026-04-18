'use client';

import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

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
    <div className="min-h-screen bg-gray-50 py-12 px-4 selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;600&family=Outfit:wght@400;700;900&display=swap');

        /* BASE PRINT STYLES */
        @media print {
          title { display: none; }
          @page { margin: 0; size: auto; }
          body, html { margin: 0; padding: 0; background: white !important; }
          body * { visibility: hidden; }
          
          .print-target, .print-target * { visibility: visible; }
          .print-target { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            margin: 0 !important;
            padding: 0 !important;
            transform: scale(0.95);
            transform-origin: top left;
          }
          
          .no-print { display: none !important; }
        }

        /* CARD SIZES AND STRUCTURE */
        .card-wrapper-inner {
           width: 900px;
           display: flex;
           gap: 30px;
        }

        .card-panel {
          width: 900px;
          height: 500px;
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          background: white; /* fallback */
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          flex-shrink: 0;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        /* -------------- CARD TYPE 1: ORIGINAL (Cyberpunk) -------------- */
        .card-t1-front { background: #0a0c14; display: flex; align-items: stretch; color: white;}
        .card-t1-front .grid-bg {
          position: absolute; inset: 0;
          background-image: linear-gradient(rgba(37,99,235,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .card-t1-front .glow-orb {
          position: absolute; width: 300px; height: 300px; border-radius:50%;
          background: radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%); top: -80px; right: 180px; pointer-events: none;
        }
        .card-t1-front .content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 44px 48px; }
        .card-t1-front .logo { font-size: 2rem; font-weight: 800; font-family:'Inter'; letter-spacing: -.02em;}
        .card-t1-front .logo span { color: #00cfff; }
        .card-t1-front .qr-side { position: relative; z-index: 2; width: 220px; background: rgba(255,255,255,.03); border-left: 1px solid rgba(255,255,255,.06); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
        .card-t1-front .qr-frame { background: #fff; border-radius: 12px; padding: 10px; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }

        .card-t1-back { background: #0a0c14; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; position:relative; }
        .card-t1-back .hex-bg { position: absolute; inset: 0; opacity: .04; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57.74'%3E%3Cpolygon points='25,3 47,15.87 47,41.87 25,54.74 3,41.87 3,15.87' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E"); background-size: 50px 57.74px; }
        .card-t1-back .logo-mono { z-index:2; font-size: 4rem; font-weight: 800; font-family:'Inter'; background: linear-gradient(135deg, #2563eb, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

        /* -------------- CARD TYPE 2: EXECUTIVE MINIMAL -------------- */
        .card-t2-front { background: #ffffff; color: #111827; display: flex; align-items: center; }
        .card-t2-front .deco-line { position: absolute; top:0; bottom:0; left: 0; width: 6px; background: linear-gradient(180deg, #1d4ed8, #4f46e5); }
        .card-t2-front .content { padding: 50px 60px; flex: 1; display:flex; flex-direction:column; justify-content:center; }
        .card-t2-front .title { font-family: 'Outfit', sans-serif; font-size: 2.8rem; font-weight: 900; letter-spacing: -0.03em; color: #0f172a; line-height: 1.1; }
        .card-t2-front .subtitle { font-family: 'Inter', sans-serif; font-size: 1rem; color: #64748b; margin-top: 5px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
        .card-t2-front .qr-area { width: 300px; padding-right: 60px; display:flex; flex-direction:column; align-items:flex-end; }
        .card-t2-front .qr-box { background: white; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }

        .card-t2-back { background: #f8fafc; display:flex; justify-content:center; align-items:center; }
        .card-t2-back .logo-large { font-family: 'Outfit', sans-serif; font-size: 3rem; font-weight: 900; color: #0f172a; }
        .card-t2-back .logo-large span { color: #2563eb; }

        /* -------------- CARD TYPE 3: NEON GLASSMORPHISM -------------- */
        .card-t3-front { background: #030712; color: white; display: flex; overflow: hidden; font-family:'Inter'; }
        .card-t3-front .bg-blobs { position: absolute; inset:0; z-index:0; overflow:hidden;}
        .card-t3-front .blob1 { position: absolute; width: 500px; height: 500px; background: #6d28d9; filter: blur(100px); border-radius: 50%; top: -200px; left: -100px; opacity:0.6; }
        .card-t3-front .blob2 { position: absolute; width: 400px; height: 400px; background: #2563eb; filter: blur(90px); border-radius: 50%; bottom: -100px; right: -50px; opacity:0.5; }
        .card-t3-front .glass-panel { position:relative; z-index:1; border: 1px solid rgba(255,255,255,0.1); background: rgba(25,25,35,0.4); backdrop-filter: blur(20px); border-radius: 16px; margin: 30px; display:flex; width: calc(100% - 60px); }
        .card-t3-front .content { padding: 40px; flex:1; display:flex; flex-direction:column; justify-content:center; }
        .card-t3-front .brand { font-size:2.4rem; font-weight:700; font-family:'Outfit'; }
        .card-t3-front .qr-sec { width: 250px; display:flex; flex-direction:column; align-items:center; justify-content:center; border-left: 1px solid rgba(255,255,255,0.05); }
        .card-t3-front .qr-wrapper { background: rgba(255,255,255,0.9); padding:10px; border-radius:10px; }

        .card-t3-back { background: #030712; display:flex; align-items:center; justify-content:center; position:relative;}
        .card-t3-back .blob-c { position: absolute; width: 600px; height: 600px; background: conic-gradient(from 180deg at 50% 50%, #4c1d95 0deg, #1e3a8a 180deg, #4c1d95 360deg); filter: blur(120px); opacity:0.4; }
        .card-t3-back .z-10 { position:relative; z-index:10; font-family:'Outfit'; font-size:2rem; letter-spacing:8px; font-weight:500; color:#cbd5e1; display:flex; flex-direction:column; align-items:center; gap:20px; }

        /* -------------- CARD TYPE 4: CORPORATE ELITE -------------- */
        .card-t4-front { background: #011627; color: white; display: flex; font-family:'Inter'; align-items:stretch;}
        .card-t4-front .blue-accent { width: 40%; background: #0a2540; position:relative; overflow:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px;}
        .card-t4-front .blue-accent::after { content:''; position:absolute; right:-50px; top:-50px; width:200px; height:200px; border-radius:50%; border: 30px solid rgba(0, 207, 255, 0.05); }
        .card-t4-front .content { flex: 1; padding: 50px; display:flex; flex-direction:column; justify-content:center;}
        .card-t4-front .info-item { display:flex; align-items:center; gap:12px; font-size:1rem; color:#94a3b8; font-weight:400; margin-bottom:15px;}
        .card-t4-front .info-item i { color: #00cfff; font-size:1.2rem; font-style:normal; font-family:system-ui;}
        
        .card-t4-back { background: #0a2540; display:flex; align-items:center; justify-content:center; }
        .card-t4-back .circle-line { position:absolute; width:400px; height:400px; border:1px solid rgba(255,255,255,0.05); border-radius:50%; }
        .card-t4-back .circle-line-2 { position:absolute; width:600px; height:600px; border:1px solid rgba(255,255,255,0.02); border-radius:50%; }
      `}} />

      <div className="max-w-7xl mx-auto flex flex-col gap-16 pb-20">
        
        <div className="text-center no-print space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tarjetas de Presentación</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Hemos renovado los diseños resolviendo el problema del QR. Ahora el QR es 100% nativo y funcional en todos los formatos. Tienes 4 estilos premium para imprimir, haz clic en el botón de impresión del estilo que desees. 
          </p>
        </div>

        {/* ----------------- TYPE 1: ORIGINAL (UPDATED QR) ----------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 1 ? 'no-print' : ''} ${printId === 1 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-gray-800">1. Estilo Clásico (Cyberpunk)</h3>
              <p className="text-sm text-gray-500">Diseño original restaurado. (Con WhatsApp)</p>
            </div>
            <button onClick={() => handlePrint(1)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition">🖨️ Imprimir Estilo 1</button>
          </div>

          <div className="card-wrapper-inner mx-auto scale-[0.5] sm:scale-[0.6] md:scale-75 lg:scale-100 origin-top">
            <div className="card-panel card-t1-front">
              <div className="grid-bg"></div>
              <div className="glow-orb"></div>
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-400"></div>
              <div className="content">
                <div>
                  <div className="logo">AigenciaLab<span>.cl</span></div>
                  <div className="text-[0.85rem] text-white/50 tracking-wider mt-1 font-light">Automatización IA para Empresas B2B</div>
                </div>
                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex items-center gap-3 text-[0.82rem] text-white/75">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600/20 border border-blue-500/30">🌐</div> <span>aigencialab.cl</span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.82rem] text-white/75">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600/20 border border-blue-500/30">📩</div> <span>hola@aigencialab.cl</span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.82rem] text-white/75">
                    <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-600/20 border border-blue-500/30">💬</div> <span>WhatsApp · LinkedIn · Instagram</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {['🤖 Agentes IA', '💬 WhatsApp API', '📊 BI & Analytics', '🛒 Ecommerce'].map(tag => (
                    <span key={tag} className="text-[0.68rem] px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-white/60">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="qr-side">
                <div className="qr-frame">
                  <QRCode value={qrUrl} size={120} level="H" />
                </div>
                <div className="text-[0.7rem] text-[#00cfff] text-center leading-snug tracking-wider">🔍 Auditoría<br/>IA Gratuita</div>
                <div className="text-[0.6rem] text-white/30 text-center">Escanea para tu<br/>diagnóstico</div>
              </div>
            </div>

            <div className="card-panel card-t1-back">
              <div className="hex-bg"></div>
              <div className="logo-mono">A</div>
              <div className="z-10 flex gap-4 mt-2">
                {['Agentes IA', 'WhatsApp', 'Analytics'].map(tag => (
                  <span key={tag} className="text-[0.72rem] px-4 py-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 text-white/70 backdrop-blur-sm">{tag}</span>
                ))}
              </div>
              <div className="z-10 text-[0.9rem] text-[#00cfff] tracking-[0.08em] font-medium">aigencialab.cl</div>
            </div>
          </div>
        </div>


        {/* ----------------- TYPE 2: EXECUTIVE MINIMAL ----------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 2 ? 'no-print' : ''} ${printId === 2 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-gray-800">2. Executive Minimal (White)</h3>
              <p className="text-sm text-gray-500">Diseño B2B ultralimpio. Alta autoridad. (Web, Insta, Correo / Sin WhatsApp)</p>
            </div>
            <button onClick={() => handlePrint(2)} className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-lg font-medium shadow-sm transition">🖨️ Imprimir Estilo 2</button>
          </div>

          <div className="card-wrapper-inner mx-auto scale-[0.5] sm:scale-[0.6] md:scale-75 lg:scale-100 origin-top">
            <div className="card-panel card-t2-front">
              <div className="deco-line"></div>
              <div className="content">
                <div className="title">AigenciaLab.cl</div>
                <div className="subtitle">Data & Artificial Intelligence</div>
                
                <div className="flex flex-col gap-4 mt-12 pl-4 border-l-2 border-slate-200">
                  <div className="flex items-center gap-4 text-[0.95rem] text-slate-600 font-medium tracking-wide">
                    <span className="text-slate-400 font-bold w-6 text-center">W</span> aigencialab.cl
                  </div>
                  <div className="flex items-center gap-4 text-[0.95rem] text-slate-600 font-medium tracking-wide">
                    <span className="text-slate-400 font-bold w-6 text-center">@</span> @aigencialab
                  </div>
                  <div className="flex items-center gap-4 text-[0.95rem] text-slate-600 font-medium tracking-wide">
                    <span className="text-slate-400 font-bold w-6 text-center">E</span> hola@aigencialab.cl
                  </div>
                </div>
              </div>
              <div className="qr-area">
                <div className="qr-box">
                   <QRCode value={qrUrl} size={140} level="M" fgColor="#0f172a" />
                </div>
                <p className="mt-4 text-center text-[0.7rem] uppercase tracking-widest text-slate-500 font-bold leading-relaxed">
                  Auditoría Gratuita<br/>Escanear Código
                </p>
              </div>
            </div>

            <div className="card-panel card-t2-back">
               <div className="text-center">
                 <div className="logo-large">AigenciaLab<span>.</span></div>
                 <p className="uppercase tracking-[0.2em] text-slate-400 text-xs mt-3 font-semibold">Transformación Digital Inteligente</p>
               </div>
            </div>
          </div>
        </div>

        {/* ----------------- TYPE 3: NEON GLASSMORPHISM ----------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 3 ? 'no-print' : ''} ${printId === 3 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-gray-800">3. Neon Glassmorphism</h3>
              <p className="text-sm text-gray-500">Destaca como Startup SaaS. Vibrante, disruptivo. (Web, Insta, Correo / Sin WhatsApp)</p>
            </div>
            <button onClick={() => handlePrint(3)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition">🖨️ Imprimir Estilo 3</button>
          </div>

          <div className="card-wrapper-inner mx-auto scale-[0.5] sm:scale-[0.6] md:scale-75 lg:scale-100 origin-top">
            <div className="card-panel card-t3-front">
              <div className="bg-blobs">
                <div className="blob1"></div>
                <div className="blob2"></div>
              </div>
              <div className="glass-panel">
                 <div className="content">
                    <div className="brand">AigenciaLab</div>
                    <div className="text-sm text-purple-200 mt-1 uppercase tracking-widest font-semibold opacity-80">Software & IA</div>

                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 text-sm">🌐</div>
                         <span className="font-medium tracking-wide">aigencialab.cl</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 text-sm">📸</div>
                         <span className="font-medium tracking-wide">@aigencialab</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5 text-sm">✉️</div>
                         <span className="font-medium tracking-wide">hola@aigencialab.cl</span>
                      </div>
                    </div>
                 </div>
                 <div className="qr-sec">
                    <div className="qr-wrapper">
                      <QRCode value={qrUrl} size={150} level="M" fgColor="#1e1b4b" />
                    </div>
                    <div className="mt-4 font-bold text-sm tracking-widest uppercase text-center text-white/90">
                      Escanea<br/>Auditoría IA
                    </div>
                 </div>
              </div>
            </div>

            <div className="card-panel card-t3-back">
              <div className="blob-c"></div>
              <div className="z-10">
                <span className="text-[4rem] font-bold text-white">AIGENCIALAB</span>
                <div className="h-[2px] w-12 bg-white/30"></div>
                <span className="text-sm font-medium tracking-[0.4em] text-white/60">AUTOPILOT FOR BUSINESS</span>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- TYPE 4: CORPORATE ELITE ----------------- */}
        <div className={`space-y-4 ${printId !== null && printId !== 4 ? 'no-print' : ''} ${printId === 4 ? 'print-target' : ''}`}>
          <div className="no-print flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div>
              <h3 className="font-bold text-lg text-gray-800">4. Corporate Elite (Navy Blue)</h3>
              <p className="text-sm text-gray-500">Enfoque corporativo. Fondo azul oscuro con cyan. (Web, Insta, Correo / Sin WhatsApp)</p>
            </div>
            <button onClick={() => handlePrint(4)} className="bg-cyan-700 hover:bg-cyan-800 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition">🖨️ Imprimir Estilo 4</button>
          </div>

          <div className="card-wrapper-inner mx-auto scale-[0.5] sm:scale-[0.6] md:scale-75 lg:scale-100 origin-top">
            <div className="card-panel card-t4-front">
              <div className="content">
                <h2 className="text-[2.2rem] font-bold text-white tracking-tight mb-1">AigenciaLab<span className="text-[#00cfff]">.cl</span></h2>
                <p className="text-cyan-500 font-medium text-sm tracking-widest uppercase mb-12">Soluciones en Inteligencia Artificial</p>
                
                <div className="info-item">
                  <i>◆</i> <span>aigencialab.cl</span>
                </div>
                <div className="info-item">
                  <i>◆</i> <span>@aigencialab</span>
                </div>
                <div className="info-item">
                  <i>◆</i> <span>hola@aigencialab.cl</span>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
                    Especialistas en software automatizado, agentes de IA corporativos y optimización de flujos B2B.
                  </p>
                </div>
              </div>
              <div className="blue-accent">
                <div className="bg-white p-3 rounded-lg shadow-2xl relative z-10 mb-4">
                  <QRCode value={qrUrl} size={160} level="M" fgColor="#0a2540" />
                </div>
                <p className="text-white text-center font-bold text-sm tracking-widest uppercase relative z-10">
                  Diagnóstico IA<br/><span className="text-cyan-400 font-normal">Sin Costo</span>
                </p>
              </div>
            </div>

            <div className="card-panel card-t4-back">
              <div className="circle-line"></div>
              <div className="circle-line-2"></div>
              <div className="relative z-10 flex flex-col items-center">
                 <div className="w-20 h-20 mb-6 bg-gradient-to-br from-[#00cfff] to-blue-600 rounded-2xl flex items-center justify-center transform rotate-45 shadow-[0_0_40px_rgba(0,207,255,0.4)]">
                   <span className="text-white text-4xl font-black transform -rotate-45 font-['Outfit']">A</span>
                 </div>
                 <div className="text-white text-xl font-bold tracking-[0.3em]">AIGENCIALAB</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
