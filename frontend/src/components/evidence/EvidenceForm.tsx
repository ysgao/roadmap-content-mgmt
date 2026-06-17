import { useState } from 'react'
import type { EvidenceInput, ProvenanceEvent } from '../../types'

interface Props {
  evidence?: EvidenceInput
  provenanceEvents: ProvenanceEvent[]
  onSave: (data: Partial<EvidenceInput>) => void
  onCancel: () => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #cbd5e0',
  borderRadius: '6px',
  fontSize: '0.87rem',
  color: '#2d3748',
  background: '#fff',
}

const errorInputStyle: React.CSSProperties = { ...inputStyle, border: '1px solid #e53e3e' }

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4a5568', marginBottom: '4px' }}>
      {children}
      {required && <span style={{ color: '#e53e3e', marginLeft: '3px' }}>*</span>}
    </label>
  )
}

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: '14px' }}>{children}</div>
}

function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export default function EvidenceForm({ evidence, provenanceEvents, onSave, onCancel }: Props) {
  const [provenanceEventId, setProvenanceEventId] = useState(evidence?.provenanceEvent.id ?? '')
  const [summary, setSummary] = useState(evidence?.summary ?? '')
  const [rankedGapsText, setRankedGapsText] = useState(
    evidence?.rankedGaps ? JSON.stringify(evidence.rankedGaps, null, 2) : ''
  )
  const [themesText, setThemesText] = useState(evidence?.themes?.join('\n') ?? '')
  const [priorityShiftsText, setPriorityShiftsText] = useState(
    evidence?.priorityShifts ? JSON.stringify(evidence.priorityShifts, null, 2) : ''
  )
  const [groupCount, setGroupCount] = useState<string>(evidence?.groupCount?.toString() ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!provenanceEventId) newErrors.provenanceEventId = 'Provenance event is required'
    if (!summary.trim()) newErrors.summary = 'Summary is required'
    if (rankedGapsText.trim() && !tryParseJson(rankedGapsText)) {
      newErrors.rankedGaps = 'Must be valid JSON array (e.g. [{"rank":1,"area":"..."}])'
    }
    if (priorityShiftsText.trim() && !tryParseJson(priorityShiftsText)) {
      newErrors.priorityShifts = 'Must be valid JSON array (e.g. [{"area":"...","fromRank":1,"toRank":2}])'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const provenanceEvent = provenanceEvents.find(ev => ev.id === provenanceEventId)
    if (!provenanceEvent) return

    onSave({
      provenanceEvent,
      summary: summary.trim(),
      rankedGaps: rankedGapsText.trim()
        ? (tryParseJson<Array<{ rank: number; area: string }>>(rankedGapsText) ?? null)
        : null,
      themes: themesText.trim()
        ? themesText
            .split('\n')
            .map(t => t.trim())
            .filter(Boolean)
        : null,
      priorityShifts: priorityShiftsText.trim()
        ? (tryParseJson<Array<{ area: string; fromRank: number; toRank: number }>>(priorityShiftsText) ?? null)
        : null,
      groupCount: groupCount.trim() ? parseInt(groupCount, 10) || null : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '4px' }}>
      <Field>
        <Label required>Provenance Event</Label>
        <select
          value={provenanceEventId}
          onChange={e => setProvenanceEventId(e.target.value)}
          style={errors.provenanceEventId ? errorInputStyle : inputStyle}
        >
          <option value="">Select an event...</option>
          {provenanceEvents.map(ev => (
            <option key={ev.id} value={ev.id}>
              {ev.displayLabel} ({ev.eventType} – {ev.eventDate})
            </option>
          ))}
        </select>
        {errors.provenanceEventId && (
          <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.provenanceEventId}</div>
        )}
      </Field>

      <Field>
        <Label required>Summary</Label>
        <textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          rows={3}
          style={{ ...(errors.summary ? errorInputStyle : inputStyle), resize: 'vertical' }}
          placeholder="Brief summary of the evidence or findings from this event"
        />
        {errors.summary && (
          <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.summary}</div>
        )}
      </Field>

      <Field>
        <Label>Group Count</Label>
        <input
          type="number"
          value={groupCount}
          onChange={e => setGroupCount(e.target.value)}
          style={inputStyle}
          min={0}
          placeholder="Number of participant groups"
        />
      </Field>

      <Field>
        <Label>Themes (one per line)</Label>
        <textarea
          value={themesText}
          onChange={e => setThemesText(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.82rem' }}
          placeholder={'Clinical findings coverage\nProcedure model consistency\nDrug content gaps'}
        />
      </Field>

      <Field>
        <Label>Ranked Gaps (JSON)</Label>
        <textarea
          value={rankedGapsText}
          onChange={e => setRankedGapsText(e.target.value)}
          rows={5}
          style={{
            ...((errors.rankedGaps ? errorInputStyle : inputStyle)),
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
          }}
          placeholder={'[\n  {"rank": 1, "area": "Anatomy coverage"},\n  {"rank": 2, "area": "Drug content"}\n]'}
        />
        {errors.rankedGaps && (
          <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.rankedGaps}</div>
        )}
      </Field>

      <Field>
        <Label>Priority Shifts (JSON)</Label>
        <textarea
          value={priorityShiftsText}
          onChange={e => setPriorityShiftsText(e.target.value)}
          rows={5}
          style={{
            ...((errors.priorityShifts ? errorInputStyle : inputStyle)),
            resize: 'vertical',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
          }}
          placeholder={'[\n  {"area": "Anatomy", "fromRank": 3, "toRank": 1}\n]'}
        />
        {errors.priorityShifts && (
          <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.priorityShifts}</div>
        )}
      </Field>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: '1px solid #cbd5e0',
            background: '#fff',
            color: '#4a5568',
            fontSize: '0.87rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            background: '#1a3a5c',
            color: '#fff',
            fontSize: '0.87rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {evidence ? 'Save Changes' : 'Create Evidence'}
        </button>
      </div>
    </form>
  )
}
