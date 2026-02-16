import { useState } from 'react'
import { YStack, Text, Input, Button } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'

import { useCreateProgram } from '@/hooks/usePrograms'

export default function CreateProgramScreen() {
  const { t } = useTranslation()
  const router = useRouter()
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
    <YStack flex={1} backgroundColor="$background" padding="$4" gap="$4">
      <Text color="$color" fontSize={24} fontWeight="700">
        {t('programs.create')}
      </Text>

      <YStack gap="$2">
        <Text color="$gray10" fontSize={14}>
          {t('programs.name')}
        </Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder={t('programs.namePlaceholder')}
          autoFocus
          maxLength={100}
          accessibilityLabel={t('programs.name')}
        />
      </YStack>

      <Button
        backgroundColor="$color"
        onPress={handleCreate}
        disabled={!isValid || createProgram.isPending}
        opacity={!isValid || createProgram.isPending ? 0.5 : 1}
        accessibilityLabel={t('programs.create')}
      >
        <Text color="$background" fontWeight="600">
          {t('programs.create')}
        </Text>
      </Button>
    </YStack>
  )
}
