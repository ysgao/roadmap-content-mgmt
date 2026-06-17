import { useState } from 'react'
import type { Horizon, RoadmapItem } from '../../types'
import RoadmapCard from './RoadmapCard'

const HORIZON_COLORS: Record<Horizon, string> = {
  Now: '#1a472a',
  Next: '#1a3a5c',
  Later: '#3a1a5c',
  UnderAssessment: '#5c3a1a',
  InMaintenance: '#1a5c4a',
}

const HORIZON_LABELS: Record<Horizon, string> = {
  Now: 'Now',
  Next: 'Next',
  Later: 'Later',
  UnderAssessment: 'Under Assessment',
  InMaintenance: 'In Maintenance',
}

const HORIZON_DESCRIPTIONS: Record<Horizon, string> = {
  Now: 'Actively in progress',
  Next: 'Planned for the next period',
  Later: 'Identified but not yet scheduled',
  UnderAssessment: 'Being evaluated for feasibility and scope',
  InMaintenance: 'Completed and in ongoing maintenance',
}

interface Props {
  horizon: Horizon
  items: RoadmapItem[]
  count: number
  isAuthenticated: boolean
}

export default function HorizonGroup({ horizon, items, count, isAuthenticated }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const color = HORIZON_COLORS[horizon]
  const label = HORIZON_LABELS[horizon]
  const description = HORIZON_DESCRIPTIONS[horizon]

  return (
    <section style={{ marginBottom: '24px' }}>
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: color,
          border: 'none',
          borderRadius: collapsed ? '6px' : '6px 6px 0 0',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#fff',
        }}
      >
        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.02em' }}>{label}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',
            height: '24px',
            padding: '0 6px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.25)',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          {count}
        </span>
        <span style={{ flex: 1, fontSize: '0.82rem', opacity: 0.85, fontStyle: 'italic' }}>{description}</span>
        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div
          style={{
            border: `1px solid ${color}44`,
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            padding: '12px',
            background: '#fafcff',
          }}
        >
          {items.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic', padding: '8px 0' }}>
              No items in this horizon match the current filters.
            </p>
          ) : (
            items.map(item => <RoadmapCard key={item.id} item={item} isAuthenticated={isAuthenticated} />)
          )}
        </div>
      )}
    </section>
  )
}
