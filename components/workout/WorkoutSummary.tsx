import { YStack, XStack, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

interface WorkoutSummaryProps {
  durationSeconds: number
  exerciseCount: number
  setsCount: number
  totalVolumeKg: number
  onDone: () => void
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text color="$gray10" fontSize={15}>{label}</Text>
      <Text color="$color" fontSize={17} fontWeight="600">{value}</Text>
    </XStack>
  )
}

export function WorkoutSummary({
  durationSeconds,
  exerciseCount,
  setsCount,
  totalVolumeKg,
  onDone,
}: WorkoutSummaryProps) {
  const { t } = useTranslation()

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" padding="$4" gap="$6">
      <YStack alignItems="center" gap="$3">
        <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
        <Text color="$color" fontSize={24} fontWeight="700">
          {t('workout.summary.title')}
        </Text>
      </YStack>

      <YStack width="100%" maxWidth={300} gap="$3">
        <SummaryRow label={t('workout.summary.duration')} value={formatDuration(durationSeconds)} />
        <SummaryRow label={t('workout.summary.exercises')} value={String(exerciseCount)} />
        <SummaryRow label={t('workout.summary.sets')} value={String(setsCount)} />
        <SummaryRow
          label={t('workout.summary.totalVolume')}
          value={`${Math.round(totalVolumeKg).toLocaleString()} kg`}
        />
      </YStack>

      <Button
        size="$5"
        backgroundColor="$color"
        onPress={onDone}
        accessibilityLabel={t('workout.summary.done')}
        width="100%"
        maxWidth={300}
      >
        <Text color="$background" fontSize={17} fontWeight="700">
          {t('workout.summary.done')}
        </Text>
      </Button>
    </YStack>
  )
}
