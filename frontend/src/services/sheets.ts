import type {
  RoadmapItem,
  ProvenanceEvent,
  MemberPriority,
  DeliveryPeriod,
  ProvenanceChip,
  SIStatus,
  ImpactRating,
  Horizon,
  ActivityType,
  TimelineClassification,
  AddressedStatus,
  BarStyle,
  EventType,
  TimelineItem,
} from '../types'

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID as string | undefined

export function isSheetsConfigured(): boolean {
  return Boolean(SHEET_ID)
}

async function fetchRange(tab: string): Promise<Record<string, string>[]> {
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:json&sheet=${encodeURIComponent(tab)}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheets fetch error ${res.status} on tab "${tab}"`)

  // GViz returns: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const text = await res.text()
  const jsonStr = text.replace(/^[^{]*/, '').replace(/\);?\s*$/, '')
  const data = JSON.parse(jsonStr) as {
    status: string
    table?: {
      cols: Array<{ label?: string; id: string }>
      rows: Array<{ c: Array<{ v: unknown } | null> | null }>
    }
  }

  if (data.status !== 'ok' || !data.table) return []

  const headers = data.table.cols.map(c => (c.label || c.id).trim())
  return data.table.rows
    .map(row => {
      const cells = row.c ?? []
      return headers.reduce<Record<string, string>>((obj, header, i) => {
        const cell = cells[i]
        obj[header] = cell && cell.v != null ? String(cell.v).trim() : ''
        return obj
      }, {})
    })
    .filter(row => Object.values(row).some(v => v !== ''))
}

function str(val: string | undefined): string | null {
  return val && val.trim() !== '' ? val.trim() : null
}

// provenanceChips cell format: "Seoul24:1|Antwerp25" (shortCode:optionalRefNumber)
function parseProvenanceChips(
  val: string,
  eventMap: Map<string, string>
): ProvenanceChip[] {
  if (!val) return []
  return val.split('|').map(s => {
    const [code, ref] = s.trim().split(':')
    const shortCode = code.trim()
    return {
      shortCode,
      displayLabel: eventMap.get(shortCode) ?? shortCode,
      referenceNumber: ref ? parseInt(ref, 10) : undefined,
    }
  }).filter(c => c.shortCode !== '')
}

// deliveryPeriods cell format: "H1 2026:Active|H2 2026:Planned"
function parseDeliveryPeriods(val: string): DeliveryPeriod[] {
  if (!val) return []
  return val.split('|').map(s => {
    const parts = s.trim().split(':')
    const periodLabel = parts[0].trim()
    const barStyle = (parts[1]?.trim() ?? 'Active') as BarStyle
    const tokens = periodLabel.split(' ')
    const half = tokens[0] as 'H1' | 'H2'
    const year = parseInt(tokens[1] ?? '2026', 10)
    return { periodLabel, periodYear: year, periodHalf: half, barStyle }
  }).filter(d => d.periodLabel !== '')
}

export async function fetchProvenanceEvents(): Promise<ProvenanceEvent[]> {
  const rows = await fetchRange('ProvenanceEvents')
  return rows.map((r, i) => ({
    id: r['id'] || String(i + 1),
    shortCode: r['shortCode'] ?? '',
    displayLabel: r['displayLabel'] ?? r['shortCode'] ?? '',
    eventType: (r['eventType'] ?? 'Survey') as EventType,
    eventDate: r['eventDate'] ?? '',
    participantCount: r['participantCount'] ? parseInt(r['participantCount'], 10) : null,
  })).filter(e => e.shortCode !== '')
}

export async function fetchRoadmapItems(
  eventMap: Map<string, string>
): Promise<RoadmapItem[]> {
  const rows = await fetchRange('RoadmapItems')
  return rows.map((r, i) => ({
    id: r['id'] || String(i + 1),
    title: r['title'] ?? '',
    askDescription: r['askDescription'] ?? '',
    siStatus: (r['siStatus'] ?? 'Active') as SIStatus,
    impactRating: str(r['impactRating']) as ImpactRating | null,
    horizon: (r['horizon'] ?? 'Now') as Horizon,
    activityType: (r['activityType'] ?? 'MemberDriven') as ActivityType,
    timelineClassification: (r['timelineClassification'] ?? 'Project') as TimelineClassification,
    trigger: str(r['trigger']),
    progressNarrative: str(r['progressNarrative']),
    addressedStatus: str(r['addressedStatus']) as AddressedStatus | null,
    nextMilestoneDate: str(r['nextMilestoneDate']),
    implementationNotes: str(r['implementationNotes']),
    displayOrder: r['displayOrder'] ? parseInt(r['displayOrder'], 10) : i,
    provenanceChips: parseProvenanceChips(r['provenanceChips'] ?? '', eventMap),
    deliveryPeriods: parseDeliveryPeriods(r['deliveryPeriods'] ?? ''),
    jiraTickets: (r['jiraTickets'] ?? '').split('|').map((s: string) => s.trim()).filter(Boolean),
  })).filter(item => item.title !== '')
}

export async function fetchMemberPriorities(
  eventMap: Map<string, string>
): Promise<MemberPriority[]> {
  const rows = await fetchRange('MemberPriorities')
  return rows
    .map((r, i) => ({
      id: r['id'] || String(i + 1),
      rank: r['rank'] ? parseInt(r['rank'], 10) : i + 1,
      topicTitle: r['topicTitle'] ?? '',
      responseCount: r['responseCount'] ? parseInt(r['responseCount'], 10) : 0,
      responsePercentage: r['responsePercentage'] ? parseFloat(r['responsePercentage']) : 0,
      currentSIActivity: str(r['currentSIActivity']),
      progressSummary: str(r['progressSummary']),
      nextMilestones: str(r['nextMilestones']),
      riskFactors: str(r['riskFactors']),
      provenanceEvents: (r['provenanceEvents'] ?? '')
        .split('|')
        .map(s => s.trim())
        .filter(Boolean)
        .map(code => ({ shortCode: code, displayLabel: eventMap.get(code) ?? code })),
    }))
    .filter(p => p.topicTitle !== '')
    .sort((a, b) => a.rank - b.rank)
}

export async function fetchTimeline(
  eventMap: Map<string, string>
): Promise<{ periods: string[]; items: TimelineItem[] }> {
  const items = await fetchRoadmapItems(eventMap)
  const HORIZON_ORDER: Horizon[] = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance']

  const sorted = [...items].sort(
    (a, b) =>
      HORIZON_ORDER.indexOf(a.horizon) - HORIZON_ORDER.indexOf(b.horizon) ||
      a.displayOrder - b.displayOrder
  )

  return {
    periods: ['H1 2026', 'H2 2026', 'H1 2027', 'H2 2027', 'H1 2028', 'H2 2028', '2029+'],
    items: sorted.map(item => ({
      id: item.id,
      title: item.title,
      horizon: item.horizon,
      siStatus: item.siStatus,
      activityType: item.activityType,
      deliveryPeriods: item.deliveryPeriods.map(d => ({
        periodLabel: d.periodLabel,
        barStyle: d.barStyle,
      })),
    })),
  }
}

export async function loadAllSheetData() {
  const events = await fetchProvenanceEvents()
  const eventMap = new Map(events.map(e => [e.shortCode, e.displayLabel]))
  const [items, priorities] = await Promise.all([
    fetchRoadmapItems(eventMap),
    fetchMemberPriorities(eventMap),
  ])
  return { events, items, priorities, eventMap }
}
