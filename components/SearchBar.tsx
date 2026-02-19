import { Input, XStack } from 'tamagui'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Pressable } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, radii } from '@/lib/theme'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
}

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <XStack
      alignItems="center"
      backgroundColor={colors.gray3}
      borderRadius={radii.button}
      paddingHorizontal={12}
      marginHorizontal={12}
      marginVertical={8}
      gap={8}
    >
      <Ionicons name="search-outline" size={20} color={colors.accent} />
      <Input
        flex={1}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('exercises.searchPlaceholder')}
        placeholderTextColor={colors.gray7 as any}
        backgroundColor="transparent"
        borderWidth={0}
        color={colors.gray11}
        fontSize={16}
        fontFamily={'Inter-Regular' as any}
        paddingVertical={10}
        accessibilityLabel={t('exercises.searchPlaceholder')}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityLabel={t('exercises.clearFilters')}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={20} color={colors.gray6} />
        </Pressable>
      )}
    </XStack>
  )
}
