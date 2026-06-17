import { Router, Request, Response } from 'express'
import { requireAuthenticated } from '../middleware/auth'
import { jiraLimiter } from '../middleware/rateLimiter'
import { fetchJiraTickets } from '../../services/jiraService'

export const jiraRouter = Router()

jiraRouter.get('/tickets', jiraLimiter, requireAuthenticated, async (req: Request, res: Response) => {
  const keysParam = req.query.keys as string | undefined
  if (!keysParam) {
    res.status(400).json({ error: 'keys parameter required' })
    return
  }

  const keys = keysParam.split(',').map(k => k.trim()).filter(Boolean)
  if (keys.length > 10) {
    res.status(400).json({ error: 'Maximum 10 keys per request' })
    return
  }

  try {
    const tickets = await fetchJiraTickets(keys)
    res.json({ tickets })
  } catch {
    res.status(503).json({ error: 'Jira unavailable' })
  }
})
