import { useState } from 'react'
import type { MemberPriority } from '../../types'
import ProvenanceChip from '../shared/ProvenanceChip'

interface Props {
  priority: MemberPriority
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div style={{ padding: '6px 0', borderBottom: '1px solid #f0f4f8' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.87rem', color: '#2d3748', lineHeight: 1.55 }}>{value}</div>
    </div>
  )
}

export default function PriorityCard({ priority }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #4A90D9',
        borderRadius: '6px',
        marginBottom: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#4A90D9',
            color: '#fff',
            fontSize: '0.85rem',
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {priority.rank}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.93rem', fontWeight: 600, color: '#1a202c', marginBottom: '4px' }}>
            {priority.topicTitle}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.78rem',
                color: '#718096',
                background: '#f7fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '1px 7px',
              }}
            >
              {priority.responseCount} responses ({priority.responsePercentage}%)
            </span>
            {priority.provenanceEvents.map(ev => (
              <ProvenanceChip key={ev.shortCode} chip={{ shortCode: ev.shortCode, displayLabel: ev.displayLabel }} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div style={{ padding: '4px 16px 14px 62px', borderTop: '1px solid #f0f4f8' }}>
          <FieldRow label="Current SI Activity" value={priority.currentSIActivity} />
          <FieldRow label="Progress Summary" value={priority.progressSummary} />
          <FieldRow label="Next Milestones" value={priority.nextMilestones} />
          <FieldRow label="Risk Factors" value={priority.riskFactors} />
        </div>
      )}
    </div>
  )
}
