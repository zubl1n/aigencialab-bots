import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA para E-commerce — AIgenciaLab', description: 'Automatiza ventas, soporte y seguimiento de pedidos en tu tienda online.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Solución · E-commerce"
        emoji="🛒"
        title="IA para **E-commerce**: Vende más mientras duermes"
        subtitle="Tu tienda nunca cierra. Un agente IA responde consultas de producto, resuelve problemas de pedidos y recupera carritos abandonados — las 24 horas."
        metrics={[
          { value: '35%',  label: 'Más carritos recuperados' },
          { value: '70%',  label: 'Consultas resueltas sin humano' },
          { value: '4.8★', label: 'CSAT promedio en e-commerce' },
        ]}
        benefits={[
          'Responde dudas de stock, talla, compatibilidad y precio en segundos',
          'Consulta estado de pedido conectado a tu plataforma (Shopify, WooCommerce)',
          'Recupera carritos abandonados con mensajes de WhatsApp personalizados',
          'Política de devoluciones y cambios explicada automáticamente',
          'Recomendación de productos según historial y preferencias del cliente',
          'Integración con pasarelas de pago: Transbank, MercadoPago, Flow',
          'Notificaciones de despacho en tiempo real vía WhatsApp',
          'Captura de reviews y NPS post-compra automatizado',
        ]}
        steps={[
          { number: '01', title: 'Conectas tu tienda', body: 'Integras con Shopify, WooCommerce o tu plataforma custom via API. Stock, precios y pedidos en tiempo real.' },
          { number: '02', title: 'El agente conoce tu catálogo', body: 'Aprende productos, políticas, FAQs y flujos de compra. Contextualiza cada respuesta al histórico del cliente.' },
          { number: '03', title: 'Ventas y soporte automatizados', body: 'Desde la pregunta inicial hasta el postventa. El agente gestiona todo sin intervención de tu equipo.' },
        ]}
        useCases={[
          { icon: '👗', title: 'Moda y Accesorios', body: 'Guía de tallas automática, stock por color/talla, políticas de cambio y seguimiento de despacho.' },
          { icon: '💻', title: 'Tecnología y Gaming', body: 'Especificaciones técnicas de productos, compatibilidad entre componentes, y preguntas de garantía.' },
          { icon: '🏠', title: 'Hogar y Decoración', body: 'Medidas, materiales, tiempos de entrega y consultas de instalación resueltas automáticamente.' },
        ]}
        faqs={[
          { q: '¿Se integra con Shopify?', a: 'Sí. Integración nativa con Shopify y WooCommerce. El agente accede a stock, precios y estado de pedidos en tiempo real.' },
          { q: '¿Puede el agente procesar devoluciones?', a: 'Puede guiar el proceso de devolución step by step y crear el ticket de gestión, pero la aprobación final la hace tu equipo.' },
          { q: '¿Cómo funciona la recuperación de carritos?', a: 'Detecta sesiones que agregaron al carrito sin comprar y envía un mensaje por WhatsApp o email 1-24 horas después con incentivo.' },
          { q: '¿Funciona para tiendas con catálogo grande (miles de productos)?', a: 'Sí. El agente usa búsqueda semántica para encontrar el producto correcto en catálogos de hasta 100.000 SKUs.' },
          { q: '¿En cuánto tiempo se ve el impacto?', a: 'Los clientes reportan resultados en las primeras 48-72 horas de activación. El volumen de consultas manuales cae de inmediato.' },
        ]}
      />
    </MainLayout>
  )
}