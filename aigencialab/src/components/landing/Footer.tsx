import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2 mb-4 text-gray-900">
              <span className="bg-purple-600 text-white rounded-md p-1.5 leading-none">AI</span>
              genciaLab
            </Link>
            <p className="text-gray-500 mb-6 max-w-sm">
              Automatiza tus ventas y servicio al cliente con agentes impulsados por IA conversacional avanzada.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <span aria-hidden="true">in</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <span className="sr-only">Twitter</span>
                <span aria-hidden="true">𝕏</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition-colors">
                <span className="sr-only">Instagram</span>
                <span aria-hidden="true">ig</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Productos</h3>
            <ul className="space-y-3">
              <li><Link href="/productos/agente-ventas" className="hover:text-purple-600 transition-colors">Agente de Ventas</Link></li>
              <li><Link href="/productos/atencion-cliente" className="hover:text-purple-600 transition-colors">Atención al Cliente</Link></li>
              <li><Link href="/productos/captura-leads" className="hover:text-purple-600 transition-colors">Captura de Leads</Link></li>
              <li><Link href="/productos/ia-conversacional" className="hover:text-purple-600 transition-colors">IA Conversacional</Link></li>
              <li><Link href="/productos/widget-web" className="hover:text-purple-600 transition-colors">Widget para Web</Link></li>
              <li><Link href="/productos/integraciones" className="hover:text-purple-600 transition-colors">Integraciones</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Soluciones</h3>
            <ul className="space-y-3">
              <li><Link href="/soluciones/ecommerce" className="hover:text-purple-600 transition-colors">E-commerce</Link></li>
              <li><Link href="/soluciones/inmobiliarias" className="hover:text-purple-600 transition-colors">Inmobiliarias</Link></li>
              <li><Link href="/soluciones/educacion" className="hover:text-purple-600 transition-colors">Educación</Link></li>
              <li><Link href="/soluciones/salud" className="hover:text-purple-600 transition-colors">Salud y Clínicas</Link></li>
              <li><Link href="/soluciones/agencias" className="hover:text-purple-600 transition-colors">Agencias Digitales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li><Link href="/nosotros" className="hover:text-purple-600 transition-colors">Nosotros</Link></li>
              <li><Link href="/blog" className="hover:text-purple-600 transition-colors">Blog</Link></li>
              <li><Link href="/contacto" className="hover:text-purple-600 transition-colors">Contacto</Link></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Términos del Servicio</a></li>
              <li><a href="#" className="hover:text-purple-600 transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 py-6 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500">
          <div>© 2025 AIgenciaLab. Todos los derechos reservados.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-purple-600 transition-colors">Términos</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Privacidad</a>
            <span className="flex items-center gap-1 font-medium">Hecho en Chile <span aria-hidden="true">🇨🇱</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
