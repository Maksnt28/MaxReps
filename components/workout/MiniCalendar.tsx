import { Pressable, View, StyleSheet } from 'react-native'
import { XStack, YStack } from 'tamagui'

import { AppText } from '@/components/ui/AppText'
import { AppCard } from '@/components/ui/AppCard'
import { colors, semantic } from '@/lib/theme'

interface MiniCalendarProps {
  year: number
  month: number
  grid: (number | null)[][]
  workoutDays: Set<number>
  prDays: Set<number>
  locale: string
  weekdayHeaders: string[]
  selectedDay: number | null
  todayDay: number | null
  onDayPress: (day: number) => void
}

export function MiniCalendar({
  grid,
  workoutDays,
  prDays,
  weekdayHeaders,
  selectedDay,
  todayDay,
  onDayPress,
}: MiniCalendarProps) {
  return (
    <AppCard>
      <YStack gap={2}>
        {/* Weekday headers */}
        <XStack>
          {weekdayHeaders.map((header, i) => (
            <View key={i} style={styles.cell}>
              <AppText preset="columnHeader" color={colors.gray7} textAlign="center">
                {header}
              </AppText>
            </View>
          ))}
        </XStack>

        {/* Day rows */}
        {grid.map((week, wi) => (
          <XStack key={wi}>
            {week.map((day, di) => {
              if (day === null) {
                return <View key={di} style={styles.cell} />
              }

              const hasWorkout = workoutDays.has(day)
              const hasPR = prDays.has(day)
              const isToday = day === todayDay
              const isSelected = day === selectedDay

              return (
                <Pressable
                  key={di}
                  style={[styles.cell, isSelected && styles.selectedCell]}
                  onPress={hasWorkout ? () => onDayPress(day) : undefined}
                  disabled={!hasWorkout}
                  hitSlop={4}
                  accessibilityLabel={`${day}`}
                  accessibilityRole={hasWorkout ? 'button' : 'text'}
                >
                  <AppText
                    fontSize={13}
                    fontWeight={hasWorkout ? '600' : '400'}
                    color={isToday ? colors.accent : hasWorkout ? colors.gray11 : colors.gray5}
                    textAlign="center"
                  >
                    {day}
                  </AppText>
                  {hasWorkout && (
                    <View style={[styles.dot, hasPR ? styles.dotPR : styles.dotWorkout]} />
                  )}
                </Pressable>
              )
            })}
          </XStack>
        ))}
      </YStack>
    </AppCard>
  )
}

const CELL_SIZE = 40

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    backgroundColor: colors.gray3,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  dotWorkout: {
    backgroundColor: colors.accent,
  },
  dotPR: {
    backgroundColor: semantic.pr,
  },
})
