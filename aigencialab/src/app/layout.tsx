import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'AigenciaLab.cl — Automatización IA para Empresas', template: '%s | AigenciaLab.cl' },
  description: 'Agentes de IA autónomos para ecommerce, clínicas, logística y más. Automatiza ventas, soporte y backoffice. Cumplimiento Ley N°21.663 Chile.',
  keywords: ['agentes IA Chile', 'automatización WhatsApp', 'ecommerce IA', 'chatbot empresa Chile', 'AigenciaLab'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'),
  openGraph: {
    type: 'website', locale: 'es_CL', siteName: 'AigenciaLab.cl',
    title: 'AigenciaLab.cl — Automatización IA para Empresas',
    description: 'Audita tu negocio gratis y descubre cuánto estás perdiendo sin IA.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <body className="min-h-screen bg-[#080a12] text-slate-100 antialiased">{children}</body>
    </html>
  )
}
