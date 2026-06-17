import type { MemberPriority } from '../../types'
import PriorityCard from './PriorityCard'

interface Props {
  priorities: MemberPriority[]
}

export default function MemberPrioritiesList({ priorities }: Props) {
  if (priorities.length === 0) return null

  const sorted = [...priorities].sort((a, b) => a.rank - b.rank)

  return (
    <section style={{ marginTop: '32px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2
          style={{
            margin: '0 0 4px',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#1a3a5c',
          }}
        >
          Member Priorities
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#718096' }}>
          Top priorities identified through member surveys and engagement events ({sorted.length} topics)
        </p>
      </div>

      <div>
        {sorted.map(priority => (
          <PriorityCard key={priority.id} priority={priority} />
        ))}
      </div>
    </section>
  )
}
