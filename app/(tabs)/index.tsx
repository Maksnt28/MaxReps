import { useState } from 'react'
import { ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { Divider } from '@/components/ui/Divider'
import { colors, spacing, radii, accent } from '@/lib/theme'
import { NextWorkoutCard } from '@/components/home/NextWorkoutCard'
import { WeeklyProgressCard } from '@/components/home/WeeklyProgressCard'
import { StreakCard } from '@/components/home/StreakCard'
import { StatCards } from '@/components/charts/StatCards'
import { VolumeChart } from '@/components/charts/VolumeChart'
import { StrengthChart } from '@/components/charts/StrengthChart'
import { FrequencyHeatmap } from '@/components/charts/FrequencyHeatmap'
import { PRList } from '@/components/charts/PRList'
import { useProgressStats } from '@/hooks/useProgressStats'

const TIME_RANGES = ['1W', '1M', '3M', '6M', '1Y'] as const
type TimeRange = (typeof TIME_RANGES)[number]

function TimeRangePill({
  range,
  selected,
  onPress,
}: {
  range: TimeRange
  selected: boolean
  onPress: () => void
}) {
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={t(`progress.timeRange.${range}`)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.pill,
        selected && styles.pillSelected,
      ]}
    >
      <AppText
        preset="caption"
        style={[
          styles.pillText,
          selected && styles.pillTextSelected,
        ]}
      >
        {t(`progress.timeRange.${range}`)}
      </AppText>
    </Pressable>
  )
}

export default function HomeScreen() {
  const { t } = useTranslation()
  const [range, setRange] = useState<TimeRange>('1M')
  const { data: stats } = useProgressStats(range)

  const hasData = stats && stats.workouts > 0

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      {/* Custom header */}
      <YStack
        paddingHorizontal={spacing.screenPaddingH}
        paddingTop={spacing.screenPaddingV}
        paddingBottom={8}
      >
        <AppText preset="pageTitle" style={{ color: colors.gray12 }}>
          {t('progress.title')}
        </AppText>
      </YStack>

      {/* Time range pills */}
      <XStack
        paddingHorizontal={spacing.screenPaddingH}
        paddingBottom={12}
        gap={6}
      >
        {TIME_RANGES.map((r) => (
          <TimeRangePill
            key={r}
            range={r}
            selected={r === range}
            onPress={() => setRange(r)}
          />
        ))}
      </XStack>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPaddingH,
          paddingBottom: 100,
          gap: spacing.sectionGap,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Action cards */}
        <NextWorkoutCard />
        <WeeklyProgressCard />
        <StreakCard />

        <Divider variant="neutral" />

        {/* Charts section */}
        {!hasData && stats !== undefined ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            paddingTop={80}
            gap={8}
          >
            <AppText preset="body" style={{ color: colors.gray7, textAlign: 'center' }}>
              {t('progress.empty.title')}
            </AppText>
            <AppText preset="caption" style={{ color: colors.gray6, textAlign: 'center' }}>
              {t('progress.empty.message')}
            </AppText>
          </YStack>
        ) : (
          <>
            <StatCards range={range} />
            <VolumeChart range={range} />
            <StrengthChart range={range} />
            <FrequencyHeatmap />
            <PRList />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.button,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillSelected: {
    backgroundColor: accent.accent,
  },
  pillText: {
    color: colors.gray7,
    fontSize: 13,
    fontFamily: 'Inter-Medium',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
})
