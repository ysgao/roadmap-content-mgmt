import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { RoadmapItem, ProvenanceEvent, MemberPriority, Horizon, HorizonsResponse } from '../types'
import { getRoadmapItems, getProvenanceEvents, getMemberPriorities, isJiraTicketActive } from '../services/api'
import { useFilterStore } from '../store/filterStore'
import FilterBar from '../components/dashboard/FilterBar'
import HorizonGroup from '../components/dashboard/HorizonGroup'
import MemberPrioritiesList from '../components/priorities/MemberPrioritiesList'
import Glossary from '../components/shared/Glossary'

const HORIZON_ORDER: Horizon[] = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance']

export default function DashboardPage() {
  const { origin, siStatus, activityType, hasActiveJira } = useFilterStore()

  const [allData, setAllData] = useState<HorizonsResponse | null>(null)
  const [provenanceEvents, setProvenanceEvents] = useState<ProvenanceEvent[]>([])
  const [priorities, setPriorities] = useState<MemberPriority[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jiraStatuses] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      getRoadmapItems(),
      getProvenanceEvents(),
      getMemberPriorities(),
    ])
      .then(([roadmap, events, prios]) => {
        setAllData(roadmap)
        setProvenanceEvents(events)
        setPriorities(prios)
        setLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to load data')
        setLoading(false)
      })
  }, [])

  const roadmapData = useMemo<HorizonsResponse | null>(() => {
    if (!allData) return null
    const allItems: RoadmapItem[] = HORIZON_ORDER.flatMap(h => allData.horizons[h] ?? [])
    let filtered = allItems.filter(item => {
      if (origin && !item.provenanceChips.some(c => c.shortCode === origin)) return false
      if (siStatus && item.siStatus !== siStatus) return false
      if (activityType && item.activityType !== activityType) return false
      return true
    })

    if (hasActiveJira) {
      filtered = filtered.filter(item =>
        item.jiraTickets.some(key => isJiraTicketActive(jiraStatuses[key] ?? ''))
      )
    }

    const horizons = HORIZON_ORDER.reduce((acc, h) => {
      acc[h] = filtered.filter(i => i.horizon === h)
      return acc
    }, {} as Record<Horizon, RoadmapItem[]>)
    const counts = HORIZON_ORDER.reduce((acc, h) => {
      acc[h] = horizons[h].length
      return acc
    }, {} as Record<Horizon, number>)
    return { horizons, counts, total: filtered.length }
  }, [allData, origin, siStatus, activityType, hasActiveJira, jiraStatuses])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <header
        style={{
          background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2340 100%)',
          color: '#fff',
          padding: '0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#90cdf4', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                SNOMED International
              </div>
              <h1 style={{ margin: '0 0 6px', fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>
                Content Development Roadmap
              </h1>
              <p style={{ margin: 0, fontSize: '0.87rem', color: '#bee3f8', lineHeight: 1.5 }}>
                Tracking SNOMED CT content development activities across all planning horizons
              </p>
            </div>
            <Link
              to="/timeline"
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: 'rgba(255,255,255,0.1)',
                alignSelf: 'center',
              }}
            >
              Timeline View
            </Link>
          </div>

          {roadmapData && (
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              {HORIZON_ORDER.map(h => (
                <div key={h} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                    {roadmapData.counts[h] ?? 0}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#90cdf4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h === 'UnderAssessment' ? 'Under Assessment' : h === 'InMaintenance' ? 'In Maintenance' : h}
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{roadmapData.total}</div>
                <div style={{ fontSize: '0.72rem', color: '#90cdf4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        <FilterBar provenanceEvents={provenanceEvents} />

        {loading && (
          <div style={{ padding: '48px', textAlign: 'center', color: '#718096', fontSize: '0.95rem' }}>
            Loading roadmap data...
          </div>
        )}

        {error && (
          <div style={{ padding: '16px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '8px', color: '#c53030', fontSize: '0.9rem', marginBottom: '16px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && roadmapData && (
          <>
            {HORIZON_ORDER.map(horizon => (
              <HorizonGroup
                key={horizon}
                horizon={horizon}
                items={roadmapData.horizons[horizon] ?? []}
                count={roadmapData.counts[horizon] ?? 0}
              />
            ))}
            <MemberPrioritiesList priorities={priorities} />
            <Glossary />
          </>
        )}
      </main>

      <footer
        style={{
          marginTop: '48px',
          padding: '20px 24px',
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
