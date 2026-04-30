import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AIgenciaLab — IA que convierte visitas en clientes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0A0A0F 0%, #111118 40%, #16161E 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Purple glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.3), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent 70%)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              background: '#7C3AED',
              color: '#fff',
              padding: '8px 14px',
              borderRadius: '12px',
              fontSize: '28px',
              fontWeight: 'bold',
            }}
          >
            AI
          </div>
          <span style={{ color: '#F1F0F5', fontSize: '36px', fontWeight: 'bold' }}>
            genciaLab
          </span>
          <span style={{ color: '#6B6480', fontSize: '20px', marginLeft: '8px' }}>
            .cl
          </span>
        </div>

        {/* Main text */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: '#F1F0F5',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.2,
            marginBottom: '20px',
          }}
        >
          IA que convierte visitas
          <br />
          <span style={{ color: '#C084FC' }}>en clientes</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '22px',
            color: '#A09CB0',
            textAlign: 'center',
            maxWidth: '700px',
          }}
        >
          Agentes IA autónomos para empresas chilenas · Soporte 24/7 · Ley N°21.663
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '4px',
            background: 'linear-gradient(90deg, #7C3AED, #C084FC, #7C3AED)',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
