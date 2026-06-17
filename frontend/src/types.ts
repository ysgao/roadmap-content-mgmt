export type SIStatus = 'Active' | 'Planned' | 'Paused' | 'Deferred'
export type ImpactRating = 'High' | 'Medium' | 'Low'
export type Horizon = 'Now' | 'Next' | 'Later' | 'UnderAssessment' | 'InMaintenance'
export type ActivityType = 'MemberDriven' | 'Collaboration' | 'CRG' | 'Authoring' | 'QAProgramme' | 'Maintenance'
export type TimelineClassification = 'Project' | 'Continuous'
export type AddressedStatus = 'Yes' | 'Partially' | 'No'
export type PeriodHalf = 'H1' | 'H2'
export type BarStyle = 'Active' | 'Planned' | 'Assessment' | 'Ongoing'
export type EventType = 'Survey' | 'Workshop' | 'Forum'

export interface ProvenanceChip {
  shortCode: string
  displayLabel: string
  referenceNumber?: number
}

export interface DeliveryPeriod {
  periodLabel: string
  periodYear: number
  periodHalf: PeriodHalf
  barStyle: BarStyle
}

export interface RoadmapItem {
  id: string
  title: string
  askDescription: string
  siStatus: SIStatus
  impactRating: ImpactRating | null
  horizon: Horizon
  activityType: ActivityType
  timelineClassification: TimelineClassification
  trigger: string | null
  progressNarrative: string | null
  addressedStatus: AddressedStatus | null
  nextMilestoneDate: string | null
  implementationNotes: string | null
  displayOrder: number
  provenanceChips: ProvenanceChip[]
  deliveryPeriods: DeliveryPeriod[]
}

export interface HorizonsResponse {
  horizons: Record<Horizon, RoadmapItem[]>
  counts: Record<Horizon, number>
  total: number
}

export interface ProvenanceEvent {
  id: string
  shortCode: string
  displayLabel: string
  eventType: EventType
  eventDate: string
  participantCount: number | null
}

export interface MemberPriority {
  id: string
  rank: number
  topicTitle: string
  responseCount: number
  responsePercentage: number
  currentSIActivity: string | null
  progressSummary: string | null
  nextMilestones: string | null
  riskFactors: string | null
  provenanceEvents: Pick<ProvenanceEvent, 'shortCode' | 'displayLabel'>[]
}

export interface EvidenceInput {
  id: string
  provenanceEvent: ProvenanceEvent
  summary: string
  rankedGaps: Array<{ rank: number; area: string }> | null
  themes: string[] | null
  priorityShifts: Array<{ area: string; fromRank: number; toRank: number }> | null
  groupCount: number | null
}

export interface TimelineItem {
  id: string
  title: string
  horizon: Horizon
  siStatus: SIStatus
  activityType: ActivityType
  deliveryPeriods: Array<{ periodLabel: string; barStyle: BarStyle }>
}

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
}
