'use client';

import React from 'react';

export default function TarjetaPresentacionPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;600&display=swap');

        .tarjeta-container *, .tarjeta-container *::before, .tarjeta-container *::after { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          /* override global body styles for this page */
          background-color: #e5e7eb !important;
        }

        .tarjeta-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          padding: 40px 20px;
          gap: 40px;
        }

        .tarjeta-container h2 {
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: #6b7280;
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .print-note {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: .85rem;
          color: #92400e;
          max-width: 600px;
          text-align: center;
          margin-bottom: 10px;
        }

        .card-wrapper {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .card {
          width: 900px;
          height: 500px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0,0,0,.4);
          position: relative;
          flex-shrink: 0;
        }

        .card-front {
          background: #0a0c14;
          display: flex;
          align-items: stretch;
        }

        .card-front .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(37,99,235,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37,99,235,.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .card-front .glow-orb {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(37,99,235,.15) 0%, transparent 70%);
          top: -80px;
          right: 180px;
          pointer-events: none;
        }

        .card-front .content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 48px;
        }

        .logo {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -.02em;
        }
        .logo span { color: #00cfff; }

        .tagline {
          font-size: .85rem;
          color: rgba(255,255,255,.5);
          letter-spacing: .05em;
          margin-top: 4px;
          font-weight: 300;
        }

        .contact-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: .82rem;
          color: rgba(255,255,255,.75);
        }

        .contact-item .icon {
          width: 22px;
          height: 22px;
          background: rgba(37,99,235,.2);
          border: 1px solid rgba(37,99,235,.3);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: .7rem;
          flex-shrink: 0;
        }

        .features-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .feature-pill {
          font-size: .68rem;
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(124,58,237,.3);
          background: rgba(124,58,237,.1);
          color: rgba(255,255,255,.6);
          white-space: nowrap;
        }

        .gradient-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563eb, #7c3aed, #00cfff);
        }

        .card-front .qr-side {
          position: relative;
          z-index: 2;
          width: 220px;
          flex-shrink: 0;
          background: rgba(255,255,255,.03);
          border-left: 1px solid rgba(255,255,255,.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 20px;
          gap: 12px;
        }

        .qr-frame {
          background: #fff;
          border-radius: 12px;
          padding: 10px;
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-frame img {
          width: 130px;
          height: 130px;
        }

        .qr-label {
          font-size: .7rem;
          color: #00cfff;
          text-align: center;
          line-height: 1.4;
          letter-spacing: .04em;
        }

        .qr-sub {
          font-size: .6rem;
          color: rgba(255,255,255,.3);
          text-align: center;
        }

        .card-back {
          background: #0a0c14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 28px;
          position: relative;
        }

        .card-back .hex-bg {
          position: absolute;
          inset: 0;
          opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='50' height='57.74'%3E%3Cpolygon points='25,3 47,15.87 47,41.87 25,54.74 3,41.87 3,15.87' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3C/svg%3E");
          background-size: 50px 57.74px;
        }

        .logo-mono {
          position: relative;
          z-index: 2;
          font-size: 4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -.04em;
          line-height: 1;
        }

        .back-features {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 16px;
        }

        .back-pill {
          font-size: .72rem;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(124,58,237,.4);
          background: rgba(124,58,237,.12);
          color: rgba(255,255,255,.7);
          backdrop-filter: blur(4px);
        }

        .back-url {
          position: relative;
          z-index: 2;
          font-size: .9rem;
          color: #00cfff;
          letter-spacing: .08em;
          font-weight: 500;
        }

        .corner-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(37,99,235,.5);
          box-shadow: 0 0 12px rgba(37,99,235,.6);
        }
        .corner-dot.tl { top: 20px; left: 20px; }
        .corner-dot.tr { top: 20px; right: 20px; }
        .corner-dot.bl { bottom: 20px; left: 20px; }
        .corner-dot.br { bottom: 20px; right: 20px; }

        .controls {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .btn-ctrl {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: .85rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: .2s;
          text-decoration: none;
        }

        .btn-print { background: linear-gradient(135deg, #2563eb, #7c3aed); color: #fff; }
        .btn-print:hover { opacity: .85; }
        .btn-down { background: #1f2937; color: #fff; border: 1px solid rgba(255,255,255,.1); }
        .btn-down:hover { border-color: rgba(255,255,255,.3); }

        .card-label {
          font-family: 'Inter', sans-serif;
          font-size: .75rem;
          color: #9ca3af;
          letter-spacing: .1em;
          text-transform: uppercase;
          margin-top: 4px;
          text-align: center;
        }

        @media print {
          title { display: none; }
          @page { margin: 0; }
          body, html { margin: 0; padding: 0; background: white !important; }
          body * { visibility: hidden; }
          .card-wrapper, .card-wrapper * { visibility: visible; }
          .card-wrapper { position: absolute; left: 0; top: 0; gap: 0; }
          .controls, .print-note, h2, .card-label, .tarjeta-meta { display: none !important; }
          .card { box-shadow: none; page-break-after: always; transform: scale(1); margin: 0; left: 0; top: 0; }
          .tarjeta-container { padding: 0; background: white; }
        }
      `}} />

      <div className="tarjeta-container">
        <h2>📇 Tarjeta de Presentación — AigenciaLab.cl</h2>
        <div className="print-note">
          📏 Medidas reales: <strong>9cm × 5cm</strong> · Imprime en cartulina 350gsm · Usar &quot;Imprimir a tamaño real&quot; sin escalar
        </div>

        <div className="card-wrapper">
          {/* FRENTE */}
          <div>
            <div className="card card-front">
              <div className="grid-bg"></div>
              <div className="glow-orb"></div>
              <div className="gradient-line"></div>

              <div className="content">
                <div>
                  <div className="logo">AigenciaLab<span>.cl</span></div>
                  <div className="tagline">Automatización IA para Empresas B2B</div>
                </div>

                <div className="contact-block">
                  <div className="contact-item">
                    <div className="icon">🌐</div>
                    <span>aigencialab.cl</span>
                  </div>
                  <div className="contact-item">
                    <div className="icon">📩</div>
                    <span>hola@aigencialab.cl</span>
                  </div>
                  <div className="contact-item">
                    <div className="icon">💬</div>
                    <span>WhatsApp · LinkedIn · Instagram</span>
                  </div>
                  <div className="contact-item">
                    <div className="icon">📍</div>
                    <span>Santiago, Chile</span>
                  </div>
                </div>

                <div>
                  <div className="features-row">
                    <span className="feature-pill">🤖 Agentes IA</span>
                    <span className="feature-pill">💬 WhatsApp API</span>
                    <span className="feature-pill">📊 Business Intelligence</span>
                    <span className="feature-pill">🛒 Ecommerce</span>
                    <span className="feature-pill">⚖️ Ley 21.663</span>
                  </div>
                </div>
              </div>

              {/* QR Side */}
              <div className="qr-side">
                <div className="qr-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://chart.googleapis.com/chart?cht=qr&chs=130x130&chl=https%3A%2F%2Faigencialab.cl%2Faudit%2F&choe=UTF-8&chld=M|1"
                    alt="QR Auditoría Gratuita"
                    width="130" height="130"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      ((e.target as HTMLElement).nextElementSibling as HTMLElement).style.display = 'flex';
                    }}
                  />
                  <div style={{display:'none',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'130px',height:'130px',background:'#fff',fontSize:'.55rem',color:'#1A1D26',textAlign:'center',padding:'6px',wordBreak:'break-all',fontFamily:'monospace'}}>
                    aigencialab.cl/audit/
                  </div>
                </div>
                <div className="qr-label">🔍 Auditoría<br/>IA Gratuita</div>
                <div className="qr-sub">Escanea para recibir<br/>tu diagnóstico gratis</div>
              </div>
            </div>
            <div className="card-label">◀ FRENTE (Front)</div>
          </div>

          {/* DORSO */}
          <div>
            <div className="card card-back">
              <div className="hex-bg"></div>
              <div className="corner-dot tl"></div>
              <div className="corner-dot tr"></div>
              <div className="corner-dot bl"></div>
              <div className="corner-dot br"></div>

              <div className="logo-mono">A</div>

              <div className="back-features">
                <span className="back-pill">🤖 Agentes IA</span>
                <span className="back-pill">💬 WhatsApp</span>
                <span className="back-pill">📊 Analytics</span>
              </div>

              <div className="back-url">aigencialab.cl</div>
            </div>
            <div className="card-label">DORSO (Back) ▶</div>
          </div>
        </div>

        <div className="controls">
          <button className="btn-ctrl btn-print" onClick={() => window.print()}>🖨️ Imprimir Tarjeta</button>
          <a className="btn-ctrl btn-down"
             href="https://chart.googleapis.com/chart?cht=qr&chs=400x400&chl=https%3A%2F%2Faigencialab.cl%2Faudit%2F&choe=UTF-8&chld=M|1"
             download="qr-aigencialab-auditoria.png"
             target="_blank"
             rel="noopener noreferrer">
            ⬇️ Descargar QR
          </a>
          <a className="btn-ctrl btn-down"
             href="https://aigencialab.cl/audit/"
             target="_blank"
             rel="noopener noreferrer">
            🔍 Ir a Auditoría
          </a>
        </div>

        <p className="tarjeta-meta" style={{fontSize:'.75rem',color:'#9ca3af',marginTop:'8px',textAlign:'center'}}>
          Para impresión profesional: envía este archivo a una imprenta con instrucción &quot;9x5cm, cartulina 350gsm Soft Touch&quot;
        </p>
      </div>
    </>
  );
}
