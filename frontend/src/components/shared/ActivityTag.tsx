import type { ActivityType } from '../../types'

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  MemberDriven: '#4A90D9',
  Collaboration: '#7B68EE',
  CRG: '#50C878',
  Authoring: '#FF8C00',
  QAProgramme: '#DC143C',
  Maintenance: '#708090',
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  MemberDriven: 'Member Driven',
  Collaboration: 'Collaboration',
  CRG: 'CRG',
  Authoring: 'Authoring',
  QAProgramme: 'QA Programme',
  Maintenance: 'Maintenance',
}

interface Props {
  type: ActivityType
}

export default function ActivityTag({ type }: Props) {
  const bg = ACTIVITY_COLORS[type]
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '4px',
        fontSize: '0.72rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: '#fff',
        whiteSpace: 'nowrap',
      }}
    >
      {ACTIVITY_LABELS[type]}
    </span>
  )
}
