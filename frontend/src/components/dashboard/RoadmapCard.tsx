import { useState } from 'react'
import type { RoadmapItem } from '../../types'
import StatusBadge from '../shared/StatusBadge'
import ImpactBadge from '../shared/ImpactBadge'
import ActivityTag from '../shared/ActivityTag'
import ProvenanceChip from '../shared/ProvenanceChip'
import { ACTIVITY_COLORS } from '../shared/ActivityTag'
import JiraTickets from './JiraTickets'

interface Props {
  item: RoadmapItem
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid #f0f4f8' }}>
      <span style={{ minWidth: '160px', fontSize: '0.78rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', paddingTop: '1px' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.87rem', color: '#2d3748', lineHeight: 1.55, flex: 1 }}>{value}</span>
    </div>
  )
}

const BAR_STYLE_COLORS: Record<string, string> = {
  Active: '#28a745',
  Planned: '#007bff',
  Assessment: '#9ca3af',
  Ongoing: '#4A90D9',
}

export default function RoadmapCard({ item }: Props) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = ACTIVITY_COLORS[item.activityType]

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '6px',
        marginBottom: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.15s',
      }}
    >
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            marginTop: '2px',
            fontSize: '0.75rem',
            color: '#a0aec0',
            minWidth: '14px',
            flexShrink: 0,
          }}
        >
          {expanded ? '▼' : '▶'}
        </span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.93rem', fontWeight: 600, color: '#1a202c' }}>{item.title}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={item.siStatus} />
            <ImpactBadge impact={item.impactRating} />
            <ActivityTag type={item.activityType} />
            {item.provenanceChips.map(chip => (
              <ProvenanceChip key={chip.shortCode} chip={chip} />
            ))}
            {item.jiraTickets.length > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '10px',
                background: '#ebf4ff',
                border: '1px solid #bee3f8',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#2b6cb0',
              }}>
                {item.jiraTickets.length} Jira
              </span>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '4px 16px 16px 42px', borderTop: '1px solid #f0f4f8' }}>
          {item.askDescription && (
            <p style={{ margin: '10px 0 12px', fontSize: '0.87rem', color: '#4a5568', lineHeight: 1.6 }}>
              {item.askDescription}
            </p>
          )}

          <div>
            <FieldRow label="Timeline" value={item.timelineClassification} />
            <FieldRow label="Trigger" value={item.trigger} />
            <FieldRow label="Progress" value={item.progressNarrative} />
            <FieldRow label="Addressed" value={item.addressedStatus} />
            <FieldRow label="Next Milestone" value={item.nextMilestoneDate} />
            <FieldRow label="Implementation Notes" value={item.implementationNotes} />
          </div>

          {item.deliveryPeriods.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Delivery Periods
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {item.deliveryPeriods.map((dp, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 10px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      background: BAR_STYLE_COLORS[dp.barStyle] + '22',
                      border: `1px solid ${BAR_STYLE_COLORS[dp.barStyle]}55`,
                      color: BAR_STYLE_COLORS[dp.barStyle],
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: BAR_STYLE_COLORS[dp.barStyle],
                      }}
                    />
                    {dp.periodLabel} ({dp.barStyle})
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.jiraTickets.length > 0 && (
            <JiraTickets jiraTickets={item.jiraTickets} />
          )}
        </div>
      )}
    </div>
  )
}
