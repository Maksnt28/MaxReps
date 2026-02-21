import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { useProgressStats } from '@/hooks/useProgressStats'
import { formatVolume } from '@/lib/formulas'
import { colors, semantic, spacing } from '@/lib/theme'

function DeltaBadge({ delta }: { delta: number | null }) {
  const { t } = useTranslation()

  if (delta == null) return null

  const isPositive = delta > 0
  const isNegative = delta < 0
  const color = isPositive ? semantic.progress : isNegative ? semantic.regression : colors.gray7

  return (
    <AppText preset="caption" style={{ color, fontSize: 11 }}>
      {isPositive
        ? t('progress.delta.up', { value: delta })
        : isNegative
          ? t('progress.delta.down', { value: delta })
          : t('progress.delta.noChange')}
    </AppText>
  )
}

function StatCard({
  icon,
  label,
  value,
  delta,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  value: string
  delta: number | null
}) {
  return (
    <AppCard compact style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={14} color={colors.gray7} />
        <AppText preset="caption" style={{ color: colors.gray7, fontSize: 11 }}>
          {label}
        </AppText>
      </View>
      <AppText preset="pageTitle" style={{ color: colors.gray12, fontSize: 22 }}>
        {value}
      </AppText>
      <DeltaBadge delta={delta} />
    </AppCard>
  )
}

export function StatCards({ range }: { range: string }) {
  const { t, i18n } = useTranslation()
  const { data: stats, isLoading, isError, refetch } = useProgressStats(range)
  const locale = i18n.language

  if (isError) {
    return (
      <AppCard onPress={() => refetch()}>
        <AppText preset="caption" style={{ color: colors.gray7, textAlign: 'center' }}>
          {t('progress.retry')}
        </AppText>
      </AppCard>
    )
  }

  if (isLoading || !stats) {
    return (
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <AppCard key={i} compact style={styles.card}>
            <View style={{ height: 60 }} />
          </AppCard>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.grid}>
      <StatCard
        icon="barbell-outline"
        label={t('progress.stats.workouts')}
        value={String(stats.workouts)}
        delta={stats.workoutsDelta}
      />
      <StatCard
        icon="trending-up-outline"
        label={t('progress.stats.volume')}
        value={formatVolume(stats.totalVolume, locale)}
        delta={stats.volumeDelta}
      />
      <StatCard
        icon="trophy-outline"
        label={t('progress.stats.prs')}
        value={String(stats.prCount)}
        delta={null}
      />
      <StatCard
        icon="time-outline"
        label={t('progress.stats.avgDuration')}
        value={t('progress.minutes', { value: stats.avgDuration })}
        delta={stats.durationDelta}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.cardGap,
  },
  card: {
    width: '48.5%' as any,
    flexGrow: 1,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})
