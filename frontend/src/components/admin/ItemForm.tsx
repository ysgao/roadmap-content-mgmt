import { useState } from 'react'
import type {
  RoadmapItem,
  SIStatus,
  ImpactRating,
  Horizon,
  ActivityType,
  TimelineClassification,
  AddressedStatus,
  PeriodHalf,
  BarStyle,
  ProvenanceEvent,
} from '../../types'

interface Props {
  item?: RoadmapItem
  provenanceEvents: ProvenanceEvent[]
  onSave: (data: Partial<RoadmapItem>) => void
  onCancel: () => void
}

interface DeliveryPeriodDraft {
  periodYear: number
  periodHalf: PeriodHalf
  barStyle: BarStyle
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

export default function ItemForm({ item, provenanceEvents, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [askDescription, setAskDescription] = useState(item?.askDescription ?? '')
  const [siStatus, setSiStatus] = useState<SIStatus>(item?.siStatus ?? 'Planned')
  const [impactRating, setImpactRating] = useState<ImpactRating | ''>(item?.impactRating ?? '')
  const [horizon, setHorizon] = useState<Horizon>(item?.horizon ?? 'UnderAssessment')
  const [activityType, setActivityType] = useState<ActivityType>(item?.activityType ?? 'Authoring')
  const [timelineClassification, setTimelineClassification] = useState<TimelineClassification>(
    item?.timelineClassification ?? 'Project'
  )
  const [trigger, setTrigger] = useState(item?.trigger ?? '')
  const [progressNarrative, setProgressNarrative] = useState(item?.progressNarrative ?? '')
  const [addressedStatus, setAddressedStatus] = useState<AddressedStatus | ''>(item?.addressedStatus ?? '')
  const [nextMilestoneDate, setNextMilestoneDate] = useState(item?.nextMilestoneDate ?? '')
  const [implementationNotes, setImplementationNotes] = useState(item?.implementationNotes ?? '')
  const [displayOrder, setDisplayOrder] = useState(item?.displayOrder ?? 0)

  const [selectedProvenanceCodes, setSelectedProvenanceCodes] = useState<string[]>(
    item?.provenanceChips.map(c => c.shortCode) ?? []
  )

  const [deliveryPeriods, setDeliveryPeriods] = useState<DeliveryPeriodDraft[]>(
    item?.deliveryPeriods.map(dp => ({
      periodYear: dp.periodYear,
      periodHalf: dp.periodHalf,
      barStyle: dp.barStyle,
    })) ?? []
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!askDescription.trim()) newErrors.askDescription = 'Description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const provenanceChips = selectedProvenanceCodes.map(code => {
      const ev = provenanceEvents.find(e => e.shortCode === code)
      return { shortCode: code, displayLabel: ev?.displayLabel ?? code }
    })

    const dpData = deliveryPeriods.map(dp => ({
      periodLabel: `${dp.periodHalf} ${dp.periodYear}`,
      periodYear: dp.periodYear,
      periodHalf: dp.periodHalf,
      barStyle: dp.barStyle,
    }))

    onSave({
      title: title.trim(),
      askDescription: askDescription.trim(),
      siStatus,
      impactRating: impactRating || null,
      horizon,
      activityType,
      timelineClassification,
      trigger: trigger.trim() || null,
      progressNarrative: progressNarrative.trim() || null,
      addressedStatus: (addressedStatus as AddressedStatus) || null,
      nextMilestoneDate: nextMilestoneDate || null,
      implementationNotes: implementationNotes.trim() || null,
      displayOrder,
      provenanceChips,
      deliveryPeriods: dpData,
    })
  }

  function toggleProvenance(code: string) {
    setSelectedProvenanceCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    )
  }

  function addDeliveryPeriod() {
    setDeliveryPeriods(prev => [
      ...prev,
      { periodYear: new Date().getFullYear(), periodHalf: 'H1', barStyle: 'Planned' },
    ])
  }

  function removeDeliveryPeriod(idx: number) {
    setDeliveryPeriods(prev => prev.filter((_, i) => i !== idx))
  }

  function updateDeliveryPeriod(idx: number, field: keyof DeliveryPeriodDraft, value: string | number) {
    setDeliveryPeriods(prev =>
      prev.map((dp, i) => (i === idx ? { ...dp, [field]: value } : dp))
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '4px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label required>Title</Label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={errors.title ? errorInputStyle : inputStyle}
              placeholder="Roadmap item title"
            />
            {errors.title && <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.title}</div>}
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label required>Ask / Description</Label>
            <textarea
              value={askDescription}
              onChange={e => setAskDescription(e.target.value)}
              rows={3}
              style={{ ...(errors.askDescription ? errorInputStyle : inputStyle), resize: 'vertical' }}
              placeholder="Describe what is being asked or delivered"
            />
            {errors.askDescription && (
              <div style={{ fontSize: '0.75rem', color: '#e53e3e', marginTop: '3px' }}>{errors.askDescription}</div>
            )}
          </Field>
        </div>

        <Field>
          <Label required>SI Status</Label>
          <select value={siStatus} onChange={e => setSiStatus(e.target.value as SIStatus)} style={inputStyle}>
            {(['Active', 'Planned', 'Paused', 'Deferred'] as SIStatus[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label>Impact Rating</Label>
          <select value={impactRating} onChange={e => setImpactRating(e.target.value as ImpactRating | '')} style={inputStyle}>
            <option value="">None</option>
            {(['High', 'Medium', 'Low'] as ImpactRating[]).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label required>Horizon</Label>
          <select value={horizon} onChange={e => setHorizon(e.target.value as Horizon)} style={inputStyle}>
            {(['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance'] as Horizon[]).map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label required>Activity Type</Label>
          <select value={activityType} onChange={e => setActivityType(e.target.value as ActivityType)} style={inputStyle}>
            {(['MemberDriven', 'Collaboration', 'CRG', 'Authoring', 'QAProgramme', 'Maintenance'] as ActivityType[]).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label required>Timeline Classification</Label>
          <select
            value={timelineClassification}
            onChange={e => setTimelineClassification(e.target.value as TimelineClassification)}
            style={inputStyle}
          >
            {(['Project', 'Continuous'] as TimelineClassification[]).map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label>Addressed Status</Label>
          <select
            value={addressedStatus}
            onChange={e => setAddressedStatus(e.target.value as AddressedStatus | '')}
            style={inputStyle}
          >
            <option value="">Unknown</option>
            {(['Yes', 'Partially', 'No'] as AddressedStatus[]).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field>
          <Label>Next Milestone Date</Label>
          <input
            type="date"
            value={nextMilestoneDate}
            onChange={e => setNextMilestoneDate(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field>
          <Label>Display Order</Label>
          <input
            type="number"
            value={displayOrder}
            onChange={e => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
            style={inputStyle}
            min={0}
          />
        </Field>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Trigger</Label>
            <textarea
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="What triggered this roadmap item?"
            />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Progress Narrative</Label>
            <textarea
              value={progressNarrative}
              onChange={e => setProgressNarrative(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Current progress description"
            />
          </Field>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <Field>
            <Label>Implementation Notes</Label>
            <textarea
              value={implementationNotes}
              onChange={e => setImplementationNotes(e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Notes on implementation approach"
            />
          </Field>
        </div>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Label>Provenance Sources</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
          {provenanceEvents.map(ev => {
            const selected = selectedProvenanceCodes.includes(ev.shortCode)
            return (
              <button
                key={ev.id}
                type="button"
                onClick={() => toggleProvenance(ev.shortCode)}
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

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Label>Delivery Periods</Label>
          <button
            type="button"
            onClick={addDeliveryPeriod}
            style={{
              padding: '4px 12px',
              borderRadius: '4px',
              border: '1px solid #4A90D9',
              background: '#ebf4ff',
              color: '#1a56db',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Period
          </button>
        </div>
        {deliveryPeriods.map((dp, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              padding: '8px',
              background: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              marginBottom: '6px',
            }}
          >
            <input
              type="number"
              value={dp.periodYear}
              onChange={e => updateDeliveryPeriod(idx, 'periodYear', parseInt(e.target.value, 10))}
              style={{ ...inputStyle, width: '90px' }}
              min={2020}
              max={2035}
            />
            <select
              value={dp.periodHalf}
              onChange={e => updateDeliveryPeriod(idx, 'periodHalf', e.target.value)}
              style={{ ...inputStyle, width: '80px' }}
            >
              <option value="H1">H1</option>
              <option value="H2">H2</option>
            </select>
            <select
              value={dp.barStyle}
              onChange={e => updateDeliveryPeriod(idx, 'barStyle', e.target.value)}
              style={{ ...inputStyle, width: '120px' }}
            >
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Assessment">Assessment</option>
              <option value="Ongoing">Ongoing</option>
            </select>
            <button
              type="button"
              onClick={() => removeDeliveryPeriod(idx)}
              style={{
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #fc8181',
                background: '#fff5f5',
                color: '#c53030',
                fontSize: '0.8rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Remove
            </button>
          </div>
        ))}
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
          {item ? 'Save Changes' : 'Create Item'}
        </button>
      </div>
    </form>
  )
}
