import { YStack, XStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { AppCard } from '@/components/ui/AppCard'
import { Divider } from '@/components/ui/Divider'
import { colors } from '@/lib/theme'
import { formatDuration } from '@/lib/timerUtils'
import type { PRSummaryItem } from '@/lib/types'

interface WorkoutSummaryProps {
  durationSeconds: number
  exerciseCount: number
  setsCount: number
  totalVolumeKg: number
  prs: PRSummaryItem[]
  onDone: () => void
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical={4}>
      <AppText preset="caption" color={colors.gray8}>{label}</AppText>
      <AppText preset="exerciseName">{value}</AppText>
    </XStack>
  )
}

export function WorkoutSummary({
  durationSeconds,
  exerciseCount,
  setsCount,
  totalVolumeKg,
  prs,
  onDone,
}: WorkoutSummaryProps) {
  const { t } = useTranslation()

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.gray1} padding={20} gap={24}>
      <YStack alignItems="center" gap={12}>
        <Ionicons name="checkmark-circle" size={64} color={colors.gray11} />
        <AppText preset="pageTitle">
          {t('workout.summary.title')}
        </AppText>
      </YStack>

      <AppCard style={{ width: '100%', maxWidth: 300 }}>
        <SummaryRow label={t('workout.summary.duration')} value={formatDuration(durationSeconds)} />
        <Divider />
        <SummaryRow label={t('workout.summary.exercises')} value={String(exerciseCount)} />
        <Divider />
        <SummaryRow label={t('workout.summary.sets')} value={String(setsCount)} />
        <Divider />
        <SummaryRow
          label={t('workout.summary.totalVolume')}
          value={`${Math.round(totalVolumeKg).toLocaleString()} kg`}
        />
      </AppCard>

      {/* Personal Records section */}
      {prs.length > 0 && (
        <AppCard style={{ width: '100%', maxWidth: 300 }}>
          <XStack alignItems="center" gap={6} marginBottom={8}>
            <Ionicons name="trophy" size={16} color={colors.pr} />
            <AppText fontSize={13} fontWeight="700" color={colors.pr}>
              {t('workout.prSummaryTitle')}
            </AppText>
          </XStack>
          {prs.map((pr, i) => (
            <YStack key={pr.exerciseName}>
              {i > 0 && <Divider />}
              <XStack justifyContent="space-between" alignItems="center" paddingVertical={4}>
                <YStack>
                  <AppText preset="caption" color={colors.gray8}>{pr.exerciseName}</AppText>
                  <AppText preset="exerciseName">{pr.weight} kg</AppText>
                </YStack>
                <AppText fontSize={12} fontWeight="600" color={colors.progress}>
                  {pr.previousMax === 0
                    ? t('workout.prFirst')
                    : t('workout.prDelta', { delta: pr.delta })}
                </AppText>
              </XStack>
            </YStack>
          ))}
        </AppCard>
      )}

      <AppButton
        variant="primary"
        onPress={onDone}
        fullWidth
        accessibilityLabel={t('workout.summary.done')}
      >
        {t('workout.summary.done')}
      </AppButton>
    </YStack>
  )
}
