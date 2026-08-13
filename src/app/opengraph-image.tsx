import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = "Pets Social — share your pet's best moments"
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFBF7',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 60, left: 80, width: 300, height: 300, borderRadius: '50%', background: '#FFC94A', opacity: 0.25, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 40, right: 100, width: 240, height: 240, borderRadius: '50%', background: '#1B8A87', opacity: 0.2, display: 'flex' }} />
        <div style={{ width: 140, height: 140, borderRadius: '50%', background: '#FFE4D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, marginBottom: 24 }}>
          🐾
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: '#1a1a1a', display: 'flex' }}>
          Pets Social
        </div>
        <div style={{ fontSize: 32, color: '#666', marginTop: 12, display: 'flex' }}>
          Share your pet's best moments
        </div>
      </div>
    ),
    { ...size }
  )
}
