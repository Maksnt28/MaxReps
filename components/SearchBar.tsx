import { Input, XStack } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      backgroundColor="$backgroundHover"
      borderRadius="$4"
      paddingHorizontal="$3"
      marginHorizontal="$3"
      marginVertical="$2"
      gap="$2"
    >
      <Ionicons name="search-outline" size={20} color="#888" />
      <Input
        flex={1}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('exercises.searchPlaceholder')}
        placeholderTextColor="$gray10"
        backgroundColor="transparent"
        borderWidth={0}
        color="$color"
        fontSize={16}
        paddingVertical="$2"
        accessibilityLabel={t('exercises.searchPlaceholder')}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityLabel={t('exercises.clearFilters')}
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={20} color="#888" />
        </Pressable>
      )}
    </XStack>
  )
}
