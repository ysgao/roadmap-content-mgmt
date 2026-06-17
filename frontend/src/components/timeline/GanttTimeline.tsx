import type { TimelineItem, Horizon } from '../../types'
import { ACTIVITY_COLORS } from '../shared/ActivityTag'
import PeriodBar from './PeriodBar'

interface Props {
  periods: string[]
  items: TimelineItem[]
}

const HORIZON_ORDER: Horizon[] = ['Now', 'Next', 'Later', 'UnderAssessment', 'InMaintenance']
const HORIZON_LABELS: Record<Horizon, string> = {
  Now: 'Now',
  Next: 'Next',
  Later: 'Later',
  UnderAssessment: 'Under Assessment',
  InMaintenance: 'In Maintenance',
}
const HORIZON_COLORS: Record<Horizon, string> = {
  Now: '#1a472a',
  Next: '#1a3a5c',
  Later: '#3a1a5c',
  UnderAssessment: '#5c3a1a',
  InMaintenance: '#1a5c4a',
}

const ROW_HEIGHT = 40
const LABEL_WIDTH = 280
const COL_WIDTH = 100
const HEADER_HEIGHT = 48
const HORIZON_LABEL_HEIGHT = 32

export default function GanttTimeline({ periods, items }: Props) {
  const groupedByHorizon = HORIZON_ORDER.reduce<Record<Horizon, TimelineItem[]>>(
    (acc, h) => {
      acc[h] = items.filter(i => i.horizon === h)
      return acc
    },
    {} as Record<Horizon, TimelineItem[]>
  )

  const activeHorizons = HORIZON_ORDER.filter(h => groupedByHorizon[h].length > 0)

  let totalRows = 0
  const horizonOffsets: Record<string, number> = {}
  for (const h of activeHorizons) {
    horizonOffsets[h] = totalRows
    totalRows += 1 + groupedByHorizon[h].length
  }

  const totalHeight = HEADER_HEIGHT + totalRows * ROW_HEIGHT
  const totalWidth = LABEL_WIDTH + periods.length * COL_WIDTH

  const getPeriodIndex = (label: string) => periods.indexOf(label)

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '80vh' }}>
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      >
        <rect width={totalWidth} height={totalHeight} fill="#fff" />

        <rect x={0} y={0} width={LABEL_WIDTH} height={HEADER_HEIGHT} fill="#1a3a5c" />
        <text x={12} y={HEADER_HEIGHT / 2 + 5} fontSize={12} fontWeight={700} fill="#fff">
          Roadmap Item
        </text>

        {periods.map((p, i) => {
          const x = LABEL_WIDTH + i * COL_WIDTH
          const isEven = i % 2 === 0
          return (
            <g key={p}>
              <rect x={x} y={0} width={COL_WIDTH} height={HEADER_HEIGHT} fill={isEven ? '#1a3a5c' : '#1f4a7a'} />
              <text
                x={x + COL_WIDTH / 2}
                y={HEADER_HEIGHT / 2 + 5}
                fontSize={11}
                fontWeight={600}
                fill="#fff"
                textAnchor="middle"
              >
                {p}
              </text>
            </g>
          )
        })}

        {Array.from({ length: periods.length + 1 }, (_, i) => (
          <line
            key={i}
            x1={LABEL_WIDTH + i * COL_WIDTH}
            y1={0}
            x2={LABEL_WIDTH + i * COL_WIDTH}
            y2={totalHeight}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}

        {activeHorizons.map(horizon => {
          const rowOffset = horizonOffsets[horizon]
          const horizonItems = groupedByHorizon[horizon]

          return (
            <g key={horizon}>
              <rect
                x={0}
                y={HEADER_HEIGHT + rowOffset * ROW_HEIGHT}
                width={totalWidth}
                height={HORIZON_LABEL_HEIGHT}
                fill={HORIZON_COLORS[horizon]}
              />
              <text
                x={12}
                y={HEADER_HEIGHT + rowOffset * ROW_HEIGHT + HORIZON_LABEL_HEIGHT / 2 + 5}
                fontSize={11}
                fontWeight={700}
                fill="#fff"
              >
                {HORIZON_LABELS[horizon]} ({horizonItems.length})
              </text>

              {horizonItems.map((item, itemIdx) => {
                const rowY = HEADER_HEIGHT + (rowOffset + 1 + itemIdx) * ROW_HEIGHT
                const isEvenRow = itemIdx % 2 === 0

                return (
                  <g key={item.id}>
                    <rect x={0} y={rowY} width={totalWidth} height={ROW_HEIGHT} fill={isEvenRow ? '#fff' : '#f8fafc'} />

                    <rect
                      x={0}
                      y={rowY}
                      width={4}
                      height={ROW_HEIGHT}
                      fill={ACTIVITY_COLORS[item.activityType]}
                    />

                    <text
                      x={12}
                      y={rowY + ROW_HEIGHT / 2 + 4}
                      fontSize={11}
                      fill="#2d3748"
                      style={{ overflow: 'hidden' }}
                    >
                      {item.title.length > 36 ? item.title.slice(0, 34) + '…' : item.title}
                    </text>

                    <line
                      x1={0}
                      y1={rowY + ROW_HEIGHT}
                      x2={totalWidth}
                      y2={rowY + ROW_HEIGHT}
                      stroke="#edf2f7"
                      strokeWidth={1}
                    />

                    {item.deliveryPeriods.map((dp, dpIdx) => {
                      const colIdx = getPeriodIndex(dp.periodLabel)
                      if (colIdx < 0) return null
                      return (
                        <g key={dpIdx} transform={`translate(${LABEL_WIDTH + colIdx * COL_WIDTH}, ${rowY})`}>
                          <PeriodBar
                            barStyle={dp.barStyle}
                            startCol={0}
                            endCol={0}
                            rowHeight={ROW_HEIGHT}
                            colWidth={COL_WIDTH}
                          />
                        </g>
                      )
                    })}
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
