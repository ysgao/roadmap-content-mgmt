import type { BarStyle } from '../../types'

interface Props {
  barStyle: BarStyle
  startCol: number
  endCol: number
  rowHeight: number
  colWidth: number
}

const BAR_FILL: Record<BarStyle, string> = {
  Active: '#28a745',
  Planned: '#fff3cd',
  Assessment: '#e9ecef',
  Ongoing: '#4A90D9',
}

const BAR_STROKE: Record<BarStyle, string> = {
  Active: '#1e7e34',
  Planned: '#ffc107',
  Assessment: '#adb5bd',
  Ongoing: '#2171b5',
}

export default function PeriodBar({ barStyle, startCol, endCol, rowHeight, colWidth }: Props) {
  const x = startCol * colWidth + 2
  const width = (endCol - startCol + 1) * colWidth - 4
  const y = (rowHeight - 20) / 2
  const height = 20

  const fill = BAR_FILL[barStyle]
  const stroke = BAR_STROKE[barStyle]
  const isDashed = barStyle === 'Planned'

  return (
    <rect
      x={x}
      y={y}
      width={Math.max(width, 0)}
      height={height}
      rx={4}
      ry={4}
      fill={fill}
      stroke={stroke}
      strokeWidth={1.5}
      strokeDasharray={isDashed ? '5,3' : undefined}
    />
  )
}
