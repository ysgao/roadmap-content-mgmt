import type { ProvenanceChip as ProvenanceChipType } from '../../types'

interface Props {
  chip: ProvenanceChipType
}

export default function ProvenanceChip({ chip }: Props) {
  return (
    <span
      title={chip.displayLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 600,
        backgroundColor: '#e8f0fe',
        color: '#1a56db',
        border: '1px solid #c3d9fd',
        whiteSpace: 'nowrap',
        cursor: 'default',
      }}
    >
      {chip.displayLabel}
      {chip.referenceNumber !== undefined && (
        <sup style={{ fontSize: '0.65rem', color: '#1a56db', marginLeft: '1px' }}>
          #{chip.referenceNumber}
        </sup>
      )}
    </span>
  )
}
