import { ScrollView } from 'react-native'
import { Button, XStack } from 'tamagui'

interface FilterChipsProps {
  options: string[]
  selected: string | null
  onSelect: (value: string | null) => void
  labelKey: (value: string) => string
}

export function FilterChips({
  options,
  selected,
  onSelect,
  labelKey,
}: FilterChipsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <XStack gap="$2" paddingHorizontal="$3" paddingVertical="$1.5">
        {options.map((option) => {
          const isSelected = selected === option
          return (
            <Button
              key={option}
              size="$3"
              borderRadius="$10"
              backgroundColor={isSelected ? '$color' : 'transparent'}
              borderWidth={1}
              borderColor={isSelected ? '$color' : '$borderColor'}
              onPress={() => onSelect(isSelected ? null : option)}
              accessibilityLabel={labelKey(option)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              pressStyle={{
                opacity: 0.7,
              }}
            >
              <Button.Text
                color={isSelected ? '$background' : '$color'}
              >
                {labelKey(option)}
              </Button.Text>
            </Button>
          )
        })}
      </XStack>
    </ScrollView>
  )
}
