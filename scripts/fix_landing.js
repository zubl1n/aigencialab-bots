const fs = require('fs');
let c = fs.readFileSync('src/app/page.tsx', 'utf-8');
c = c.replace(/<header[\s\S]*?<\/header>/g, '');
c = c.replace(/<footer[\s\S]*?<\/footer>/g, '');
c = c.replace(/<div className="min-h-screen">/g, '<MainLayout>');
c = c.replace(`import Link from 'next/link'`, `import Link from 'next/link';\nimport { MainLayout } from '@/components/landing/MainLayout';`);
c = c.substring(0, c.lastIndexOf('</div>')) + '</MainLayout>\n  )\n}';
fs.writeFileSync('src/app/page.tsx', c);
console.log('Fixed page.tsx');
