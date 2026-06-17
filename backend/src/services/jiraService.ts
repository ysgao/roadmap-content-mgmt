export interface JiraTicketResult {
  key: string
  summary: string
  status: string
  assignee: string | null
  priority: string | null
  url: string
  error?: string
}

export async function fetchJiraTickets(keys: string[]): Promise<JiraTicketResult[]> {
  const baseUrl = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const token = process.env.JIRA_API_TOKEN

  if (!baseUrl || !email || !token) {
    return keys.map(key => ({
      key, summary: '', status: '', assignee: null, priority: null,
      url: '', error: 'Jira not configured'
    }))
  }

  const auth = Buffer.from(`${email}:${token}`).toString('base64')

  return Promise.all(keys.map(async key => {
    const url = `${baseUrl}/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,status,assignee,priority`
    const result: JiraTicketResult = {
      key, summary: '', status: '', assignee: null, priority: null,
      url: `${baseUrl}/browse/${key}`,
    }

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const res = await fetch(url, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (res.status === 404) { result.error = 'Not found'; return result }
      if (res.status === 403) { result.error = 'Access restricted'; return result }
      if (!res.ok) { result.error = `HTTP ${res.status}`; return result }

      const data = await res.json() as {
        key: string
        fields: {
          summary: string
          status: { name: string }
          assignee: { displayName: string } | null
          priority: { name: string } | null
        }
      }

      result.summary = data.fields.summary ?? ''
      result.status = data.fields.status?.name ?? ''
      result.assignee = data.fields.assignee?.displayName ?? null
      result.priority = data.fields.priority?.name ?? null
    } catch (err) {
      result.error = (err as Error).name === 'AbortError' ? 'Unavailable' : 'Request failed'
    }

    return result
  }))
}
