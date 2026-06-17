import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { TimelineItem } from '../types'
import { getTimeline } from '../services/api'
import GanttTimeline from '../components/timeline/GanttTimeline'

export default function TimelinePage() {
  const [periods, setPeriods] = useState<string[]>([])
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTimeline()
      .then(data => {
        setPeriods(data.periods)
        setItems(data.items)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load timeline')
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <header
        style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2340 100%)',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                color: '#90cdf4',
                textDecoration: 'none',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              ← Dashboard
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }} />
            <div>
              <div style={{ fontSize: '0.72rem', color: '#90cdf4', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                SNOMED International
              </div>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Timeline View</h1>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#718096' }}>Loading timeline...</div>
        )}

        {error && (
          <div style={{ padding: '16px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px', color: '#c53030', marginBottom: '16px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                {[
                  { style: 'Active', color: '#28a745', label: 'Active' },
                  { style: 'Planned', color: '#ffc107', label: 'Planned (dashed)' },
                  { style: 'Assessment', color: '#adb5bd', label: 'Assessment' },
                  { style: 'Ongoing', color: '#4A90D9', label: 'Ongoing' },
                ].map(item => (
                  <div key={item.style} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '12px', background: item.color, borderRadius: '3px' }} />
                    <span style={{ color: '#4a5568' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {periods.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#a0aec0', background: '#fff', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                No timeline data available.
              </div>
            ) : (
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <GanttTimeline periods={periods} items={items} />
              </div>
            )}
          </>
        )}
      </main>

      <footer
        style={{
          marginTop: '48px',
          padding: '16px 24px',
          background: '#1a3a5c',
          color: '#90cdf4',
          fontSize: '0.8rem',
          textAlign: 'center',
        }}
      >
        SNOMED International &copy; {new Date().getFullYear()} &middot; Content Development Roadmap
      </footer>
    </div>
  )
}
