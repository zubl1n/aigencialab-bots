import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, X, Shield, Zap, Globe, MessageSquare, BarChart3, Lock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Planes y Precios — AigenciaLab.cl',
  description: 'Compara nuestros planes de automatización IA. Desde el Plan Starter para PyMEs hasta soluciones Enterprise con CISO dedicado y cumplimiento de Ley N°21.663.',
}

const tiers = [
  {
    name: 'Starter',
    price: '149.990',
    description: 'Para pequeñas empresas que inician su viaje en la IA.',
    features: [
      '1 Agente Autónomo (Web/WhatsApp)',
      '1.000 Mensajes mensuales',
      'Knowledge Base (PDF/Doc)',
      'Dashboard Básico',
      'Soporte vía Ticket',
    ],
    notIncluded: [
      'Integración ERP (Defontana/SII)',
      'Personalización de Prompt Avanzada',
      'Multi-tenant Dashboard',
      'CISO Dedicado',
    ],
    cta: 'Empezar ahora',
    href: '/register?plan=Starter',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '299.990',
    description: 'Ideal para empresas en crecimiento con necesidades omnicanal.',
    features: [
      '3 Agentes Autónomos',
      '5.000 Mensajes mensuales',
      'Integración Webhooks (Zapier/Make)',
      'CRM de Leads Integrado',
      'Dashboard Pro con Métricas BI',
      'Soporte Prioritario WhatsApp',
    ],
    notIncluded: [
      'Cumplimiento Ley N°21.663 Plus',
      'Entorno Sandbox dedicado',
      'Integración SII / Defontana Premium',
      'CISO Dedicado',
    ],
    cta: 'Más Popular',
    href: '/register?plan=Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'A medida',
    description: 'Soluciones integradas para grandes corporaciones.',
    features: [
      'Agentes Ilimitados',
      'Mensajes según demanda',
      'Despliegue On-premise / VPC Chile',
      'Integración Full ERP & SII',
      'CISO & Auditoría de Seguridad',
      'Contrato SLA 99.9% Garantizado',
    ],
    notIncluded: [],
    cta: 'Contactar Ventas',
    href: 'https://wa.me/56912345678',
    highlight: false,
  },
]

const comparison = [
  { feature: 'Canales (Web/WhatsApp/IG)', starter: '1', pro: '3', enterprise: 'Ilimitados' },
  { feature: 'Mensajes Mensuales', starter: '1.000', pro: '5.000', enterprise: 'Personalizado' },
  { feature: 'Knowledge Base (RAG)', starter: 'Básico', pro: 'Avanzado', enterprise: 'Full Vector DB' },
  { feature: 'Integración Ecommerce', starter: '❌', pro: '✅', enterprise: '✅' },
  { feature: 'Integración SII / ERP', starter: '❌', pro: 'Básico', enterprise: 'Custom' },
  { feature: 'Ley N°21.663 Compliance', starter: 'Básico', pro: 'Estándar', enterprise: 'Certificado' },
  { feature: 'Soporte', starter: 'Email', pro: 'Chat 24/7', enterprise: 'Dedicado' },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Planes diseñados para <span className="text-primary">escalar</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu volumen operativo. Todos incluyen cumplimiento de Leyes Chilenas.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`flex flex-col p-8 rounded-3xl border transition-all ${
                tier.highlight 
                  ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-105' 
                  : 'border-border bg-card'
              }`}
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-foreground">
                    {tier.price === 'A medida' ? tier.price : `$${tier.price}`}
                  </span>
                  {tier.price !== 'A medida' && <span className="text-muted-foreground">/mes</span>}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tier.description}
                </p>
              </div>

              <div className="flex-1 space-y-4 mb-8">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Qué incluye:</div>
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 mt-1 shrink-0" />
                    <span className="text-foreground/90">{feature}</span>
                  </div>
                ))}
                {tier.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm opacity-40">
                    <X className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Link 
                href={tier.href}
                className={`text-center py-3 px-6 rounded-xl font-bold transition-all ${
                  tier.highlight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Comparativa de Características</h2>
          <div className="overflow-hidden border border-border rounded-2xl bg-card">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-4 font-semibold text-sm">Característica</th>
                  <th className="p-4 font-semibold text-sm">Starter</th>
                  <th className="p-4 font-semibold text-sm">Pro</th>
                  <th className="p-4 font-semibold text-sm">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comparison.map((item) => (
                  <tr key={item.feature} className="text-sm hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-foreground/80 font-medium">{item.feature}</td>
                    <td className="p-4 text-muted-foreground">{item.starter}</td>
                    <td className="p-4 text-muted-foreground">{item.pro}</td>
                    <td className="p-4 text-muted-foreground">{item.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security / Compliance Badge */}
        <div className="bg-gradient-to-r from-secondary to-background border border-border rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Seguridad de Grado Bancario</h3>
            <p className="text-muted-foreground mb-4">
              Cumplimos estrictamente con la <strong>Ley N°21.663</strong> y <strong>Ley N°19.628</strong>. 
              Tus datos están cifrados con AES-256 y residen en servidores locales o VPC aisladas.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">2FA Auth</span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">Audit Logs</span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">GDPR/APDP Ready</span>
              <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full border border-border">CISO Monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
