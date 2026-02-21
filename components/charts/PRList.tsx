import { View, StyleSheet } from 'react-native'
import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { ChartCard } from './ChartCard'
import { AppText } from '@/components/ui/AppText'
import { usePersonalRecords } from '@/hooks/usePersonalRecords'
import { colors, semantic, spacing } from '@/lib/theme'

function PRItem({
  exerciseName,
  weightKg,
  reps,
  date,
}: {
  exerciseName: string
  weightKg: number
  reps: number
  date: string
}) {
  return (
    <XStack
      alignItems="center"
      gap={10}
      paddingVertical={8}
      accessibilityLabel={`${exerciseName} ${weightKg} kg × ${reps}`}
    >
      {/* Gold left accent */}
      <View style={styles.goldBar} />

      <Ionicons name="trophy" size={16} color={semantic.pr} />

      <YStack flex={1} gap={2}>
        <AppText preset="body" style={{ color: colors.gray11, fontSize: 14 }}>
          {exerciseName}
        </AppText>
        <AppText preset="caption" style={{ color: colors.gray7, fontSize: 11 }}>
          {weightKg} kg × {reps} · {formatDate(date)}
        </AppText>
      </YStack>
    </XStack>
  )
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function PRList() {
  const { t } = useTranslation()
  const { data: records, isLoading, isError, refetch } = usePersonalRecords()

  return (
    <ChartCard
      title={t('progress.records.title')}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    >
      {!records || records.length === 0 ? (
        <YStack alignItems="center" paddingVertical={16}>
          <AppText preset="caption" style={{ color: colors.gray6 }}>
            {t('progress.records.empty')}
          </AppText>
        </YStack>
      ) : (
        <YStack>
          {records.map((pr) => (
            <PRItem
              key={`${pr.exerciseId}-${pr.date}`}
              exerciseName={pr.exerciseName}
              weightKg={pr.weightKg}
              reps={pr.reps}
              date={pr.date}
            />
          ))}
        </YStack>
      )}
    </ChartCard>
  )
}

const styles = StyleSheet.create({
  goldBar: {
    width: 3,
    height: 32,
    borderRadius: 1.5,
    backgroundColor: semantic.pr,
  },
})
