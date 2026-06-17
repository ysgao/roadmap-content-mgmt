import type { SIStatus } from '../../types'

const STATUS_COLORS: Record<SIStatus, { bg: string; color: string }> = {
  Active: { bg: '#d4edda', color: '#155724' },
  Planned: { bg: '#cce5ff', color: '#004085' },
  Paused: { bg: '#fff3cd', color: '#856404' },
  Deferred: { bg: '#e2e3e5', color: '#383d41' },
}

interface Props {
  status: SIStatus
}

export default function StatusBadge({ status }: Props) {
  const { bg, color } = STATUS_COLORS[status]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.02em',
        backgroundColor: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  )
}
