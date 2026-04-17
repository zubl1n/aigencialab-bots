import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Instalar Widget IA — Guía de Instalación | AIgenciaLab',
  description:
    'Agrega un asistente IA a tu sitio web en menos de 2 minutos. Copia el snippet, pégalo en tu HTML y listo. Compatible con WordPress, Shopify, Wix y cualquier plataforma.',
}

const PLATFORMS = [
  { name: 'WordPress',  emoji: '🔵', steps: ['Ir a Apariencia → Editor de temas', 'Abrir footer.php', 'Pegar el snippet antes de </body>'] },
  { name: 'Shopify',    emoji: '🟢', steps: ['Ir a Temas → Editar código', 'Abrir theme.liquid', 'Pegar el snippet antes de </body>'] },
  { name: 'Wix',        emoji: '🟡', steps: ['Ir a Ajustes → Código personalizado', 'Agregar nuevo código en "Body - End"', 'Pegar el snippet y guardar'] },
  { name: 'HTML puro',  emoji: '⚪', steps: ['Abrir tu archivo index.html', 'Pegar el snippet antes de </body>', 'Subir el archivo a tu servidor'] },
  { name: 'Next.js',    emoji: '⚫', steps: ['Abrir _app.tsx o layout.tsx', 'Usar <Script strategy="afterInteractive">', 'Pasar data-api-key como prop'] },
  { name: 'Webflow',    emoji: '🔷', steps: ['Ir a Project Settings → Custom Code', 'Pegar el snippet en Footer Code', 'Publicar tu sitio'] },
]

const FEATURES = [
  { emoji: '⚡', title: 'Instalación en 2 minutos', desc: 'Copia un snippet de 3 líneas y pégalo en tu web. Sin configurar servidores ni APIs.' },
  { emoji: '🎨', title: 'Totalmente personalizable', desc: 'Cambia colores, nombre del bot y mensaje de bienvenida desde tu dashboard.' },
  { emoji: '📱', title: 'Responsive nativo', desc: 'Funciona perfectamente en desktop, tablet y móvil. Sin CSS adicional.' },
  { emoji: '🔒', title: 'HTTPS seguro', desc: 'Toda comunicación cifrada. Cumple Ley N°19.628 de datos personales.' },
  { emoji: '💬', title: 'Lead capture integrado', desc: 'Captura nombre, email y teléfono automáticamente antes del mensaje 3.' },
  { emoji: '🌐', title: 'Compatible con todo', desc: 'Funciona en WordPress, Shopify, Wix, Webflow, React, Vue, Angular y HTML puro.' },
]

export default function InstalarWidgetPage() {
  const sampleSnippet = `<script
  data-api-key="YOUR_API_KEY"
  src="https://aigencialab.cl/widget/widget.js"
  async>
</script>`

  const iframeSnippet = `<iframe
  src="https://aigencialab.cl/widget/YOUR_CLIENT_ID"
  width="400" height="600"
  frameborder="0"
  allow="microphone">
</iframe>`

  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] text-sm px-4 py-2 rounded-full mb-6">
            🚀 Widget IA Embebible
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Instala tu agente IA{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">
              en 2 minutos
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Un snippet de 3 líneas es todo lo que necesitas para agregar un asistente IA
            conversacional a cualquier sitio web. Sin conocimientos técnicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/precios"
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Obtener mi API Key →
            </Link>
            <Link
              href="/audit"
              className="border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10 px-8 py-4 rounded-xl font-semibold transition"
            >
              Ver demostración en vivo
            </Link>
          </div>
        </section>

        {/* SNIPPET */}
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="bg-[#16161E] border border-white/8 rounded-2xl overflow-hidden">
            <div className="flex border-b border-white/8">
              <div className="px-6 py-4 text-sm font-semibold text-[#C084FC] border-b-2 border-[#7C3AED] -mb-px">
                📄 Snippet JS (recomendado)
              </div>
              <div className="px-6 py-4 text-sm font-semibold text-[#6B6480]">
                🖼️ iFrame embed
              </div>
            </div>
            <div className="p-6">
              <pre className="bg-[#080A12] rounded-xl p-6 text-sm text-[#C084FC] font-mono overflow-x-auto border border-white/5 leading-relaxed">
                <code>{sampleSnippet}</code>
              </pre>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-[#C084FC] mb-1">¿No tienes tu API Key aún?</p>
                  <p className="text-sm text-[#A09CB0]">
                    Regístrate gratis y obtén tu clave en menos de 3 minutos.{' '}
                    <Link href="/precios" className="text-[#7C3AED] hover:text-[#C084FC] font-semibold">
                      Ver planes →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Todo lo que incluye el widget</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-[#16161E] border border-white/8 rounded-2xl p-6 hover:border-[#7C3AED]/40 transition-all">
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="font-bold text-[#F1F0F5] mb-2">{f.title}</h3>
                <p className="text-[#A09CB0] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PLATFORMS */}
        <section className="bg-[#111118] border-y border-white/5 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Compatible con tu plataforma</h2>
            <p className="text-[#A09CB0] text-center mb-12 max-w-xl mx-auto">
              Instrucciones paso a paso para las plataformas más populares.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PLATFORMS.map(p => (
                <div key={p.name} className="bg-[#16161E] border border-white/8 rounded-2xl p-6 hover:border-[#7C3AED]/40 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{p.emoji}</span>
                    <h3 className="font-bold text-[#F1F0F5]">{p.name}</h3>
                  </div>
                  <ol className="space-y-2">
                    {p.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#A09CB0]">
                        <span className="w-5 h-5 rounded-full bg-[#7C3AED]/20 text-[#C084FC] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IFRAME */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="bg-[#16161E] border border-white/8 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2">Alternativa: iFrame embed</h2>
            <p className="text-[#A09CB0] mb-6 text-sm">
              Ideal para plataformas que no permiten ejecutar JavaScript externo.
            </p>
            <pre className="bg-[#080A12] rounded-xl p-6 text-sm text-[#C084FC] font-mono overflow-x-auto border border-white/5 leading-relaxed mb-4">
              <code>{iframeSnippet}</code>
            </pre>
            <p className="text-xs text-[#6B6480]">
              Reemplaza <code className="text-[#C084FC]">YOUR_CLIENT_ID</code> con el ID de tu cuenta disponible en{' '}
              <Link href="/dashboard/installation" className="text-[#7C3AED] hover:underline">
                Dashboard → Instalación
              </Link>
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#111118] border-t border-white/5 py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para instalar tu agente IA?</h2>
          <p className="text-[#A09CB0] mb-8 max-w-xl mx-auto">
            Crea tu cuenta gratis, configura tu bot y copia el snippet. En menos de 10 minutos
            tu sitio web tendrá un asistente IA conversacional funcionando 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/precios" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition">
              Ver planes y comenzar →
            </Link>
            <Link href="/precios" className="border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10 px-8 py-4 rounded-xl font-semibold transition">
              Ver planes y precios
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
