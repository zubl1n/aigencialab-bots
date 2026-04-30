'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }

    // Route based on role
    const user = data?.user
    const isAdmin =
      user?.app_metadata?.role === 'admin' ||
      user?.user_metadata?.role === 'admin'
    
    router.push(isAdmin ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0A0A0F]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#F1F0F5]">
            Aigencia<span className="text-gradient">Lab.cl</span>
          </Link>
          <p className="text-[#A09CB0] text-sm mt-2">Accede al panel operativo</p>
        </div>

        <div className="bg-[#16161E] border border-white/8 rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold mb-6 text-[#F1F0F5]">Iniciar sesión</h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-5 text-sm">{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-[#A09CB0] mb-2">Email</label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.cl"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[#A09CB0] mb-2">Contraseña</label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar →'}
            </button>
          </form>
          <p className="text-center text-xs text-[#6B6480] mt-6">
            ¿Sin cuenta?{' '}
            <Link href="/register" className="text-[#C084FC] hover:underline">Registrarse gratis</Link>
            {' · '}
            <Link href="/audit" className="text-[#C084FC] hover:underline">Auditoría gratis</Link>
          </p>
        </div>
        <p className="text-center text-xs text-[#6B6480] mt-6">© AIgenciaLab · Ley N°19.628</p>
      </div>
    </div>
  )
}
