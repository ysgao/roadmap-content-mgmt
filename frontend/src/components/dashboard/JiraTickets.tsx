import { useEffect, useState } from 'react'
import type { JiraTicket } from '../../types'
import { getJiraTickets } from '../../services/api'
import JiraTicketRow from './JiraTicketRow'

interface Props {
  jiraTickets: string[]
}

export default function JiraTickets({ jiraTickets }: Props) {
  const [tickets, setTickets] = useState<JiraTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  useEffect(() => {
    if (!jiraTickets.length) return
    setLoading(true)
    getJiraTickets(jiraTickets)
      .then(res => { setTickets(res.tickets); setFetched(true) })
      .catch(() => { setFetched(true) })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jiraTickets.join(',')])

  if (loading) return (
    <div style={{ padding: '8px 0', fontSize: '0.82rem', color: '#a0aec0' }}>
      Loading Jira tickets...
    </div>
  )

  if (fetched && !tickets.length) return null

  if (!fetched) return null

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '0.73rem', fontWeight: 700, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
        Linked Jira Tickets
      </div>
      {tickets.map(t => <JiraTicketRow key={t.key} ticket={t} />)}
    </div>
  )
}
