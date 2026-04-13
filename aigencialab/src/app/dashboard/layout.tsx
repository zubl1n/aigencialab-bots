export const dynamic = 'force-dynamic'
import { ClientSidebar } from '@/components/dashboard/ClientSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { 
  title: 'Dashboard — AIgenciaLab',
  description: 'Gestiona tus asistentes IA y leads.'
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      <ClientSidebar />
      <main className="flex-1 lg:ml-72 p-4 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

