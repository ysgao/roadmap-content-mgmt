import type {
  RoadmapItem,
  HorizonsResponse,
  ProvenanceEvent,
  MemberPriority,
  EvidenceInput,
  Horizon,
  TimelineItem,
} from '../types'
import {
  isSheetsConfigured,
  loadAllSheetData,
  fetchTimeline,
} from './sheets'

const BASE = import.meta.env.BASE_URL

const HORIZON_ORDER: Horizon[] = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance']

function groupItems(
  items: RoadmapItem[],
  filters?: RoadmapFilters
): HorizonsResponse {
  const filtered = items.filter(item => {
    if (filters?.origin && !item.provenanceChips.some(c => c.shortCode === filters.origin)) return false
    if (filters?.siStatus && item.siStatus !== filters.siStatus) return false
    if (filters?.activityType && item.activityType !== filters.activityType) return false
    return true
  })

  const horizons = HORIZON_ORDER.reduce((acc, h) => {
    acc[h] = filtered
      .filter(i => i.horizon === h)
      .sort((a, b) => a.displayOrder - b.displayOrder)
    return acc
  }, {} as Record<Horizon, RoadmapItem[]>)

  const counts = HORIZON_ORDER.reduce((acc, h) => {
    acc[h] = horizons[h].length
    return acc
  }, {} as Record<Horizon, number>)

  return { horizons, counts, total: filtered.length }
}

// In-memory cache so we hit the Sheets API once per page load
let _cache: {
  items: RoadmapItem[]
  events: ProvenanceEvent[]
  priorities: MemberPriority[]
  eventMap: Map<string, string>
} | null = null

async function getCache() {
  if (_cache) return _cache
  if (isSheetsConfigured()) {
    _cache = await loadAllSheetData()
  } else {
    // Local dev fallback: static JSON files
    const [items, events, priorities] = await Promise.all([
      fetch(`${BASE}data/roadmap-items.json`).then(r => r.json()) as Promise<RoadmapItem[]>,
      fetch(`${BASE}data/provenance-events.json`).then(r => r.json()) as Promise<ProvenanceEvent[]>,
      fetch(`${BASE}data/member-priorities.json`).then(r => r.json()) as Promise<MemberPriority[]>,
    ])
    _cache = {
      items,
      events,
      priorities,
      eventMap: new Map(events.map(e => [e.shortCode, e.displayLabel])),
    }
  }
  return _cache
}

export interface RoadmapFilters {
  origin?: string
  siStatus?: string
  activityType?: string
}

export async function getRoadmapItems(filters?: RoadmapFilters): Promise<HorizonsResponse> {
  const { items } = await getCache()
  return groupItems(items, filters)
}

export async function getRoadmapItem(id: string): Promise<RoadmapItem> {
  const { items } = await getCache()
  const found = items.find(i => i.id === id)
  if (!found) throw new Error('Not found')
  return found
}

export async function getTimeline(): Promise<{ periods: string[]; items: TimelineItem[] }> {
  if (isSheetsConfigured()) {
    const { eventMap } = await getCache()
    return fetchTimeline(eventMap)
  }
  const res = await fetch(`${BASE}data/timeline.json`)
  return res.json()
}

export async function getMemberPriorities(): Promise<MemberPriority[]> {
  const { priorities } = await getCache()
  return priorities
}

export async function getProvenanceEvents(): Promise<ProvenanceEvent[]> {
  const { events } = await getCache()
  return events
}

export function getEvidence(): Promise<EvidenceInput[]> {
  return Promise.resolve([])
}

// Write operations not available in static/Sheets deployment
export function createRoadmapItem(_d: Partial<RoadmapItem>): Promise<RoadmapItem> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function updateRoadmapItem(_id: string, _d: Partial<RoadmapItem>): Promise<RoadmapItem> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function deleteRoadmapItem(_id: string): Promise<void> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function createMemberPriority(_d: Partial<MemberPriority>): Promise<MemberPriority> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function updateMemberPriority(_id: string, _d: Partial<MemberPriority>): Promise<MemberPriority> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function deleteMemberPriority(_id: string): Promise<void> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function createProvenanceEvent(_d: Partial<ProvenanceEvent>): Promise<ProvenanceEvent> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function updateProvenanceEvent(_id: string, _d: Partial<ProvenanceEvent>): Promise<ProvenanceEvent> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function createEvidence(_d: Partial<EvidenceInput>): Promise<EvidenceInput> {
  return Promise.reject(new Error('Read-only deployment'))
}
export function updateEvidence(_id: string, _d: Partial<EvidenceInput>): Promise<EvidenceInput> {
  return Promise.reject(new Error('Read-only deployment'))
}
