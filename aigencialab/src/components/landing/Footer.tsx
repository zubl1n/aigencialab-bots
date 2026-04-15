import Link from 'next/link'

const footerLinks = {
  Productos: [
    { label: 'Agente de Ventas',    href: '/productos/agente-ventas' },
    { label: 'Atención al Cliente', href: '/productos/atencion-cliente' },
    { label: 'Captura de Leads',    href: '/productos/captura-leads' },
    { label: 'IA Conversacional',   href: '/productos/ia-conversacional' },
    { label: 'Widget para Web',     href: '/productos/widget-web' },
    { label: 'Integraciones',       href: '/productos/integraciones' },
  ],
  Soluciones: [
    { label: 'E-commerce',          href: '/soluciones/ecommerce' },
    { label: 'Inmobiliarias',       href: '/soluciones/inmobiliarias' },
    { label: 'Educación',           href: '/soluciones/educacion' },
    { label: 'Salud y Clínicas',    href: '/soluciones/salud' },
    { label: 'Agencias Digitales',  href: '/soluciones/agencias' },
  ],
  Recursos: [
    { label: 'Blog IA',             href: '/blog' },
    { label: 'Casos de éxito',      href: '/casos-exito' },
    { label: '✨ Auditoría Gratis', href: '/audit' },
    { label: 'Precios',             href: '/precios' },
    { label: 'Nosotros',            href: '/nosotros' },
    { label: 'Contacto',            href: '/contacto' },
  ],
}

const SOCIALS = [
  { label: 'in', title: 'LinkedIn',   href: 'https://linkedin.com/company/aigencialab' },
  { label: '𝕏',  title: 'X / Twitter', href: 'https://twitter.com/aigencialab' },
  { label: 'ig', title: 'Instagram',  href: 'https://instagram.com/aigencialab' },
]

export function Footer() {
  return (
    <footer className="bg-[#06060A] border-t border-white/[0.06] text-[#6B6480]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span className="bg-[#7C3AED] text-white rounded-md px-2 py-1 text-sm font-bold leading-none">AI</span>
              <span className="text-[#F1F0F5] font-bold text-lg">genciaLab</span>
            </Link>
            <p className="text-[#6B6480] text-sm leading-relaxed max-w-xs mb-6">
              Automatiza ventas y atención al cliente con agentes IA conversacionales
              para empresas chilenas y latinoamericanas. Resultados desde el primer mes.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map(s => (
                <a
                  key={s.title}
                  href={s.href}
                  title={s.title}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/[0.08] flex items-center justify-center text-xs hover:bg-[#7C3AED]/20 hover:border-[#7C3AED]/40 hover:text-[#C084FC] transition-all duration-200"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-[#F1F0F5] font-semibold text-sm mb-4 tracking-wide">{section}</h3>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-[#6B6480] hover:text-[#C084FC] transition-colors duration-150"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#3D3952]">
            © {new Date().getFullYear()} AIgenciaLab SpA · Chile
            {' '}· Cumple Ley N°19.628 (datos personales) y Ley N°21.663 (IA)
          </p>
          <div className="flex gap-6 text-xs">
            <Link href="/legal/privacidad" className="text-[#3D3952] hover:text-[#6B6480] transition-colors">Privacidad</Link>
            <Link href="/legal/terminos"   className="text-[#3D3952] hover:text-[#6B6480] transition-colors">Términos</Link>
            <Link href="/legal/cookies"    className="text-[#3D3952] hover:text-[#6B6480] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
