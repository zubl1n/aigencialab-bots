import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="py-20 px-6 text-center max-w-4xl mx-auto min-h-[60vh]">
        <h1 className="text-4xl md:text-5xl font-bold capitalize mb-6">casos exito</h1>
        <p className="text-lg text-gray-600 mb-8">Información sobre casos exito próximamente.</p>
        <Link href="/" className="text-purple-600 font-semibold hover:underline">Volver al inicio</Link>
      </div>
    </MainLayout>
  )
}