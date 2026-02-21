import { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { ChartCard } from './ChartCard'
import { AppText } from '@/components/ui/AppText'
import { useWorkoutFrequency } from '@/hooks/useWorkoutFrequency'
import { colors, accent, radii } from '@/lib/theme'

const CELL_SIZE = 14
const CELL_GAP = 3
const ROWS = 7 // Mon–Sun (ISO 8601: Mon=row 0, Sun=row 6)
const TOTAL_DAYS = 60

// Heatmap legend:
// Each cell = one day. Color intensity = number of workouts that day.
//   gray4 (dim)         → 0 workouts
//   accent blue 30%     → 1 workout
//   accent blue 60%     → 2 workouts
//   accent blue 100%    → 3+ workouts
// Bottom legend: "Less ▪▪▪▪ More" shows the 4-level color scale.

const DAY_LABELS_EN = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_LABELS_FR = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function getCellColor(count: number): string {
  if (count === 0) return colors.gray4
  if (count === 1) return 'rgba(59,130,246,0.3)'
  if (count === 2) return 'rgba(59,130,246,0.6)'
  return accent.accent
}

type GridCell = { date: string; count: number; row: number; col: number }

function buildGrid(data: Map<string, number>): { cells: GridCell[]; cols: number; monthLabels: { label: string; col: number }[] } {
  const today = new Date()
  const cells: GridCell[] = []
  const monthLabels: { label: string; col: number }[] = []
  const seenMonths = new Set<string>()

  // Find the Monday at or before (today - TOTAL_DAYS)
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - TOTAL_DAYS)
  // Shift back to Monday
  const dayOfWeek = startDate.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  startDate.setDate(startDate.getDate() + diff)

  let maxCol = 0
  const cursor = new Date(startDate)

  while (cursor <= today) {
    const dateStr = cursor.toISOString().split('T')[0]
    const dow = cursor.getDay()
    const row = dow === 0 ? 6 : dow - 1 // Mon=0, Sun=6
    const daysSinceStart = Math.floor((cursor.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const col = Math.floor(daysSinceStart / 7)

    cells.push({
      date: dateStr,
      count: data.get(dateStr) ?? 0,
      row,
      col,
    })

    // Month labels
    const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`
    if (!seenMonths.has(monthKey) && row === 0) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      seenMonths.add(monthKey)
      monthLabels.push({ label: monthNames[cursor.getMonth()], col })
    }

    if (col > maxCol) maxCol = col

    cursor.setDate(cursor.getDate() + 1)
  }

  return { cells, cols: maxCol + 1, monthLabels }
}

export function FrequencyHeatmap() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { data, isLoading, isError, refetch } = useWorkoutFrequency()

  const dataMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const d of data ?? []) {
      map.set(d.date, d.count)
    }
    return map
  }, [data])

  const { cells, cols, monthLabels } = useMemo(() => buildGrid(dataMap), [dataMap])

  const dayLabels = locale === 'fr' ? DAY_LABELS_FR : DAY_LABELS_EN
  const gridWidth = cols * (CELL_SIZE + CELL_GAP) + 20 // 20 for day labels

  return (
    <ChartCard
      title={t('progress.frequency.title')}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      {/* Month labels */}
      <View style={[styles.monthRow, { paddingLeft: 20 }]}>
        {monthLabels.map((m, i) => (
          <AppText
            key={`${m.label}-${i}`}
            preset="caption"
            style={[
              styles.monthLabel,
              { left: 20 + m.col * (CELL_SIZE + CELL_GAP) },
            ]}
          >
            {m.label}
          </AppText>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {/* Day labels */}
        <View style={styles.dayLabels}>
          {dayLabels.map((label, i) => (
            <AppText
              key={i}
              preset="caption"
              style={[styles.dayLabel, { height: CELL_SIZE, lineHeight: CELL_SIZE }]}
            >
              {i % 2 === 0 ? label : ''}
            </AppText>
          ))}
        </View>

        {/* Cells */}
        <View style={[styles.grid, { width: cols * (CELL_SIZE + CELL_GAP) }]}>
          {cells.map((cell) => (
            <View
              key={cell.date}
              accessibilityLabel={`${cell.date}: ${cell.count} ${t('progress.stats.workouts').toLowerCase()}`}
              style={[
                styles.cell,
                {
                  backgroundColor: getCellColor(cell.count),
                  left: cell.col * (CELL_SIZE + CELL_GAP),
                  top: cell.row * (CELL_SIZE + CELL_GAP),
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <AppText preset="caption" style={styles.legendText}>
          {t('progress.heatmap.less')}
        </AppText>
        {[0, 1, 2, 3].map((level) => (
          <View
            key={level}
            style={[styles.legendCell, { backgroundColor: getCellColor(level) }]}
          />
        ))}
        <AppText preset="caption" style={styles.legendText}>
          {t('progress.heatmap.more')}
        </AppText>
      </View>
    </ChartCard>
  )
}

const styles = StyleSheet.create({
  monthRow: {
    flexDirection: 'row',
    height: 16,
    position: 'relative',
    marginBottom: 2,
  },
  monthLabel: {
    position: 'absolute',
    color: colors.gray7,
    fontSize: 10,
  },
  gridContainer: {
    flexDirection: 'row',
  },
  dayLabels: {
    width: 18,
    gap: CELL_GAP,
    marginRight: 2,
  },
  dayLabel: {
    color: colors.gray7,
    fontSize: 9,
    textAlign: 'right',
  },
  grid: {
    position: 'relative',
    height: ROWS * (CELL_SIZE + CELL_GAP),
  },
  cell: {
    position: 'absolute',
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 8,
  },
  legendCell: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    color: colors.gray7,
    fontSize: 9,
  },
})
