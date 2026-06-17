import type { ProvenanceEvent } from '../../types'
import { useFilterStore } from '../../store/filterStore'
import JiraSignInPrompt from './JiraSignInPrompt'

const SI_STATUS_OPTIONS = ['Active', 'Planned', 'Paused', 'Deferred']
const ACTIVITY_TYPE_OPTIONS = [
  { value: 'MemberDriven', label: 'Member Driven' },
  { value: 'Collaboration', label: 'Collaboration' },
  { value: 'CRG', label: 'CRG' },
  { value: 'Authoring', label: 'Authoring' },
  { value: 'QAProgramme', label: 'QA Programme' },
  { value: 'Maintenance', label: 'Maintenance' },
]

interface Props {
  provenanceEvents: ProvenanceEvent[]
  isAuthenticated: boolean
}

const selectStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e0',
  background: '#fff',
  fontSize: '0.85rem',
  color: '#2d3748',
  cursor: 'pointer',
  minWidth: '180px',
}

export default function FilterBar({ provenanceEvents, isAuthenticated }: Props) {
  const { origin, siStatus, activityType, hasActiveJira, setOrigin, setSiStatus, setActivityType, setHasActiveJira, reset } = useFilterStore()

  const hasFilters = origin !== '' || siStatus !== '' || activityType !== '' || hasActiveJira

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px 16px',
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Origin
          </label>
          <select value={origin} onChange={e => setOrigin(e.target.value)} style={selectStyle}>
            <option value="">All sources</option>
            {provenanceEvents.map(ev => (
              <option key={ev.id} value={ev.shortCode}>
                {ev.displayLabel}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Status
          </label>
          <select value={siStatus} onChange={e => setSiStatus(e.target.value)} style={selectStyle}>
            <option value="">All statuses</option>
            {SI_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Activity
          </label>
          <select value={activityType} onChange={e => setActivityType(e.target.value)} style={selectStyle}>
            <option value="">All types</option>
            {ACTIVITY_TYPE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setHasActiveJira(!hasActiveJira)}
          style={{
            padding: '7px 14px',
            borderRadius: '6px',
            border: hasActiveJira ? '1px solid #4A90D9' : '1px solid #cbd5e0',
            background: hasActiveJira ? '#ebf4ff' : '#fff',
            fontSize: '0.82rem',
            color: hasActiveJira ? '#2b6cb0' : '#4a5568',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >
          {hasActiveJira ? '✓ ' : ''}Active Jira Tickets
        </button>

        {hasFilters && (
          <button
            onClick={reset}
            style={{
              padding: '7px 14px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f7fafc',
              fontSize: '0.82rem',
              color: '#718096',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {hasActiveJira && !isAuthenticated && (
        <JiraSignInPrompt />
      )}
    </div>
  )
}
