import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default async function handler() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0a0a0f 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
            top: '-80px',
            left: '-80px',
            filter: 'blur(60px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)',
            bottom: '-80px',
            right: '-50px',
            filter: 'blur(50px)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            padding: '8px 20px',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '100px',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '14px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            marginBottom: '40px',
            background: 'rgba(124,58,237,0.08)',
          }}
        >
          Multi-Agent AI Pipeline
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 60px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: '#f0f0f5',
              lineHeight: '1.05',
              letterSpacing: '-2px',
              marginBottom: '24px',
            }}
          >
            AI Fact-Verification
          </div>
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #34d399)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.05',
              letterSpacing: '-2px',
              marginBottom: '30px',
            }}
          >
            Built on Trust
          </div>
          <div
            style={{
              fontSize: '22px',
              color: 'rgba(255,255,255,0.5)',
              maxWidth: '700px',
              lineHeight: '1.5',
              textAlign: 'center',
            }}
          >
            Four independent AI agents research, cross-verify, detect hallucinations, and compile citation-backed reports.
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '30px',
            color: 'rgba(255,255,255,0.25)',
            fontSize: '14px',
            letterSpacing: '1px',
          }}
        >
          quorum-liart.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    },
  )
}
