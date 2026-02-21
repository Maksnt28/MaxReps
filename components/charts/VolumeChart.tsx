import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { LineChart } from 'react-native-gifted-charts'

import { ChartCard } from './ChartCard'
import { AppText } from '@/components/ui/AppText'
import { useVolumeProgression } from '@/hooks/useVolumeProgression'
import { formatVolume } from '@/lib/formulas'
import { colors, accent } from '@/lib/theme'

export function VolumeChart({ range }: { range: string }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language
  const { data, isLoading, isError, refetch } = useVolumeProgression(range)

  const chartData = (data ?? []).map((d, i) => ({
    value: d.totalVolume,
    label: i === 0 || i === (data?.length ?? 1) - 1
      ? formatDateLabel(d.date)
      : '',
    dataPointText: '',
  }))

  const hasData = chartData.length > 0

  return (
    <ChartCard
      title={t('progress.volume.title')}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      {!hasData ? (
        <View style={styles.empty}>
          <AppText preset="caption" style={{ color: colors.gray6 }}>
            {t('progress.empty.message')}
          </AppText>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            areaChart
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
            startFillColor="rgba(59,130,246,0.2)"
            endFillColor="rgba(59,130,246,0)"
            startOpacity={0.2}
            endOpacity={0}
            yAxisColor="transparent"
            xAxisColor={colors.gray4}
            yAxisTextStyle={styles.axisText}
            xAxisLabelTextStyle={styles.axisText}
            hideRules
            noOfSections={4}
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
                      {formatVolume(val, locale)}
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
    height: 100,
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
