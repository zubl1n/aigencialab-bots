/**
 * qa-routes.mjs — Verifica rutas críticas en producción
 */

const BASE = 'https://aigencialab.cl'

const ROUTES = [
  // Public pages
  { url: '/',               expect: 200, label: 'Landing' },
  { url: '/precios',        expect: 200, label: 'Precios' },
  { url: '/register',       expect: 200, label: 'Register' },
  { url: '/audit',          expect: 200, label: 'Audit Lead Magnet' },
  { url: '/blog',           expect: 200, label: 'Blog listing' },
  { url: '/blog/triplicar-ventas-con-ia', expect: 200, label: 'Blog article' },
  { url: '/blog/costo-no-tener-ia-2026',  expect: 200, label: 'Blog nuevo 1' },
  { url: '/blog/whatsapp-ia-triplicar-leads', expect: 200, label: 'Blog nuevo 2' },
  { url: '/casos-exito',    expect: 200, label: 'Casos de éxito' },
  { url: '/sitemap.xml',    expect: 200, label: 'SEO: sitemap.xml' },
  { url: '/robots.txt',     expect: 200, label: 'SEO: robots.txt' },
  { url: '/login',          expect: 200, label: 'Login page' },
  // API routes
  { url: '/api/sitemap',    expect: 200, label: 'API sitemap' },
  // Should redirect (admin requires auth)
  { url: '/admin',          expect: [200,307,302,401], label: 'Admin (protected)' },
  { url: '/dashboard',      expect: [200,307,302,401], label: 'Dashboard (protected)' },
  // Widget routes
  { url: '/api/widget/test-client-id/script.js', expect: 200, label: 'Widget script.js' },
]

console.log(`🔍 QA Route Check — ${BASE}\n`)
console.log('─'.repeat(60))

let passed = 0, failed = 0, warned = 0

for (const route of ROUTES) {
  const url = `${BASE}${route.url}`
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'AIgenciaLab-QA/1.0' }
    })
    
    const expects = Array.isArray(route.expect) ? route.expect : [route.expect]
    const ok = expects.includes(res.status)
    
    const icon = ok ? '✅' : '❌'
    const statusStr = res.status.toString().padStart(3)
    console.log(`${icon} [${statusStr}] ${route.label.padEnd(30)} ${route.url}`)
    
    if (ok) passed++
    else { failed++; console.log(`   ⚠️  Expected ${expects.join('/')} got ${res.status}`) }
    
  } catch (err) {
    console.log(`❌ [ERR] ${route.label.padEnd(30)} ${err.message.slice(0,50)}`)
    failed++
  }
}

console.log('\n' + '─'.repeat(60))
console.log(`\n📊 Results: ${passed} passed · ${failed} failed · ${ROUTES.length} total`)
if (failed === 0) console.log('✅ All routes OK — production is healthy!')
else console.log(`⚠️  ${failed} route(s) need attention`)
