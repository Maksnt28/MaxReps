import { FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { YStack, Spinner, Text, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'

import { usePrograms } from '@/hooks/usePrograms'
import { ProgramCard, PROGRAM_CARD_HEIGHT } from '@/components/program/ProgramCard'
import { EmptyState } from '@/components/EmptyState'

export default function ProgramsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: programs, isLoading, error, refetch } = usePrograms()

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" color="$color" />
        </YStack>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$3">
          <Text color="$color" fontSize={16}>
            {t('common.error')}
          </Text>
          <Button onPress={() => refetch()} accessibilityLabel={t('common.retry')}>
            {t('common.retry')}
          </Button>
        </YStack>
      </SafeAreaView>
    )
  }

  const programList = programs ?? []

  if (programList.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
        <YStack flex={1} backgroundColor="$background">
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
      <YStack flex={1} backgroundColor="$background">
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
              tintColor="#fff"
            />
          }
        />

        <Button
          position="absolute"
          bottom={24}
          right={24}
          width={56}
          height={56}
          borderRadius={28}
          backgroundColor="$color"
          onPress={() => router.push('/program/create')}
          accessibilityLabel={t('programs.create')}
          pressStyle={{ opacity: 0.8 }}
          elevation={4}
        >
          <Ionicons name="add" size={28} color="#000" />
        </Button>
      </YStack>
    </SafeAreaView>
  )
}
