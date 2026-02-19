import { useMemo } from 'react'
import { FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, XStack, Spinner } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import { usePrograms } from '@/hooks/usePrograms'
import { ProgramCard, PROGRAM_CARD_HEIGHT } from '@/components/program/ProgramCard'
import { EmptyState } from '@/components/EmptyState'
import { AppCard } from '@/components/ui/AppCard'
import { AppText } from '@/components/ui/AppText'
import { Badge } from '@/components/ui/Badge'
import { AppButton } from '@/components/ui/AppButton'
import { colors } from '@/lib/theme'

export default function ProgramsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: programs, isLoading, error, refetch } = usePrograms()

  const programList = useMemo(() => programs ?? [], [programs])

  const activeProgram = useMemo(
    () => programList.find((p) => p.is_active) ?? null,
    [programList],
  )

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color={colors.gray11} />
        </YStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap={12}>
          <AppText preset="body">{t('common.error')}</AppText>
          <AppButton variant="secondary" onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
            {t('common.retry')}
          </AppButton>
        </YStack>
      </SafeAreaView>
    )
  }

  if (programList.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
        <YStack flex={1} backgroundColor={colors.gray1}>
          <EmptyState
            title={t('programs.emptyTitle')}
            message={t('programs.emptyMessage')}
            onAction={() => router.push('/program/create')}
            actionLabel={t('programs.create')}
          />
        </YStack>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <YStack flex={1} backgroundColor={colors.gray1}>
        <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={12}>
          <AppText fontSize={28} fontWeight="800" color={colors.gray12} marginBottom={12}>
            {t('tabs.programs')}
          </AppText>
          <AppCard>
            <XStack justifyContent="space-between" alignItems="center">
              <YStack gap={4}>
                <AppText preset="exerciseName" color={colors.gray11}>
                  {t('programs.programCount', { count: programList.length })}
                </AppText>
                {activeProgram ? (
                  <XStack alignItems="center" gap={6}>
                    <Badge variant="active">{t('programs.active')}</Badge>
                    <AppText preset="caption" color={colors.gray8} numberOfLines={1} flex={1}>
                      {activeProgram.name}
                    </AppText>
                  </XStack>
                ) : (
                  <AppText preset="caption" color={colors.gray8}>
                    {t('programs.dayCount', { count: programList.reduce((sum, p) => sum + (p.program_days?.length ?? 0), 0) })}
                  </AppText>
                )}
              </YStack>
              <Ionicons name="calendar-outline" size={28} color={colors.accent} />
            </XStack>
          </AppCard>
        </YStack>
        <FlatList
          style={{ flex: 1 }}
          data={programList}
          keyExtractor={(item) => item.id}
          getItemLayout={(_, index) => ({
            length: PROGRAM_CARD_HEIGHT,
            offset: PROGRAM_CARD_HEIGHT * index,
            index,
          })}
          renderItem={({ item }) => (
            <ProgramCard
              program={item}
              onPress={() => router.push(`/program/${item.id}`)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={() => refetch()}
              tintColor={colors.gray11}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingBottom: 100 }}
        />

        {/* FAB */}
        <Pressable
          onPress={() => router.push('/program/create')}
          accessibilityLabel={t('programs.create')}
          style={styles.fab}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </YStack>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
})
