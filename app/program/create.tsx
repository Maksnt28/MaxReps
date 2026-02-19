import { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'

import { useCreateProgram } from '@/hooks/usePrograms'
import { AppText } from '@/components/ui/AppText'
import { AppInput } from '@/components/ui/AppInput'
import { AppButton } from '@/components/ui/AppButton'
import { colors, headerButtonStyles, headerButtonIcon } from '@/lib/theme'

export default function CreateProgramScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const createProgram = useCreateProgram()

  const [name, setName] = useState('')
  const trimmedName = name.trim()
  const isValid = trimmedName.length >= 1 && trimmedName.length <= 100

  async function handleCreate() {
    if (!isValid) return
    const data = await createProgram.mutateAsync({ name: trimmedName })
    router.replace(`/program/${data.id}`)
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel={t('common.goBack')}
          hitSlop={8}
          style={headerButtonStyles.navButton}
        >
          <Ionicons name="chevron-back" size={headerButtonIcon.size} color={headerButtonIcon.color} />
        </TouchableOpacity>
      </View>

      <YStack flex={1} padding={16} gap={16}>
        <AppText preset="pageTitle">
          {t('programs.create')}
        </AppText>

        <AppInput
          label={t('programs.name')}
          value={name}
          onChangeText={setName}
          placeholder={t('programs.namePlaceholder')}
          autoFocus
          maxLength={100}
          accessibilityLabel={t('programs.name')}
        />

        <AppButton
          variant="primary"
          onPress={handleCreate}
          disabled={!isValid || createProgram.isPending}
          loading={createProgram.isPending}
          accessibilityLabel={t('programs.create')}
        >
          {t('programs.create')}
        </AppButton>
      </YStack>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
})
