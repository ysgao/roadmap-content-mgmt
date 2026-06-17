import type { JiraTicket } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  'In Progress': '#3182ce',
  'Open': '#38a169',
  'To Do': '#718096',
  'Reopened': '#e53e3e',
  'Done': '#718096',
  'Closed': '#718096',
  'Resolved': '#718096',
}

interface Props { ticket: JiraTicket }

export default function JiraTicketRow({ ticket }: Props) {
  if (ticket.error) {
    return (
      <div style={{ padding: '6px 0', fontSize: '0.82rem', color: '#a0aec0' }}>
        <span style={{ fontWeight: 600, color: '#4a5568' }}>{ticket.key}</span>
        {' — '}
        <span>{ticket.error}</span>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[ticket.status] ?? '#718096'

  return (
    <div style={{ padding: '6px 0', borderBottom: '1px solid #f0f4f8', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <a
        href={ticket.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontWeight: 700, fontSize: '0.82rem', color: '#4A90D9', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {ticket.key}
      </a>
      <span style={{ fontSize: '0.82rem', color: '#2d3748', flex: 1, lineHeight: 1.4 }}>
        {ticket.summary}
      </span>
      <span style={{
        fontSize: '0.75rem', fontWeight: 600, color: statusColor,
        background: `${statusColor}18`, border: `1px solid ${statusColor}40`,
        borderRadius: '4px', padding: '1px 7px', whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {ticket.status}
      </span>
      {ticket.assignee && (
        <span style={{ fontSize: '0.75rem', color: '#718096', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {ticket.assignee}
        </span>
      )}
    </div>
  )
}
