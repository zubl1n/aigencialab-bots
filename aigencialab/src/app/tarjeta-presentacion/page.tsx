'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const LOGO_SVGS = {
  gcp: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
  openai: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  meta: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg"
};

const NewLogo = ({ theme = 'dark' }) => (
  <div className="flex items-center gap-2.5 z-10 w-fit">
    <div className="relative w-[2.8rem] h-[2.8rem] rounded-[0.8rem] bg-gradient-to-b from-purple-500 to-indigo-700 flex items-center justify-center p-[8px] shadow-[0_0_20px_rgba(147,51,234,0.3)]">
      <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[3px]">
        <div className="bg-[#e0d8f5] rounded-[2px]" />
        <div className="bg-[#00cfff] rounded-[2px]" />
        <div className="bg-[#00cfff] rounded-[2px]" />
        <div className="bg-[#a78bfa] rounded-[2px]" />
      </div>
    </div>
    <span className={`flex items-center text-[2rem] tracking-tight font-['Outfit'] leading-none ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
      <span className="font-black">AI</span><span className="font-medium">gencia</span><span className="font-light opacity-80">Lab</span>
    </span>
  </div>
);

const ContactInfo = ({ theme, accent }: { theme: string, accent: string }) => (
  <div className={`flex flex-col gap-3 font-medium text-[0.85rem] ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>🌐</span> aigencialab.cl
    </div>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>📸</span> @aigencialab
    </div>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>✉️</span> hola@aigencialab.cl
    </div>
  </div>
);

const Badges = ({ theme }: { theme: string }) => (
  <div className={`flex flex-wrap gap-2 mt-auto pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.gcp} className="w-3.5 h-3.5 object-contain" alt="GCP" />
      Cloud Partner
    </div>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.openai} className={`w-3 h-3 object-contain ${theme === 'dark' ? 'invert opacity-90' : ''}`} alt="OpenAI" />
      Solutions
    </div>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.meta} className="w-3.5 h-3.5 object-contain" alt="Meta" />
      Provider
    </div>
  </div>
);

const QrBox = ({ qrColor, accent, textMode }: { qrColor: string, accent: string, textMode?: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-100">
      <QRCode value="https://aigencialab.cl/audit" size={140} level="M" fgColor={qrColor} />
    </div>
    <p className={`mt-4 text-[0.65rem] font-bold tracking-[0.2em] uppercase text-center ${textMode === 'light' ? 'text-white' : accent}`}>
      Auditoría IA<br/><span className="opacity-60">Escanea Aquí</span>
    </p>
  </div>
);

const PALETTES = [
  { name: 'Core Brand', bgSideA: 'bg-[#0f172a]', bgSideB: 'bg-[#1e1b4b]', gradLeft: 'from-[#0f172a]', gradRight: 'to-[#1e1b4b]', accentText: 'text-cyan-400', qrColor: '#0f172a', theme: 'dark', border: 'border-white/10', blob: 'bg-purple-600' },
  { name: 'Pure Minimal', bgSideA: 'bg-white', bgSideB: 'bg-slate-50', gradLeft: 'from-white', gradRight: 'to-slate-100', accentText: 'text-purple-600', qrColor: '#312e81', theme: 'light', border: 'border-slate-200', blob: 'bg-slate-200' },
  { name: 'Midnight Corporate', bgSideA: 'bg-[#030712]', bgSideB: 'bg-[#0f172a]', gradLeft: 'from-[#030712]', gradRight: 'to-[#0f172a]', accentText: 'text-blue-400', qrColor: '#030712', theme: 'dark', border: 'border-slate-800', blob: 'bg-blue-600' },
  { name: 'Emerald Tech', bgSideA: 'bg-[#022c22]', bgSideB: 'bg-[#064e3b]', gradLeft: 'from-[#022c22]', gradRight: 'to-[#064e3b]', accentText: 'text-emerald-400', qrColor: '#022c22', theme: 'dark', border: 'border-emerald-900', blob: 'bg-emerald-600' },
  { name: 'Frost Executive', bgSideA: 'bg-slate-100', bgSideB: 'bg-slate-200', gradLeft: 'from-slate-100', gradRight: 'to-slate-200', accentText: 'text-slate-800', qrColor: '#0f172a', theme: 'light', border: 'border-slate-300', blob: 'bg-white' },
  { name: 'Violet Neon', bgSideA: 'bg-[#2e1065]', bgSideB: 'bg-[#170529]', gradLeft: 'from-[#2e1065]', gradRight: 'to-[#170529]', accentText: 'text-fuchsia-400', qrColor: '#2e1065', theme: 'dark', border: 'border-fuchsia-900/50', blob: 'bg-fuchsia-600' },
];

const LAYOUTS = [
  // 0. Glassmorphism
  ({ p }: { p: any }) => (
    <div className={`card-panel bg-gradient-to-r ${p.gradLeft} ${p.gradRight} overflow-hidden flex items-center justify-center relative`}>
      <div className={`absolute top-0 left-0 w-96 h-96 rounded-full blur-[100px] ${p.blob} opacity-40 mix-blend-screen pointer-events-none`} />
      
      <div className={`z-10 w-[820px] h-[420px] rounded-3xl ${p.theme === 'light' ? 'bg-white/50 border-white/60' : 'bg-black/30 border-white/10'} backdrop-blur-xl border flex shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden`}>
        <div className="flex-1 p-10 flex flex-col justify-between">
          <NewLogo theme={p.theme} />
          <div className="mt-6"><ContactInfo theme={p.theme} accent={p.accentText} /></div>
          <div className="mt-8 opacity-90 scale-95 origin-left"><Badges theme={p.theme} /></div>
        </div>
        <div className={`w-[280px] flex items-center justify-center border-l ${p.theme === 'light' ? 'border-white/60 bg-white/40' : 'border-white/10 bg-black/40'}`}>
          <QrBox qrColor={p.qrColor} accent={p.accentText} />
        </div>
      </div>
    </div>
  ),

  // 1. Split Panel
  ({ p }: { p: any }) => (
    <div className={`card-panel flex overflow-hidden`}>
      <div className={`w-[62%] ${p.bgSideA} p-12 flex flex-col justify-between relative overflow-hidden`}>
        <div className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[100px] ${p.blob} opacity-20 pointer-events-none`} />
        <NewLogo theme={p.theme} />
        <div className="mt-8"><ContactInfo theme={p.theme} accent={p.accentText} /></div>
        <div className="mt-12 scale-95 origin-left"><Badges theme={p.theme} /></div>
      </div>
      <div className={`w-[38%] ${p.bgSideB} flex flex-col items-center justify-center border-l ${p.border}`}>
        <QrBox qrColor={p.qrColor} accent={p.accentText} />
        <div className={`mt-8 w-16 h-1 rounded-full ${p.theme === 'light' ? 'bg-slate-300' : 'bg-white/20'}`} />
      </div>
    </div>
  ),

  // 2. Tech Grid Block
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideA} flex flex-col overflow-hidden p-8 relative`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(${p.theme === 'light' ? '#000' : '#fff'} 1px, transparent 1px), linear-gradient(90deg, ${p.theme === 'light' ? '#000' : '#fff'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      
      <div className="flex-1 flex justify-between items-start z-10 w-full mb-8">
         <NewLogo theme={p.theme} />
         <div className={`px-5 py-2 border ${p.border} rounded-full text-xs font-bold tracking-[0.2em] ${p.accentText} uppercase shadow-sm ${p.bgSideB}`}>AigenciaLab System</div>
      </div>
      
      <div className="flex justify-between items-end z-10 w-full mt-auto">
        <div className={`border ${p.border} p-8 rounded-3xl ${p.theme === 'light' ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-md shadow-xl flex-1 max-w-[450px]`}>
          <ContactInfo theme={p.theme} accent={p.accentText} />
          <div className="mt-8 scale-90 origin-left"><Badges theme={p.theme} /></div>
        </div>
        
        <div className={`border ${p.border} p-6 rounded-3xl ${p.theme === 'light' ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-md shadow-xl ml-8`}>
          <QrBox qrColor={p.qrColor} accent={p.accentText} />
        </div>
      </div>
    </div>
  ),

  // 3. Framed Minimalist
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideB} p-12 flex flex-col text-center overflow-hidden relative`}>
       <div className={`absolute border-[12px] ${p.border} inset-5 rounded-[2rem] pointer-events-none opacity-50`} />
       
       <div className="z-10 bg-transparent flex justify-center mt-2"><NewLogo theme={p.theme} /></div>
       <div className={`z-10 mt-2 font-bold tracking-[0.3em] uppercase text-[0.65rem] ${p.accentText}`}>AI Automation Platform</div>
       
       <div className="flex w-full items-center justify-between z-10 px-8 mt-12 bg-transparent">
         <div className="text-left bg-transparent">
           <ContactInfo theme={p.theme} accent={p.accentText} />
         </div>
         <div className="bg-transparent"><QrBox qrColor={p.qrColor} accent={p.accentText} /></div>
       </div>
       
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 scale-90 bg-transparent">
         <Badges theme={p.theme} />
       </div>
    </div>
  ),

  // 4. Diagonal Corporate
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideA} flex overflow-hidden relative`}>
      <div className={`absolute top-0 right-0 w-[550px] h-[900px] ${p.bgSideB} -rotate-[15deg] translate-x-40 -translate-y-20 border-l-[12px] ${p.border} shadow-2xl`} />
      
      <div className="z-10 flex-1 p-14 flex flex-col">
        <NewLogo theme={p.theme} />
        <p className={`${p.accentText} mt-5 font-semibold tracking-[0.2em] uppercase text-xs opacity-90`}>Transformación<br/>Digital IA Sustentable</p>
        <div className="mt-14"><ContactInfo theme={p.theme} accent={p.accentText} /></div>
        <div className="mt-auto scale-90 origin-left"><Badges theme={p.theme} /></div>
      </div>
      
      <div className="z-10 w-[380px] flex items-center justify-center">
        <QrBox qrColor={p.qrColor} accent={p.theme === 'light' ? p.accentText : 'text-white'} textMode={p.theme === 'light' ? 'normal' : 'light'} />
      </div>
    </div>
  )
];

export default function TarjetasPage() {
  const [printId, setPrintId] = useState<number | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => setPrintId(null);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  const handlePrint = (id: number) => {
    setPrintId(id);
    setTimeout(() => { window.print(); }, 100);
  };

  const getStyleName = (layoutIndex: number) => {
    const names = ["Glassmorphism", "Split Duo", "Neo Grid", "Framed Minimal", "Diagonal Corporate"];
    return names[layoutIndex] || "Abstract";
  };

  // Generate 30 variations (6 Palettes x 5 Layouts)
  const variations = [];
  for (let i = 0; i < 30; i++) {
    const paletteIndex = i % 6; // 6 palettes
    const layoutIndex = Math.floor(i / 6); // 5 layouts
    variations.push({
      id: i + 1,
      palette: PALETTES[paletteIndex],
      LayoutComponent: LAYOUTS[layoutIndex],
      styleName: getStyleName(layoutIndex)
    });
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-16 px-4 selection:bg-purple-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&display=swap');

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

        .card-wrapper-inner { width: 900px; display: flex; font-family: 'Inter', sans-serif; margin-inline: auto; transform-origin: top; }
        .card-panel {
          width: 900px; height: 500px; border-radius: 20px; overflow: hidden; position: relative;
          -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
        }
      `}} />

      <div className="max-w-[1000px] mx-auto flex flex-col gap-16 pb-20">
        
        <div className="text-center no-print space-y-5 mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="bg-purple-600 px-3 py-1 rounded-full text-white text-xs font-bold tracking-widest uppercase">Diseño Generativo</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Colección Extendida<br/>30 Tarjetas AigenciaLab
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg mt-2 leading-relaxed">
            Hemos construido un motor estilístico que cruza 5 arquitecturas de diseño UI/UX con 6 paletas de marca (Extraídas del nuevo logo y aigencialab.cl). Selecciona e imprime la variante perfecta.
          </p>
        </div>

        {variations.map((v) => (
          <div key={v.id} className={`space-y-4 ${printId !== null && printId !== v.id ? 'no-print' : ''} ${printId === v.id ? 'print-target' : ''}`}>
            
            <div className="no-print flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200 gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl font-bold text-slate-400 text-xl font-['Outfit']">
                  #{v.id}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Estilo {v.styleName} <span className="text-slate-300 mx-2">|</span> <span className="text-purple-600 font-medium">{v.palette.name}</span></h3>
                  <p className="text-sm text-slate-500 mt-1">Logo oficial, branding algorítmico, y UI premium con 3 partners certificados.</p>
                </div>
              </div>
              <button onClick={() => handlePrint(v.id)} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                🖨️ Imprimir
              </button>
            </div>

            {/* Scale wrapper handles responsive downscaling safely */}
            <div className="card-wrapper-inner scale-[0.38] xs:scale-[0.45] sm:scale-75 md:scale-100">
               <v.LayoutComponent p={v.palette} />
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}
