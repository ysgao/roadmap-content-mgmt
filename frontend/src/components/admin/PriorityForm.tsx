import { useState } from 'react'
import type { MemberPriority, ProvenanceEvent } from '../../types'

interface Props {
  priority?: MemberPriority
  provenanceEvents: ProvenanceEvent[]
  onSave: (data: Partial<MemberPriority>) => void
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

const errorInputStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid #e53e3e',
}

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

export default function PriorityForm({ priority, provenanceEvents, onSave, onCancel }: Props) {
  const [rank, setRank] = useState(priority?.rank ?? 1)
  const [topicTitle, setTopicTitle] = useState(priority?.topicTitle ?? '')
  const [responseCount, setResponseCount] = useState(priority?.responseCount ?? 0)
  const [responsePercentage, setResponsePercentage] = useState(priority?.responsePercentage ?? 0)
  const [currentSIActivity, setCurrentSIActivity] = useState(priority?.currentSIActivity ?? '')
  const [progressSummary, setProgressSummary] = useState(priority?.progressSummary ?? '')
  const [nextMilestones, setNextMilestones] = useState(priority?.nextMilestones ?? '')
  const [riskFactors, setRiskFactors] = useState(priority?.riskFactors ?? '')
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>(
    priority?.provenanceEvents.map(e => e.shortCode) ?? []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!topicTitle.trim()) newErrors.topicTitle = 'Topic title is required'
    if (rank < 1) newErrors.rank = 'Rank must be at least 1'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const provenanceEventsData = selectedEventIds.map(code => {
      const ev = provenanceEvents.find(e => e.shortCode === code)
      return { shortCode: code, displayLabel: ev?.displayLabel ?? code }
    })

    onSave({
      rank,
      topicTitle: topicTitle.trim(),
      responseCount,
      responsePercentage,
      currentSIActivity: currentSIActivity.trim() || null,
      progressSummary: progressSummary.trim() || null,
      nextMilestones: nextMilestones.trim() || null,
      riskFactors: riskFactors.trim() || null,
      provenanceEvents: provenanceEventsData,
    })
  }

  function toggleEvent(code: string) {
    setSelectedEventIds(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <Field>
          <Label required>Rank</Label>
          <input
            type="number"
            value={rank}
            onChange={e => setRank(parseInt(e.target.value, 10) || 1)}
            style={errors.rank ? errorInputStyle : inputStyle}
            min={1}
          />
          {errors.rank && <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.rank}</div>}
        </Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label required>Topic Title</Label>
            <input
              value={topicTitle}
              onChange={e => setTopicTitle(e.target.value)}
              style={errors.topicTitle ? errorInputStyle : inputStyle}
              placeholder="Priority topic title"
            />
            {errors.topicTitle && (
              <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.topicTitle}</div>
            )}
          </Field>
        </div>

        <Field>
          <Label>Response Count</Label>
          <input
            type="number"
            value={responseCount}
            onChange={e => setResponseCount(parseInt(e.target.value, 10) || 0)}
            style={inputStyle}
            min={0}
          />
        </Field>

        <Field>
          <Label>Response Percentage (%)</Label>
          <input
            type="number"
            value={responsePercentage}
            onChange={e => setResponsePercentage(parseFloat(e.target.value) || 0)}
            style={inputStyle}
            min={0}
            max={100}
            step={0.1}
          />
        </Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Current SI Activity</Label>
            <textarea
              value={currentSIActivity}
              onChange={e => setCurrentSIActivity(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="What SNOMED International is currently doing"
            />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Progress Summary</Label>
            <textarea
              value={progressSummary}
              onChange={e => setProgressSummary(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Summary of progress to date"
            />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Next Milestones</Label>
            <textarea
              value={nextMilestones}
              onChange={e => setNextMilestones(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Upcoming milestones"
            />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Risk Factors</Label>
            <textarea
              value={riskFactors}
              onChange={e => setRiskFactors(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Known risks or blockers"
            />
          </Field>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Provenance Events</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {provenanceEvents.map(ev => {
            const selected = selectedEventIds.includes(ev.shortCode)
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => toggleEvent(ev.shortCode)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '12px',
                  border: `1px solid ${selected ? '#1a56db' : '#cbd5e0'}`,
                  background: selected ? '#e8f0fe' : '#f7fafc',
                  color: selected ? '#1a56db' : '#718096',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {ev.displayLabel}
              </button>
            )
          })}
          {provenanceEvents.length === 0 && (
            <span style={{ fontSize: '0.82rem', color: '#a0aec0' }}>No provenance events available</span>
          )}
        </div>
      </div>

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
          {priority ? 'Save Changes' : 'Create Priority'}
        </button>
      </div>
    </form>
  )
}
