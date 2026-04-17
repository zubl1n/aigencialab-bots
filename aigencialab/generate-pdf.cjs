const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        console.log('Iniciando Puppeteer...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        const filePath = `file:///${path.join(__dirname, 'pitch-deck-ignite.html').replace(/\\/g, '/')}`;
        console.log(`Cargando archivo: ${filePath}`);
        
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
        
        await page.goto(filePath, { waitUntil: 'networkidle0', timeout: 60000 });
        
        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Generando PDF...');
        await page.pdf({
            path: 'Pitch_Deck_AIgenciaLab_Ignite.pdf',
            width: '1920px',
            height: '1080px',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        
        await browser.close();
        console.log('PDF Generado exitosamente: Pitch_Deck_AIgenciaLab_Ignite.pdf');
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
})();
