import { useCallback, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LineChart } from 'react-native-gifted-charts'

import { ChartCard } from './ChartCard'
import { ExercisePicker } from './ExercisePicker'
import { AppText } from '@/components/ui/AppText'
import { useStrengthProgression } from '@/hooks/useStrengthProgression'
import { niceAxisScale } from '@/lib/chartTransforms'
import { colors, accent } from '@/lib/theme'

export function StrengthChart({ range }: { range: string }) {
  const { t } = useTranslation()
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const { data, isLoading, isError, refetch } = useStrengthProgression(exerciseId, range)

  const handleSelect = useCallback((id: string) => {
    setExerciseId(id)
  }, [])

  const chartData = (data ?? []).map((d, i) => ({
    value: d.estimatedMax1RM,
    label: i === 0 || i === (data?.length ?? 1) - 1
      ? formatDateLabel(d.date)
      : '',
  }))

  const hasData = chartData.length > 0
  const dataMax = Math.max(...chartData.map((d) => d.value), 0)
  const { maxValue, noOfSections } = niceAxisScale(dataMax)

  return (
    <ChartCard
      title={t('progress.strength.title')}
      isLoading={isLoading && !!exerciseId}
      isError={isError}
      onRetry={refetch}
    >
      <ExercisePicker selectedId={exerciseId} onSelect={handleSelect} />

      {!exerciseId ? (
        <View style={styles.empty}>
          <AppText preset="caption" style={{ color: colors.gray6 }}>
            {t('progress.exercisePicker.label')}
          </AppText>
        </View>
      ) : !hasData ? (
        <View style={styles.empty}>
          <AppText preset="caption" style={{ color: colors.gray6 }}>
            {t('progress.empty.message')}
          </AppText>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            curved
            height={160}
            width={280}
            spacing={Math.max(280 / chartData.length, 8)}
            adjustToWidth
            hideDataPoints={chartData.length > 20}
            dataPointsColor={accent.accent}
            dataPointsRadius={3}
            color={accent.accent}
            thickness={2}
            yAxisColor="transparent"
            xAxisColor={colors.gray4}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            yAxisTextNumberOfLines={1}
            hideRules
            maxValue={maxValue}
            noOfSections={noOfSections}
            pointerConfig={{
              pointerStripColor: colors.gray4,
              pointerStripWidth: 1,
              pointerColor: accent.accent,
              radius: 5,
              pointerLabelWidth: 120,
              pointerLabelHeight: 40,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items: { value: number }[]) => {
                const val = items[0]?.value ?? 0
                return (
                  <View style={styles.tooltip}>
                    <AppText preset="caption" style={styles.tooltipText}>
                      {val} kg · {t('progress.est1rm')}
                    </AppText>
                  </View>
                )
              },
            }}
          />
        </View>
      )}
    </ChartCard>
  )
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

const styles = StyleSheet.create({
  chartContainer: {
    marginLeft: -10,
    overflow: 'hidden',
  },
  empty: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  axisText: {
    color: colors.gray7,
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
  tooltip: {
    backgroundColor: colors.gray3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.gray4,
  },
  tooltipText: {
    color: colors.gray11,
    fontSize: 11,
  },
})
