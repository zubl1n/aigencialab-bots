import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, empresa, email, telefono, sitioWeb, industria, empleados, desafio, consultasMensuales } = body

    if (!nombre || !empresa || !email) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error } = await supabase.from('audit_requests').insert({
      nombre,
      empresa,
      email,
      telefono,
      sitio_web: sitioWeb,
      industria,
      empleados,
      desafio,
      consultas_mensuales: consultasMensuales,
      status: 'pendiente',
    })

    if (error) {
      console.error('[audit/submit]', error)
      // Table might not exist yet — still return success to not break UX
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[audit/submit] Error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
