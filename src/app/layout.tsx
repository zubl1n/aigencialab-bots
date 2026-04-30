import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: { default: 'AigenciaLab.cl — Automatización IA para Empresas', template: '%s | AigenciaLab.cl' },
  description: 'Agentes de IA autónomos para ecommerce, clínicas, logística y más. Automatiza ventas, soporte y backoffice. Cumplimiento Ley N°21.663 Chile.',
  keywords: ['agentes IA Chile', 'automatización WhatsApp', 'ecommerce IA', 'chatbot empresa Chile', 'AigenciaLab'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'),
  openGraph: {
    type: 'website', locale: 'es_CL', siteName: 'AigenciaLab.cl',
    title: 'AigenciaLab.cl — IA que convierte visitas en clientes',
    description: 'Audita tu negocio gratis y descubre cuánto estás perdiendo sin IA.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AIgenciaLab — IA que convierte visitas en clientes' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AigenciaLab.cl — IA que convierte visitas en clientes',
    description: 'Agentes de IA autónomos para ecommerce, clínicas, logística y más.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased bg-background text-foreground tracking-tight">
        {children}
      </body>
    </html>
  )
}

