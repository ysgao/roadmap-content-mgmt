import type { ImpactRating } from '../../types'

const IMPACT_COLORS: Record<ImpactRating, { bg: string; color: string }> = {
  High: { bg: '#f8d7da', color: '#721c24' },
  Medium: { bg: '#fde8d1', color: '#7d4000' },
  Low: { bg: '#d1f0e8', color: '#0a5940' },
}

interface Props {
  impact: ImpactRating | null
}

export default function ImpactBadge({ impact }: Props) {
  if (!impact) return null
  const { bg, color } = IMPACT_COLORS[impact]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.72rem',
        fontWeight: 600,
        backgroundColor: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {impact} Impact
    </span>
  )
}
