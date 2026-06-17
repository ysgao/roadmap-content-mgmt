/**
 * Fetches Jira ticket data for all tickets referenced in the Google Sheet
 * and writes to frontend/public/data/jira-tickets.json
 *
 * Run via GitHub Actions (see .github/workflows/fetch-jira-data.yml)
 * Required env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, GOOGLE_SHEETS_ID
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT = path.join(__dirname, '../frontend/public/data/jira-tickets.json')

const SHEET_ID = process.env.GOOGLE_SHEETS_ID
const JIRA_BASE_URL = (process.env.JIRA_BASE_URL ?? '').replace(/\/$/, '')
const JIRA_EMAIL = process.env.JIRA_EMAIL
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'github-actions-jira-fetch/1.0' } }, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    }).on('error', reject)
  })
}

function httpsGetAuth(url, authHeader) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' },
    }
    https.get(options, res => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    }).on('error', reject)
  })
}

async function getTicketKeysFromSheet() {
  if (!SHEET_ID) {
    console.warn('GOOGLE_SHEETS_ID not set — no ticket keys to fetch')
    return []
  }

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RoadmapItems`
  const { body } = await httpsGet(url)

  // Strip GViz JSONP wrapper
  const jsonStr = body.replace(/^[^{]*/, '').replace(/\);?\s*$/, '')
  let data
  try { data = JSON.parse(jsonStr) } catch { return [] }

  if (data.status !== 'ok' || !data.table) return []

  const headers = data.table.cols.map(c => (c.label || c.id).trim())
  const jiraCol = headers.indexOf('jiraTickets')
  if (jiraCol === -1) {
    console.log('jiraTickets column not found in sheet — nothing to fetch')
    return []
  }

  const keys = new Set()
  for (const row of data.table.rows) {
    const cell = row.c?.[jiraCol]
    const val = cell?.v ? String(cell.v).trim() : ''
    if (val) {
      val.split('|').map(k => k.trim()).filter(Boolean).forEach(k => keys.add(k))
    }
  }

  return [...keys]
}

async function fetchJiraTicket(key, authHeader) {
  const url = `${JIRA_BASE_URL}/rest/api/3/issue/${encodeURIComponent(key)}?fields=summary,status,assignee,priority`
  const result = {
    key,
    summary: '',
    status: '',
    assignee: null,
    priority: null,
    url: `${JIRA_BASE_URL}/browse/${key}`,
  }

  try {
    const { status, body } = await httpsGetAuth(url, authHeader)
    if (status === 404) { result.error = 'Not found'; return result }
    if (status === 403) { result.error = 'Access restricted'; return result }
    if (status !== 200) { result.error = `HTTP ${status}`; return result }

    const data = JSON.parse(body)
    result.summary = data.fields?.summary ?? ''
    result.status = data.fields?.status?.name ?? ''
    result.assignee = data.fields?.assignee?.displayName ?? null
    result.priority = data.fields?.priority?.name ?? null
  } catch (err) {
    result.error = `Request failed: ${err.message}`
  }

  return result
}

async function main() {
  console.log('Fetching ticket keys from Google Sheet...')
  const keys = await getTicketKeysFromSheet()
  console.log(`Found ${keys.length} unique ticket keys: ${keys.join(', ') || '(none)'}`)

  if (!keys.length) {
    const output = { lastUpdated: new Date().toISOString(), tickets: {} }
    fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
    console.log('Written empty jira-tickets.json')
    return
  }

  if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    console.error('Missing JIRA_BASE_URL, JIRA_EMAIL, or JIRA_API_TOKEN')
    process.exit(1)
  }

  const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')

  console.log(`Fetching ${keys.length} tickets from Jira...`)
  const results = await Promise.all(keys.map(key => fetchJiraTicket(key, authHeader)))

  const tickets = {}
  for (const t of results) {
    tickets[t.key] = t
    const status = t.error ? `ERROR: ${t.error}` : t.status
    console.log(`  ${t.key}: ${status}`)
  }

  const output = { lastUpdated: new Date().toISOString(), tickets }
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2))
  console.log(`Written ${results.length} tickets to ${OUTPUT}`)
}

main().catch(err => { console.error(err); process.exit(1) })
