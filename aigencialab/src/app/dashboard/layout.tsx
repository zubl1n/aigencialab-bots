export const dynamic = 'force-dynamic'
import { ClientSidebar } from '@/components/dashboard/ClientSidebar'
import NotificationBell from '@/components/dashboard/NotificationBell'
import { PlanUsageBanner } from '@/components/shared/PlanUsageBanner'
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
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        {/* Top bar with notification bell */}
        <header className="sticky top-0 z-30 flex items-center justify-end px-6 py-3 bg-[var(--bg)]/80 backdrop-blur-md border-b border-white/[0.04] lg:flex hidden">
          <NotificationBell />
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto pt-14 lg:pt-0">
            <PlanUsageBanner />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
