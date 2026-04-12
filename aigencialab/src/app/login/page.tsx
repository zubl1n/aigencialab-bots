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
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'linear-gradient(135deg,#080a12 0%,#0d1020 100%)'}}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">Aigencia<span className="text-gradient">Lab.cl</span></Link>
          <p className="text-slate-400 text-sm mt-2">Accede al panel operativo</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-6">Iniciar sesión</h1>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-5 text-sm">{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@aigencialab.cl"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {loading ? 'Ingresando...' : 'Ingresar al Dashboard →'}
            </button>
          </form>
          <p className="text-center text-xs text-slate-600 mt-6">
            ¿Sin cuenta? <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'}`} className="text-blue-400 hover:underline">Contactar ventas</a>
          </p>
        </div>
        <p className="text-center text-xs text-slate-700 mt-6">🔒 Ley N°19.628 · AigenciaLab.cl</p>
      </div>
    </div>
  )
}
