import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet } from 'react-native'
import { XStack, YStack, Sheet } from 'tamagui'
import { useTranslation } from 'react-i18next'
import Ionicons from '@expo/vector-icons/Ionicons'

import { AppText } from '@/components/ui/AppText'
import { colors, radii } from '@/lib/theme'
import { hapticLight } from '@/lib/animations'

interface FilterButtonsProps {
  muscleGroup: string | null
  equipment: string | null
  onSelectMuscle: (value: string | null) => void
  onSelectEquipment: (value: string | null) => void
  muscleOptions: string[]
  equipmentOptions: string[]
  muscleLabelKey: (value: string) => string
  equipmentLabelKey: (value: string) => string
}

type SheetType = 'muscle' | 'equipment' | null

export function FilterButtons({
  muscleGroup,
  equipment,
  onSelectMuscle,
  onSelectEquipment,
  muscleOptions,
  equipmentOptions,
  muscleLabelKey,
  equipmentLabelKey,
}: FilterButtonsProps) {
  const { t } = useTranslation()
  const [sheetType, setSheetType] = useState<SheetType>(null)

  const muscleLabel = muscleGroup ? muscleLabelKey(muscleGroup) : t('exercises.allMuscles')
  const equipmentLabel = equipment ? equipmentLabelKey(equipment) : t('exercises.allEquipment')

  function handleSelect(value: string | null) {
    hapticLight()
    if (sheetType === 'muscle') {
      onSelectMuscle(value)
    } else if (sheetType === 'equipment') {
      onSelectEquipment(value)
    }
    setSheetType(null)
  }

  const activeOptions = sheetType === 'muscle' ? muscleOptions : equipmentOptions
  const activeLabelKey = sheetType === 'muscle' ? muscleLabelKey : equipmentLabelKey
  const activeValue = sheetType === 'muscle' ? muscleGroup : equipment
  const allLabel = sheetType === 'muscle' ? t('exercises.allMuscles') : t('exercises.allEquipment')

  return (
    <>
      <XStack gap={8} paddingHorizontal={12} paddingVertical={8}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            muscleGroup && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => { hapticLight(); setSheetType('muscle') }}
          accessibilityLabel={t('exercises.filterMuscle')}
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={16} color={muscleGroup ? colors.accent : colors.gray7} />
          <AppText
            preset="caption"
            color={muscleGroup ? colors.accent : colors.gray8}
            numberOfLines={1}
            flex={1}
          >
            {muscleLabel}
          </AppText>
          <Ionicons name="chevron-down" size={14} color={muscleGroup ? colors.accent : colors.gray7} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            equipment && styles.buttonActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => { hapticLight(); setSheetType('equipment') }}
          accessibilityLabel={t('exercises.filterEquipment')}
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={16} color={equipment ? colors.accent : colors.gray7} />
          <AppText
            preset="caption"
            color={equipment ? colors.accent : colors.gray8}
            numberOfLines={1}
            flex={1}
          >
            {equipmentLabel}
          </AppText>
          <Ionicons name="chevron-down" size={14} color={equipment ? colors.accent : colors.gray7} />
        </Pressable>
      </XStack>

      <Sheet
        modal
        open={sheetType !== null}
        onOpenChange={(open: boolean) => { if (!open) setSheetType(null) }}
        snapPointsMode="fit"
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame backgroundColor={colors.gray2} borderTopLeftRadius={radii.lg} borderTopRightRadius={radii.lg}>
          <YStack padding={16} gap={4}>
            <AppText preset="exerciseName" color={colors.gray11} marginBottom={8}>
              {sheetType === 'muscle' ? t('exercises.filterMuscle') : t('exercises.filterEquipment')}
            </AppText>
            <ScrollView style={{ maxHeight: 400 }}>
              {/* "All" option */}
              <Pressable
                onPress={() => handleSelect(null)}
                style={styles.sheetRow}
                accessibilityRole="radio"
                accessibilityState={{ selected: activeValue === null }}
              >
                <AppText preset="body" color={activeValue === null ? colors.accent : colors.gray11}>
                  {allLabel}
                </AppText>
                {activeValue === null && (
                  <Ionicons name="checkmark" size={20} color={colors.accent} />
                )}
              </Pressable>

              {activeOptions.map((option) => {
                const isSelected = activeValue === option
                return (
                  <Pressable
                    key={option}
                    onPress={() => handleSelect(option)}
                    style={styles.sheetRow}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <AppText preset="body" color={isSelected ? colors.accent : colors.gray11}>
                      {activeLabelKey(option)}
                    </AppText>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={colors.accent} />
                    )}
                  </Pressable>
                )
              })}
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gray3,
    borderRadius: radii.button,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  buttonActive: {
    borderColor: colors.accent,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
})
