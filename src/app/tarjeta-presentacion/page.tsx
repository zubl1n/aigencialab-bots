'use client';

import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';

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
  <div className={`flex flex-col gap-2.5 font-medium text-[0.80rem] ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
      </span> 
      aigencialab.cl
    </div>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#25D366" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </span> 
      +56 9 3966 0144
    </div>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="#E1306C" className="w-[1.1rem] h-[1.1rem]">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>
      </span> 
      @aigencialab
    </div>
    <div className="flex items-center gap-3">
      <span className={`w-8 h-8 rounded-full flex items-center justify-center border ${theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 opacity-70"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
      </span> 
      hola@aigencialab.cl
    </div>
  </div>
);

const Badges = ({ theme }: { theme: string }) => (
  <div className={`flex flex-wrap gap-2 mt-auto pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/10'}`}>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.gcp} className="w-3.5 h-3.5 object-contain" alt="GCP" crossOrigin="anonymous" />
      Cloud Partner
    </div>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.openai} className={`w-3 h-3 object-contain ${theme === 'dark' ? 'invert opacity-90' : ''}`} alt="OpenAI" crossOrigin="anonymous" />
      Solutions
    </div>
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[0.55rem] font-bold tracking-widest border uppercase ${theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-black/30 border-white/10 text-slate-300'}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO_SVGS.meta} className="w-3.5 h-3.5 object-contain" alt="Meta" crossOrigin="anonymous" />
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

const BACK_LAYOUTS = [
  // 0. Glassmorphism
  ({ p }: { p: any }) => (
    <div className={`card-panel bg-gradient-to-r ${p.gradLeft} ${p.gradRight} overflow-hidden flex items-center justify-center relative`}>
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] ${p.blob} opacity-40 mix-blend-screen pointer-events-none`} />
      <div className="z-10 flex flex-col items-center justify-center scale-125">
        <NewLogo theme={p.theme} />
        <p className={`${p.accentText} mt-6 font-medium tracking-[0.3em] uppercase text-xs opacity-80`}>Transformación Digital</p>
      </div>
    </div>
  ),

  // 1. Split Panel
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideB} flex flex-col items-center justify-center relative overflow-hidden`}>
      <div className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[100px] ${p.blob} opacity-20 pointer-events-none`} />
      <div className="scale-125"><NewLogo theme={p.theme} /></div>
    </div>
  ),

  // 2. Tech Grid Block
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideA} flex items-center justify-center overflow-hidden relative`}>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(${p.theme === 'light' ? '#000' : '#fff'} 1px, transparent 1px), linear-gradient(90deg, ${p.theme === 'light' ? '#000' : '#fff'} 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
      <div className={`border ${p.border} p-12 rounded-3xl ${p.theme === 'light' ? 'bg-white/90' : 'bg-black/60'} backdrop-blur-md shadow-xl flex flex-col items-center scale-110 z-10`}>
         <NewLogo theme={p.theme} />
         <div className={`mt-6 px-5 py-2 border ${p.border} rounded-full text-xs font-bold tracking-[0.2em] ${p.accentText} uppercase shadow-sm ${p.bgSideB}`}>AigenciaLab System</div>
      </div>
    </div>
  ),

  // 3. Framed Minimalist
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideB} p-12 flex flex-col items-center justify-center overflow-hidden relative`}>
       <div className={`absolute border-[12px] ${p.border} inset-5 rounded-[2rem] pointer-events-none opacity-50`} />
       <div className="z-10 scale-125 bg-transparent"><NewLogo theme={p.theme} /></div>
       <div className={`z-10 mt-6 font-bold tracking-[0.4em] uppercase text-[0.75rem] ${p.accentText}`}>AI Automation Platform</div>
    </div>
  ),

  // 4. Diagonal Corporate
  ({ p }: { p: any }) => (
    <div className={`card-panel ${p.bgSideA} flex overflow-hidden relative items-center justify-center`}>
      <div className={`absolute bottom-0 left-0 w-[550px] h-[900px] ${p.bgSideB} -rotate-[15deg] -translate-x-40 translate-y-20 border-r-[12px] ${p.border} shadow-2xl`} />
      <div className="z-10 scale-125 bg-transparent flex flex-col items-center">
        <NewLogo theme={p.theme} />
        <p className={`${p.accentText} mt-5 font-semibold tracking-[0.2em] uppercase text-xs opacity-90 text-center`}>Transformación<br/>Digital IA Sustentable</p>
      </div>
    </div>
  )
];

export default function TarjetasPage() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadPdf = async (id: number, styleName: string, paletteName: string) => {
    setDownloadingId(id);
    try {
      const frontEl = document.getElementById(`card-front-${id}`);
      const backEl = document.getElementById(`card-back-${id}`);
      
      if (!frontEl || !backEl) return;

      // Ensure images are loaded properly before generating canvas
      const imgFront = await toPng(frontEl, { pixelRatio: 3, skipFonts: false, fetchRequestInit: { mode: 'cors' } });
      const imgBack = await toPng(backEl, { pixelRatio: 3, skipFonts: false, fetchRequestInit: { mode: 'cors' } });

      // 900x500 pixels is roughly 90x50 mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [90, 50]
      });

      pdf.addImage(imgFront, 'PNG', 0, 0, 90, 50);
      pdf.addPage([90, 50], 'landscape');
      pdf.addImage(imgBack, 'PNG', 0, 0, 90, 50);

      pdf.save(`AigenciaLab_Tarjeta_${styleName.replace(/\s+/g, '_')}_${paletteName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Hubo un error generando el PDF. Revisa la consola.");
    } finally {
      setDownloadingId(null);
    }
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
      FrontLayout: LAYOUTS[layoutIndex],
      BackLayout: BACK_LAYOUTS[layoutIndex],
      styleName: getStyleName(layoutIndex)
    });
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] py-16 px-4 selection:bg-purple-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&display=swap');

        .card-wrapper-inner { width: 900px; display: flex; font-family: 'Inter', sans-serif; margin-inline: auto; transform-origin: top; }
        .card-panel {
          width: 900px; height: 500px; border-radius: 20px; overflow: hidden; position: relative;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15);
        }
      `}} />

      <div className="max-w-[1200px] mx-auto flex flex-col gap-16 pb-20">
        
        <div className="text-center space-y-5 mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="bg-purple-600 px-3 py-1 rounded-full text-white text-xs font-bold tracking-widest uppercase">Diseño Generativo</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] leading-tight">
            Colección Extendida<br/>30 Tarjetas AigenciaLab
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg mt-2 leading-relaxed">
            Hemos construido un motor estilístico que cruza 5 arquitecturas de diseño UI/UX con 6 paletas de marca (Extraídas del nuevo logo y aigencialab.cl). Selecciona y descarga en PDF tu diseño.
          </p>
        </div>

        {variations.map((v) => (
          <div key={v.id} className="space-y-4">
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200 gap-4">
              <div className="flex gap-4 items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-xl font-bold text-slate-400 text-xl font-['Outfit']">
                  #{v.id}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Estilo {v.styleName} <span className="text-slate-300 mx-2">|</span> <span className="text-purple-600 font-medium">{v.palette.name}</span></h3>
                  <p className="text-sm text-slate-500 mt-1">Logo oficial, branding algorítmico, y UI premium con 3 partners certificados.</p>
                </div>
              </div>
              <button 
                onClick={() => downloadPdf(v.id, v.styleName, v.palette.name)} 
                disabled={downloadingId === v.id}
                className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
              >
                {downloadingId === v.id ? '⏳ Generando PDF...' : '📄 Descargar PDF'}
              </button>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 items-center justify-center">
              {/* Front Side */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cara Frontal</span>
                <div className="card-wrapper-inner scale-[0.38] xs:scale-[0.45] sm:scale-75 md:scale-100 xl:scale-50 2xl:scale-75 mb-[-250px] sm:mb-[-125px] md:mb-0 xl:mb-[-250px] 2xl:mb-[-125px] !w-auto">
                   <div id={`card-front-${v.id}`}>
                     <v.FrontLayout p={v.palette} />
                   </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="flex flex-col items-center gap-2 mt-32 sm:mt-16 md:mt-0 xl:mt-0">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Cara Trasera</span>
                <div className="card-wrapper-inner scale-[0.38] xs:scale-[0.45] sm:scale-75 md:scale-100 xl:scale-50 2xl:scale-75 mb-[-250px] sm:mb-[-125px] md:mb-0 xl:mb-[-250px] 2xl:mb-[-125px] !w-auto">
                   <div id={`card-back-${v.id}`}>
                     <v.BackLayout p={v.palette} />
                   </div>
                </div>
              </div>
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

