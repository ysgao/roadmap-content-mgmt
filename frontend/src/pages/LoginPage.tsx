import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../services/auth'

export default function LoginPage() {
  const { user, isAdmin, loading, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [user, isAdmin, loading, navigate])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f7fa',
        }}
      >
        <div style={{ color: '#718096' }}>Checking authentication...</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #0f2340 0%, #1a3a5c 50%, #1a4a7a 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '40px 48px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 25px 80px rgba(0,0,0,0.35)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1a3a5c, #4A90D9)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
          }}
        >
          🗺
        </div>

        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#4A90D9',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          SNOMED International
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#1a202c' }}>
          Content Roadmap Admin
        </h1>

        <p style={{ margin: '0 0 32px', fontSize: '0.9rem', color: '#718096', lineHeight: 1.6 }}>
          Sign in to manage roadmap content, member priorities, and evidence inputs.
        </p>

        <button
          onClick={login}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #1a3a5c 0%, #4A90D9 100%)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 12px rgba(26,58,92,0.4)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.92')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          Sign in with SNOMED International SSO
        </button>

        <p style={{ margin: '24px 0 0', fontSize: '0.78rem', color: '#a0aec0' }}>
          Access restricted to authorised SNOMED International staff.
        </p>
      </div>

      <div style={{ marginTop: '32px', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', textAlign: 'center' }}>
        <a href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>
          ← Back to public roadmap
        </a>
      </div>

      <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem' }}>
        SNOMED International &copy; {new Date().getFullYear()}
      </div>
    </div>
  )
}
