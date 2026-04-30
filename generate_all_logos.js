const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const bgGlow = `<circle cx="256" cy="256" r="220" fill="url(#mainGlow)" opacity="0.3"/>`;
const defsGlowAndBase = `
  <radialGradient id="mainGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0%" stop-color="#9C27B0"/>
    <stop offset="100%" stop-color="#4A148C" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="mainBase" x1="100" y1="100" x2="412" y2="412" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="#A555EC"/>
    <stop offset="100%" stop-color="#311B92"/>
  </linearGradient>
`;

const baseSquare = `<rect x="100" y="100" width="312" height="312" rx="76" fill="url(#mainBase)"/>`;

const getSvg = (inner, customDefs = "") => `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${bgGlow}
  ${baseSquare}
  ${inner}
  <defs>
    ${defsGlowAndBase}
    ${customDefs}
  </defs>
</svg>`;

const getFullSvg = (inner, customDefs = "") => `<svg width="600" height="150" viewBox="0 0 600 150" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(15, 15) scale(0.234375)">
    ${baseSquare}
    ${inner}
  </g>
  <text x="155" y="100" font-family="'Inter', system-ui, -apple-system, sans-serif" font-weight="900" font-size="70" fill="#FFFFFF">AI<tspan font-weight="400" fill="#E2E8F0">genciaLab</tspan></text>
  <defs>
    ${defsGlowAndBase}
    ${customDefs}
  </defs>
</svg>`;

const logos = [
  { id: '01-executive', title: '1. El Nodo Ejecutivo', inner: `<path d="M160 256 L256 160 L352 256 L256 352 Z" stroke="white" stroke-width="16" stroke-linejoin="round" fill="none"/><path d="M210 256 L256 210 L302 256 L256 302 Z" stroke="#00E5FF" stroke-width="12" stroke-linejoin="round" fill="none"/>` },
  { id: '02-swarm', title: '2. El Enjambre Adaptativo', inner: `<rect x="150" y="150" width="80" height="80" rx="20" fill="white" opacity="0.9"/><rect x="280" y="150" width="80" height="80" rx="20" fill="#00E5FF"/><rect x="150" y="280" width="80" height="80" rx="20" fill="#00E5FF"/><rect x="280" y="280" width="80" height="80" rx="20" fill="white" opacity="0.5"/><rect x="215" y="215" width="80" height="80" rx="20" fill="white"/>` },
  { id: '03-datacore', title: '3. El Núcleo Isométrico', inner: `<path d="M256 150 L350 200 L350 310 L256 360 L162 310 L162 200 Z" stroke="white" stroke-width="12" stroke-linejoin="round" fill="none"/><path d="M256 150 L256 250 L162 200" stroke="white" stroke-width="12" stroke-linejoin="round" fill="none"/><path d="M256 250 L350 200" stroke="white" stroke-width="12" stroke-linejoin="round" fill="none"/><path d="M256 250 L256 360" stroke="#00E5FF" stroke-width="12" stroke-linejoin="round" fill="none"/>` },
  { id: '04-codeforge', title: '4. La Forja de Código', inner: `<text x="140" y="300" font-family="monospace" font-weight="900" font-size="140" fill="#00E5FF">[</text><text x="320" y="300" font-family="monospace" font-weight="900" font-size="140" fill="#00E5FF">]</text><path d="M230 180 L280 180 L256 256 L280 330 L230 330 Z" fill="white"/>` },
  { id: '05-prism', title: '5. El Prisma de Claridad', inner: `<path d="M120 256 L256 160 L256 352 Z" fill="white" opacity="0.2"/><path d="M120 200 L200 230" stroke="#00E5FF" stroke-width="6"/><path d="M120 256 L200 256" stroke="#00E5FF" stroke-width="6"/><path d="M120 310 L200 282" stroke="#00E5FF" stroke-width="6"/><line x1="256" y1="210" x2="380" y2="210" stroke="white" stroke-width="10"/><line x1="256" y1="256" x2="400" y2="256" stroke="white" stroke-width="10"/><line x1="256" y1="302" x2="380" y2="302" stroke="white" stroke-width="10"/><path d="M256 160 L320 256 L256 352 Z" fill="white" opacity="0.6"/>` },
  { id: '06-horizon', title: '6. La Escala de Horizonte', inner: `<line x1="160" y1="180" x2="360" y2="180" stroke="white" stroke-width="14" stroke-linecap="round"/><line x1="200" y1="220" x2="380" y2="220" stroke="#00E5FF" stroke-width="14" stroke-linecap="round"/><line x1="120" y1="260" x2="340" y2="260" stroke="white" stroke-width="14" stroke-linecap="round"/><line x1="180" y1="300" x2="320" y2="300" stroke="#00E5FF" stroke-width="14" stroke-linecap="round"/><line x1="230" y1="340" x2="380" y2="340" stroke="white" stroke-width="14" stroke-linecap="round"/>` },
  { id: '07-catalyst', title: '7. El Catalizador', inner: `<circle cx="256" cy="270" r="80" stroke="white" stroke-width="12" fill="none"/><path d="M256 190 L256 140" stroke="#00E5FF" stroke-width="12" stroke-linecap="round"/><circle cx="256" cy="270" r="30" fill="#00E5FF"/><path d="M256 190 C220 190 200 220 200 270" stroke="white" stroke-width="12" fill="none"/>` },
  { id: '08-silent', title: '8. El Motor Silencioso', inner: `<rect x="100" y="100" width="312" height="312" rx="76" fill="#0B0F19"/><rect x="100" y="100" width="312" height="312" rx="76" stroke="#9C27B0" stroke-width="4"/><circle cx="256" cy="256" r="40" stroke="white" stroke-width="2" fill="none"/><circle cx="256" cy="256" r="20" fill="#00E5FF" opacity="0.8"/><path d="M256 180 L256 200 M256 312 L256 332 M180 256 L200 256 M312 256 L332 256" stroke="white" stroke-width="4" stroke-linecap="round"/>` },
  { id: '09-liminal', title: '9. La Estructura Liminal', inner: `<rect x="140" y="140" width="232" height="232" rx="40" stroke="white" stroke-opacity="0.3" stroke-width="8" fill="none"/><rect x="180" y="180" width="152" height="152" rx="20" stroke="#00E5FF" stroke-width="8" fill="none"/><path d="M140 140 L180 180 M372 140 L332 180 M140 372 L180 332 M372 372 L332 332" stroke="white" stroke-opacity="0.5" stroke-width="6"/><circle cx="256" cy="256" r="30" fill="white"/>` },
  { id: '10-fluid', title: '10. La Identidad Dinámica', inner: `<path d="M160 256 Q 200 180 256 256 T 352 256 L 352 352 C 352 400 300 380 256 380 C 200 380 160 400 160 352 Z" fill="url(#fluidFlow)"/><circle cx="256" cy="200" r="20" fill="white"/>`, customDefs: `<linearGradient id="fluidFlow" x1="160" y1="200" x2="352" y2="380" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#00E5FF"/><stop offset="100%" stop-color="#FF00FF"/></linearGradient>` },
  
  // NEW 20 VARIABLES
  { id: '11-infinity', title: '11. El Lazo Infinito', inner: `<path d="M180 256 C 180 200 240 200 256 256 C 272 312 332 312 332 256 C 332 200 272 200 256 256 C 240 312 180 312 180 256 Z" stroke="white" stroke-width="16" fill="none"/><circle cx="256" cy="256" r="12" fill="#00E5FF"/>` },
  { id: '12-vault', title: '12. La Bóveda SOC2', inner: `<path d="M220 180 L292 180 C 310 180 310 210 292 210 L 220 210 C 202 210 202 180 220 180 Z" fill="#00E5FF"/><rect x="180" y="240" width="152" height="120" rx="16" fill="white"/><circle cx="256" cy="300" r="16" fill="#0B0F19"/><path d="M256 316 L256 330" stroke="#0B0F19" stroke-width="6" stroke-linecap="round"/>` },
  { id: '13-target', title: '13. El Objetivo B2B', inner: `<circle cx="256" cy="256" r="90" stroke="white" stroke-opacity="0.3" stroke-width="12" fill="none"/><circle cx="256" cy="256" r="50" stroke="#00E5FF" stroke-width="12" fill="none"/><circle cx="256" cy="256" r="16" fill="white"/><path d="M256 130 L256 160 M256 352 L256 382 M130 256 L160 256 M352 256 L382 256" stroke="white" stroke-width="8" stroke-linecap="round"/>` },
  { id: '14-spark', title: '14. La Chispa IA', inner: `<path d="M256 140 Q 256 256 372 256 Q 256 256 256 372 Q 256 256 140 256 Q 256 256 256 140 Z" fill="white"/><circle cx="256" cy="256" r="30" fill="#00E5FF"/>` },
  { id: '15-shield', title: '15. El Escudo Trust', inner: `<path d="M180 160 L332 160 L332 256 C 332 310 256 360 256 360 C 256 360 180 310 180 256 Z" stroke="white" stroke-width="16" fill="none" stroke-linejoin="round"/><path d="M220 220 L250 250 L290 200" stroke="#00E5FF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  { id: '16-pathway', title: '16. El Camino KPI', inner: `<path d="M160 320 L210 260 L260 290 L350 180" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="160" cy="320" r="16" fill="#00E5FF"/><circle cx="210" cy="260" r="14" fill="#00E5FF"/><circle cx="260" cy="290" r="14" fill="#00E5FF"/><circle cx="350" cy="180" r="20" fill="white"/>` },
  { id: '17-echo', title: '17. El Eco Sistémico', inner: `<rect x="140" y="140" width="232" height="232" rx="40" stroke="white" stroke-opacity="0.2" stroke-width="6" fill="none"/><rect x="180" y="180" width="152" height="152" rx="20" stroke="white" stroke-opacity="0.5" stroke-width="8" fill="none"/><rect x="220" y="220" width="72" height="72" rx="10" fill="#00E5FF"/>` },
  { id: '18-constellation', title: '18. La Constelación', inner: `<line x1="200" y1="180" x2="310" y2="230" stroke="white" stroke-width="4"/><line x1="310" y1="230" x2="250" y2="330" stroke="white" stroke-width="4"/><line x1="250" y1="330" x2="160" y2="280" stroke="white" stroke-width="4"/><line x1="160" y1="280" x2="200" y2="180" stroke="white" stroke-width="4"/><circle cx="200" cy="180" r="14" fill="#00E5FF"/><circle cx="310" cy="230" r="20" fill="white"/><circle cx="250" cy="330" r="16" fill="#00E5FF"/><circle cx="160" cy="280" r="12" fill="white"/>` },
  { id: '19-circuit', title: '19. El Circuito', inner: `<path d="M180 140 L180 200 L256 256 L332 200 L332 140" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M180 372 L180 312 L256 256 L332 312 L332 372" stroke="#00E5FF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  { id: '20-visionary', title: '20. El Visionario (Ojo)', inner: `<path d="M150 256 Q 256 160 362 256 Q 256 352 150 256 Z" stroke="white" stroke-width="12" fill="none"/><circle cx="256" cy="256" r="30" fill="#00E5FF"/>` },
  { id: '21-reactor', title: '21. El Reactor Atomic', inner: `<ellipse cx="256" cy="256" rx="90" ry="30" transform="rotate(30 256 256)" stroke="white" stroke-opacity="0.8" stroke-width="8" fill="none"/><ellipse cx="256" cy="256" rx="90" ry="30" transform="rotate(-30 256 256)" stroke="#00E5FF" stroke-width="8" fill="none"/><circle cx="256" cy="256" r="20" fill="white"/>` },
  { id: '22-blueprint', title: '22. El Plano Arquitectura', inner: `<rect x="150" y="150" width="212" height="212" fill="url(#gridPattern)"/><circle cx="256" cy="256" r="16" fill="#00E5FF"/>`, customDefs: `<pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-opacity="0.2" stroke-width="2"/></pattern>` },
  { id: '23-gateway', title: '23. El Portal Dimensional', inner: `<path d="M210 320 L210 180 L302 140 L302 280 Z" stroke="white" stroke-width="12" stroke-linejoin="round" fill="none"/><path d="M210 320 L150 280 L150 140 L210 180 Z" fill="#00E5FF" opacity="0.8"/><path d="M210 180 L302 140 L242 100 L150 140 Z" fill="white" opacity="0.4"/>` },
  { id: '24-anchor', title: '24. El Ancla Estabilidad', inner: `<path d="M256 160 L256 340" stroke="white" stroke-width="16" stroke-linecap="round"/><path d="M200 160 L312 160" stroke="white" stroke-width="16" stroke-linecap="round"/><path d="M180 270 C 180 340 332 340 332 270" stroke="#00E5FF" stroke-width="16" stroke-linecap="round" fill="none"/>` },
  { id: '25-orbit', title: '25. La Órbita', inner: `<circle cx="256" cy="256" r="30" fill="white"/><ellipse cx="256" cy="256" rx="100" ry="40" transform="rotate(-45 256 256)" stroke="#00E5FF" stroke-width="10" stroke-dasharray="20 10" fill="none"/>` },
  { id: '26-spectrum', title: '26. El Espectro AudioIA', inner: `<rect x="160" y="220" width="20" height="72" rx="10" fill="white"/><rect x="200" y="170" width="20" height="172" rx="10" fill="#00E5FF"/><rect x="240" y="110" width="20" height="292" rx="10" fill="white"/><rect x="280" y="150" width="20" height="212" rx="10" fill="#00E5FF"/><rect x="320" y="200" width="20" height="112" rx="10" fill="white"/>` },
  { id: '27-matrix', title: '27. La Matriz 3x3', inner: `<circle cx="180" cy="180" r="16" fill="white"/><circle cx="256" cy="180" r="16" fill="#00E5FF"/><circle cx="332" cy="180" r="16" fill="white"/><circle cx="180" cy="256" r="16" fill="#00E5FF"/><circle cx="256" cy="256" r="16" fill="white"/><circle cx="332" cy="256" r="16" fill="#00E5FF"/><circle cx="180" cy="332" r="16" fill="white"/><circle cx="256" cy="332" r="16" fill="#00E5FF"/><circle cx="332" cy="332" r="16" fill="white"/>` },
  { id: '28-apex', title: '28. El Cúspide', inner: `<path d="M256 160 L340 320 L172 320 Z" stroke="white" stroke-width="16" stroke-linejoin="round" fill="none"/><circle cx="256" cy="240" r="16" fill="#00E5FF"/>` },
  { id: '29-nexus', title: '29. El Nexo Cruzado', inner: `<path d="M160 160 L352 352 M160 352 L352 160" stroke="white" stroke-opacity="0.3" stroke-width="20" stroke-linecap="round"/><path d="M220 220 L292 292 M220 292 L292 220" stroke="#00E5FF" stroke-width="20" stroke-linecap="round"/>` },
  { id: '30-pulse', title: '30. El Pulso Vital', inner: `<path d="M140 256 L200 256 L230 160 L280 352 L310 256 L372 256" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
];

let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AigenciaLab - 30 Branding Proposals</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body { background-color: #06090F; color: #E2E8F0; font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 60px; }
    .header { text-align: center; margin-bottom: 60px; }
    h1 { background: linear-gradient(90deg, #A555EC, #00E5FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 3rem; margin-bottom: 10px; }
    p.subtitle { font-size: 1.2rem; color: #94A3B8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 40px; }
    .card { background: #0B0F19; border: 1px solid #1E293B; border-radius: 24px; padding: 30px; display: flex; flex-direction: column; align-items: center; transition: all 0.3s ease; }
    .card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); border-color: #A555EC; }
    .card h2 { margin-top: 0; margin-bottom: 20px; font-size: 1.3rem; color: #F8FAFC; }
    .img-container { width: 100%; height: 180px; display: flex; justify-content: center; align-items: center; padding: 20px; background: #02040A; border-radius: 16px; margin-bottom: 20px; }
    .img-container img { max-width: 100%; height: 100%; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; width: 100%; }
    .btn { padding: 10px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; font-size: 0.9rem; margin-bottom: 5px; border: none; }
    .btn-primary { background: #5500FF; color: white; }
    .btn-primary:hover { background: #7C3AED; }
    .btn-outline { background: transparent; border: 1px solid #334155; color: #E2E8F0; }
    .btn-outline:hover { border-color: #00E5FF; color: #00E5FF; }
  </style>
  <script>
    // Robust local download function bypassing file:// limits
    function downloadBlob(filename, text) {
      var blob = new Blob([text], {type: "image/svg+xml"});
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }
  </script>
</head>
<body>
  <div class="header">
    <h1>30 Propuestas de Identidad: AigenciaLab</h1>
    <p class="subtitle">Descargas arregladas - Todos los logos exportan 100% vector local</p>
  </div>
  <div class="grid">
`;

logos.forEach(logo => {
  const iconSvg = getSvg(logo.inner, logo.customDefs || '');
  const fullSvg = getFullSvg(logo.inner, logo.customDefs || '');
  
  fs.writeFileSync(path.join(outDir, logo.id + '-icon.svg'), iconSvg);
  fs.writeFileSync(path.join(outDir, logo.id + '-full.svg'), fullSvg);
  
  // Create escaped string for the JS download function
  const cleanFull = fullSvg.replace(/"/g, '&quot;').replace(/'/g, "\\'");
  const cleanIcon = iconSvg.replace(/"/g, '&quot;').replace(/'/g, "\\'");

  htmlContent += `
    <div class="card">
      <h2>` + logo.title + `</h2>
      <div class="img-container">
        <img src="./logos/` + logo.id + `-full.svg" alt="` + logo.title + `">
      </div>
      <div class="actions">
        <button onclick="downloadBlob('${logo.id}-full.svg', '${cleanFull}')" class="btn btn-primary">Descargar Completo</button>
        <button onclick="downloadBlob('${logo.id}-icon.svg', '${cleanIcon}')" class="btn btn-outline">Descargar Icono</button>
      </div>
    </div>
  `;
});

htmlContent += `
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'public', '30-brand-kit.html'), htmlContent);
console.log('Successfully generated 60 SVGs and 1 HTML presentation.');
