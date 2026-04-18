import React from 'react';
import type { Metadata } from 'next';
import { WidgetTester } from './WidgetTester';

export const metadata: Metadata = {
  title: 'Valle Alto Propiedades | Inicio',
  description: 'Encuentra tu próximo hogar con Valle Alto Propiedades.',
};

export default function DemoEmpresaPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] font-sans">
      <WidgetTester />
      {/* ── ALERTS (The "Pains") ── */}
      <div className="bg-[#DC2626] text-white text-xs font-bold text-center py-2 px-4 shadow-sm">
        ⚠️ Atención: Debido a la alta demanda, nuestros ejecutivos están tardando entre 48 y 72 horas hábiles en responder solicitudes. Agradecemos su paciencia.
      </div>
      <div className="bg-[#D97706] text-white text-xs font-bold text-center py-1 px-4">
        ⏰ Horario de atención: Lunes a Viernes de 09:00 a 18:00 hrs. Fines de semana cerrado.
      </div>

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded flex items-center justify-center text-white font-serif font-bold text-xl">
              VA
            </div>
            <div>
              <h1 className="font-bold text-[#1E3A8A] text-xl tracking-tight leading-none bg-transparent" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>Valle Alto</h1>
              <p className="text-[10px] text-[#6B7280] uppercase tracking-widest mt-1">Gestión Inmobiliaria</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-[#4B5563]">
            <a href="#" className="hover:text-[#1E3A8A]">Inicio</a>
            <a href="#" className="hover:text-[#1E3A8A]">Comprar</a>
            <a href="#" className="hover:text-[#1E3A8A]">Arrendar</a>
            <a href="#faq" className="hover:text-[#1E3A8A]">Preguntas Frecuentes</a>
            <a href="#contacto" className="text-[#1E3A8A] font-bold">Contacto</a>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative bg-[#1E3A8A] text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ WebkitTextFillColor: 'white', background: 'none' }}>El hogar de tus sueños te está esperando</h2>
          <p className="text-lg md:text-xl text-[#DBEAFE] mb-8 max-w-2xl mx-auto font-normal">
            Más de 15 años de experiencia en el mercado inmobiliario. Navega nuestro catálogo y agenda tu visita (sujeto a disponibilidad de ejecutivos).
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-[#1E3A8A] px-6 py-3 rounded-md font-bold hover:bg-gray-100 transition-colors border-none shadow-none">
              Ver Propiedades
            </button>
            <a href="#contacto" className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-bold hover:bg-white/10 transition-colors">
              Agendar Visita
            </a>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-16">
          {/* FAQ Section */}
          <section id="faq" className="bg-white p-8 rounded-xl border border-[#E5E7EB] shadow-sm">
            <h3 className="text-2xl font-bold text-[#111827] mb-6 pb-4 border-b border-[#F3F4F6]" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>Preguntas frecuentes y requerimientos</h3>
            
            <div className="space-y-6 text-[#4B5563] text-sm leading-relaxed">
              <div>
                <h4 className="font-bold text-[#111827] mb-2">1. ¿Cuáles son los requisitos para arrendar?</h4>
                <p>Para arrendar necesita enviar por correo electrónico: 6 últimas liquidaciones de sueldo, certificado de cotizaciones de AFP (últimos 12 meses), contrato de trabajo indefinido, certificado de Dicom Platinum 360 al día, fotocopia de cédula de identidad por ambos lados y un codeudor solidario con los mismos antecedentes. Además, el ingreso líquido debe ser 3 veces el valor del arriendo.</p>
              </div>
              
              <div>
                <h4 className="font-bold text-[#111827] mb-2">2. ¿Cuáles son sus horarios de atención?</h4>
                <p>Atendemos exclusivamente de Lunes a Viernes de 09:00 a 13:30 y de 15:00 a 18:00 hrs. Los fines de semana y festivos nuestras oficinas están cerradas y no revisamos correos ni formularios. Si nos contacta el viernes a las 18:01, su mensaje será revisado el lunes durante la mañana.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] mb-2">3. ¿Cómo puedo agendar una visita a una propiedad?</h4>
                <p>Debe completar el Formulario Único de Contacto indicando el ID de la propiedad que desea visitar. Luego de 48-72 horas un ejecutivo se pondrá en contacto para solicitar los antecedentes financieros obligatorios ANTES de confirmar la visita. Si los antecedentes no son aprobados, la visita será cancelada. No damos información por teléfono.</p>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] mb-2">4. ¿Qué hago si tengo un problema de mantención en la propiedad que arriendo?</h4>
                <p>Debe enviar un correo a <code>soporte-mantencion@vallealto-demo.cl</code> indicando RUT, dirección exacta, fotografías del problema y cotización de reparación. Nuestro comité revisará el caso y le dará respuesta en aproximadamente 7 a 15 días hábiles. Recuerde que las reparaciones menores son de cargo del arrendatario según la cláusula 5 del contrato estándar.</p>
              </div>
            </div>
            <div className="mt-8 bg-[#EFF6FF] p-4 rounded-lg border border-[#DBEAFE]">
              <p className="text-[#1E40AF] text-sm font-semibold">¿No encuentra lo que busca?</p>
              <p className="text-[#2563EB] text-xs mt-1">Por favor lea cuidadosamente todas las preguntas frecuentes antes de enviar el formulario. Los formularios con consultas ya respondidas aquí serán descartados automáticamente.</p>
            </div>
          </section>

          {/* Fake Grid */}
          <section>
            <h3 className="text-2xl font-bold text-[#111827] mb-6" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>Propiedades Destacadas</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white border text-left border-[#E5E7EB] rounded-lg overflow-hidden group">
                  <div className="h-48 bg-[#E5E7EB] w-full relative">
                    <img src={`https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`} alt="House" className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute top-2 right-2 bg-[#1E3A8A] text-white text-xs font-bold px-2 py-1 rounded">Venta</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#6B7280] mb-1">ID: VA-89{i}2</div>
                    <h4 className="font-bold text-[#111827] mb-1">Casa estilo provenzal en Condominio</h4>
                    <p className="text-[#6B7280] text-xs mb-3">4 Hab • 3 Baños • 140m² útiles</p>
                    <div className="text-lg font-extrabold text-[#1E3A8A] mb-4">UF 8.500</div>
                    <button className="w-full border border-[#D1D5DB] rounded text-sm py-2 text-[#4B5563] bg-white hover:bg-[#F9FAFB] font-medium transition-colors shadow-none">
                      Consultar Disponibilidad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar / Form */}
        <div className="md:col-span-1">
          <div id="contacto" className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-xl sticky top-6">
            <h3 className="text-xl font-bold text-[#111827] mb-2" style={{ WebkitTextFillColor: 'initial', background: 'none' }}>Formulario Único de Contacto</h3>
            <p className="text-xs text-[#6B7280] mb-6">Todos los campos son obligatorios. Las solicitudes incompletas no serán procesadas.</p>
            
            <form className="space-y-4" action="#">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Nombre Completo *</label>
                <input type="text" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="Ej: Juan Pérez" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">RUT *</label>
                <input type="text" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="12.345.678-9" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Correo Electrónico *</label>
                <input type="email" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="correo@ejemplo.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Teléfono Principal *</label>
                <input type="tel" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="+56 9 XXXXXXXX" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Motivo de la Consulta *</label>
                <select className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black">
                  <option>Seleccione una opción</option>
                  <option>Deseo comprar</option>
                  <option>Deseo arrendar</option>
                  <option>Quiero vender mi propiedad</option>
                  <option>Reclamo / Mantención</option>
                  <option>Trabaja con nosotros</option>
                  <option>Otro inconveniente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">ID Propiedad (Si aplica)</label>
                <input type="text" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="Ej: VA-8912" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Renta Líquida Mensual (CLP) *</label>
                <input type="text" className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none bg-white text-black" placeholder="Requisito para arriendo" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1">Mensaje *</label>
                <textarea className="w-full border border-[#D1D5DB] rounded px-3 py-2 text-sm focus:border-[#3B82F6] outline-none h-24 resize-none bg-white text-black" placeholder="Escriba su consulta en detalle. Máx 500 caracteres."></textarea>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" id="terms" className="mt-1" />
                <label htmlFor="terms" className="text-[10px] text-[#6B7280] leading-tight font-normal cursor-pointer">
                  He leído todas las preguntas frecuentes y acepto que el tiempo de respuesta es entre 3 a 5 días hábiles.
                </label>
              </div>

              <button type="submit" className="w-full bg-[#1E3A8A] text-white font-bold py-3 rounded-lg hover:bg-[#1E40AF] transition-colors mt-4 text-sm flex items-center justify-center gap-2 border-none shadow-none">
                Enviar Solicitud
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-[#111827] text-[#9CA3AF] py-12 border-t border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h4 className="text-white font-bold text-lg mb-4" style={{ WebkitTextFillColor: 'white', background: 'none' }}>Valle Alto Propiedades</h4>
            <p className="text-sm text-[#6B7280] mb-4 max-w-sm">
              Inmobiliaria tradicional con 15 años de trayectoria. No usamos sistemas automatizados para mantener el trato "personalizado". Atendemos solo en horario hábil.
            </p>
            <p className="text-xs text-[#4B5563]">
              Diseñado en 2011. Todos los derechos reservados.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4" style={{ WebkitTextFillColor: 'white', background: 'none' }}>Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Ventas</a></li>
              <li><a href="#" className="hover:text-white">Arriendos</a></li>
              <li><a href="#" className="hover:text-white">Administración</a></li>
              <li><a href="#" className="hover:text-white">Tasaciones</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4" style={{ WebkitTextFillColor: 'white', background: 'none' }}>Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Términos Comerciales</a></li>
              <li><a href="#" className="hover:text-white">Políticas de Privacidad</a></li>
              <li><a href="#" className="hover:text-white">Contratos Tipo</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
