import { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { StickyBanner } from './StickyBanner'
import { LeadPopup } from './LeadPopup'

interface MainLayoutProps {
  children:    ReactNode
  showBanner?: boolean
  showPopup?:  boolean
}

export function MainLayout({ children, showBanner = true, showPopup = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-[#F1F0F5]">
      <Navbar />
      {showBanner && <StickyBanner />}
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      {showPopup && <LeadPopup />}
    </div>
  )
}

