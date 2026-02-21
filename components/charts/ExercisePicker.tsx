import { useEffect } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import { AppText } from '@/components/ui/AppText'
import { useRecentExercises } from '@/hooks/useRecentExercises'
import { colors, accent, radii } from '@/lib/theme'

interface ExercisePickerProps {
  selectedId: string | null
  onSelect: (exerciseId: string) => void
}

export function ExercisePicker({ selectedId, onSelect }: ExercisePickerProps) {
  const { t } = useTranslation()
  const { data: exercises } = useRecentExercises()

  // Auto-select first exercise on mount
  useEffect(() => {
    if (!selectedId && exercises && exercises.length > 0) {
      onSelect(exercises[0].exerciseId)
    }
  }, [exercises, selectedId, onSelect])

  if (!exercises || exercises.length === 0) return null

  return (
    <FlatList
      horizontal
      data={exercises}
      keyExtractor={(item) => item.exerciseId}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isSelected = item.exerciseId === selectedId
        return (
          <Pressable
            onPress={() => onSelect(item.exerciseId)}
            accessibilityLabel={`${t('progress.exercisePicker.label')}: ${item.name}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[styles.pill, isSelected && styles.pillSelected]}
          >
            <AppText
              preset="caption"
              style={[styles.pillText, isSelected && styles.pillTextSelected]}
              numberOfLines={1}
            >
              {item.name}
            </AppText>
          </Pressable>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
    paddingBottom: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.button,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillSelected: {
    backgroundColor: accent.accent,
  },
  pillText: {
    color: colors.gray7,
    fontSize: 12,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
})
