import { useState } from 'react'
import type { EvidenceInput, ProvenanceEvent } from '../../types'
import EvidenceForm from './EvidenceForm'
import { createEvidence, updateEvidence } from '../../services/api'

interface Props {
  evidenceList: EvidenceInput[]
  provenanceEvents: ProvenanceEvent[]
  onUpdate: () => void
}

const EVENT_TYPE_COLORS = {
  Survey: '#4A90D9',
  Workshop: '#50C878',
  Forum: '#7B68EE',
}

export default function EvidenceTab({ evidenceList, provenanceEvents, onUpdate }: Props) {
  const [editing, setEditing] = useState<EvidenceInput | null | 'new'>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(data: Partial<EvidenceInput>) {
    setSaving(true)
    setError(null)
    try {
      if (editing === 'new') {
        await createEvidence(data)
      } else if (editing) {
        await updateEvidence(editing.id, data)
      }
      setEditing(null)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (editing !== null) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a3a5c' }}>
            {editing === 'new' ? 'New Evidence Input' : 'Edit Evidence'}
          </h3>
        </div>
        {error && (
          <div style={{ padding: '10px 14px', background: '#fff5f5', border: '1px solid #fc8181', borderRadius: '6px', color: '#c53030', fontSize: '0.85rem', marginBottom: '12px' }}>
            {error}
          </div>
        )}
        {!saving ? (
          <EvidenceForm
            evidence={editing === 'new' ? undefined : editing}
            provenanceEvents={provenanceEvents}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setError(null) }}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#718096' }}>Saving...</div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#1a3a5c' }}>Evidence Inputs</h3>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#718096' }}>
            Evidence captured from member engagement events ({evidenceList.length} records)
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#1a3a5c',
            color: '#fff',
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + New Evidence
        </button>
      </div>

      {evidenceList.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: '#a0aec0', fontSize: '0.9rem', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
          No evidence inputs yet. Create one to capture findings from engagement events.
        </div>
      ) : (
        <div>
          {evidenceList.map(ev => {
            const typeColor = EVENT_TYPE_COLORS[ev.provenanceEvent.eventType] ?? '#718096'
            return (
              <div
                key={ev.id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${typeColor}`,
                  borderRadius: '6px',
                  padding: '14px 16px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: typeColor + '22',
                          color: typeColor,
                          border: `1px solid ${typeColor}44`,
                        }}
                      >
                        {ev.provenanceEvent.eventType}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c' }}>
                        {ev.provenanceEvent.displayLabel}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#a0aec0' }}>
                        {ev.provenanceEvent.eventDate}
                      </span>
                      {ev.provenanceEvent.participantCount !== null && (
                        <span style={{ fontSize: '0.78rem', color: '#718096' }}>
                          {ev.provenanceEvent.participantCount} participants
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: '0.87rem', color: '#4a5568', lineHeight: 1.55 }}>
                      {ev.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#718096' }}>
                      {ev.rankedGaps && (
                        <span>{ev.rankedGaps.length} ranked gaps</span>
                      )}
                      {ev.themes && (
                        <span>{ev.themes.length} themes</span>
                      )}
                      {ev.priorityShifts && (
                        <span>{ev.priorityShifts.length} priority shifts</span>
                      )}
                      {ev.groupCount !== null && (
                        <span>{ev.groupCount} groups</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(ev)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '5px',
                      border: '1px solid #e2e8f0',
                      background: '#f7fafc',
                      color: '#4a5568',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
