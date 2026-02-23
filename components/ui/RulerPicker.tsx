import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { hapticSelection } from '@/lib/animations'
import { AppText } from './AppText'
import { AppCard } from './AppCard'
import { colors, accent } from '@/lib/theme'
import {
  TICK_SPACING,
  valueToOffset,
  offsetToValue,
  clampToStep,
  formatValue,
  generateTicks,
  type Tick,
} from '@/lib/rulerPickerUtils'

// Effective card background (gray1 #08080A + 3.5% white overlay)
const CARD_BG = '#111113'

interface RulerPickerProps {
  label: string
  value: number | null
  onValueChange: (value: number) => void
  min: number
  max: number
  step: number
  majorEvery: number
  midEvery: number
  unit: string
  accessibilityLabel: string
  embedded?: boolean
}

export function RulerPicker({
  label,
  value,
  onValueChange,
  min,
  max,
  step,
  majorEvery,
  midEvery,
  unit,
  accessibilityLabel,
  embedded = false,
}: RulerPickerProps) {
  const scrollRef = useRef<ScrollView>(null)
  const inputRef = useRef<TextInput>(null)
  const lastValueRef = useRef<number | null>(value)
  const userInteractedRef = useRef(false)
  const isScrollingRef = useRef(false)

  const [containerWidth, setContainerWidth] = useState(0)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const isDecimal = step < 1
  const midValue = clampToStep((min + max) / 2, min, max, step)

  const ticks = useMemo(
    () => generateTicks(min, max, step, majorEvery, midEvery),
    [min, max, step, majorEvery, midEvery],
  )

  // Scroll to a value programmatically
  const scrollToValue = useCallback(
    (val: number, animated = true) => {
      if (containerWidth <= 0) return
      const offset = valueToOffset(val, min, step)
      scrollRef.current?.scrollTo({ x: offset, animated })
    },
    [containerWidth, min, step],
  )

  // Initial scroll on layout
  useEffect(() => {
    if (containerWidth <= 0) return
    const target = value ?? midValue
    // Small delay to ensure ScrollView is fully laid out
    const timer = setTimeout(() => {
      scrollToValue(target, false)
    }, 50)
    return () => clearTimeout(timer)
  }, [containerWidth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll when value changes externally (not from scroll interaction)
  useEffect(() => {
    if (value == null || isScrollingRef.current || containerWidth <= 0) return
    if (value !== lastValueRef.current) {
      lastValueRef.current = value
      scrollToValue(value, true)
    }
  }, [value, scrollToValue, containerWidth])

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = true
      const offsetX = e.nativeEvent.contentOffset.x
      const newValue = offsetToValue(offsetX, min, max, step)

      if (newValue !== lastValueRef.current) {
        lastValueRef.current = newValue
        hapticSelection()
        if (userInteractedRef.current) {
          onValueChange(newValue)
        }
      }
    },
    [min, max, step, onValueChange],
  )

  const handleScrollBeginDrag = useCallback(() => {
    userInteractedRef.current = true
    isScrollingRef.current = true
  }, [])

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isScrollingRef.current = false
      // Ensure final value is committed
      const offsetX = e.nativeEvent.contentOffset.x
      const finalValue = offsetToValue(offsetX, min, max, step)
      lastValueRef.current = finalValue
      if (userInteractedRef.current) {
        onValueChange(finalValue)
      }
    },
    [min, max, step, onValueChange],
  )

  // Tap-to-type
  const handleTapValue = useCallback(() => {
    setDraft(value != null ? formatValue(value, step) : '')
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [value, step])

  const handleInputBlur = useCallback(() => {
    setEditing(false)
    const n = parseFloat(draft)
    if (Number.isNaN(n) || draft === '') return
    const clamped = clampToStep(n, min, max, step)
    userInteractedRef.current = true
    onValueChange(clamped)
    lastValueRef.current = clamped
    scrollToValue(clamped, true)
  }, [draft, min, max, step, onValueChange, scrollToValue])

  const handleLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number } } }) => {
      setContainerWidth(e.nativeEvent.layout.width)
    },
    [],
  )

  // Display value
  const displayValue =
    value != null ? formatValue(value, step) : '—'

  const padding = containerWidth > 0 ? containerWidth / 2 : 0

  const header = embedded ? (
    <View style={styles.embeddedHeader}>
      <AppText preset="caption" color={colors.gray7}>
        {label}
      </AppText>
      <Pressable
        onPress={handleTapValue}
        style={styles.embeddedValueTap}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
      >
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onBlur={handleInputBlur}
            style={[styles.embeddedValue, styles.bigValueEditing]}
            keyboardType={isDecimal ? 'decimal-pad' : 'number-pad'}
            maxLength={isDecimal ? 5 : 3}
            selectTextOnFocus
            returnKeyType="done"
            accessibilityLabel={accessibilityLabel}
          />
        ) : (
          <AppText
            fontSize={20}
            fontWeight="700"
            color={value != null ? colors.gray12 : colors.gray5}
          >
            {displayValue}
          </AppText>
        )}
        <AppText fontSize={13} color={colors.gray7} marginLeft={3}>
          {unit}
        </AppText>
      </Pressable>
    </View>
  ) : (
    <>
      <AppText preset="caption" color={colors.gray7}>
        {label}
      </AppText>
      <Pressable
        onPress={handleTapValue}
        style={styles.valueTapArea}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="adjustable"
      >
        {editing ? (
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onBlur={handleInputBlur}
            style={[styles.bigValue, styles.bigValueEditing]}
            keyboardType={isDecimal ? 'decimal-pad' : 'number-pad'}
            maxLength={isDecimal ? 5 : 3}
            selectTextOnFocus
            returnKeyType="done"
            accessibilityLabel={accessibilityLabel}
          />
        ) : (
          <AppText
            fontSize={28}
            fontWeight="800"
            color={value != null ? colors.gray12 : colors.gray5}
          >
            {displayValue}
          </AppText>
        )}
        <AppText fontSize={14} color={colors.gray7} marginLeft={4}>
          {unit}
        </AppText>
      </Pressable>
    </>
  )

  const ruler = (
    <View style={[styles.rulerContainer, embedded && styles.rulerContainerEmbedded]} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_SPACING}
            decelerationRate="fast"
            bounces={false}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollEnd={handleScrollEnd}
            onScrollEndDrag={handleScrollEnd}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingHorizontal: padding,
              alignItems: 'flex-end',
            }}
          >
            {ticks.map((tick, i) => (
              <TickMark key={i} tick={tick} />
            ))}
          </ScrollView>

          {/* Center indicator */}
          <View style={styles.centerIndicator} pointerEvents="none" />

          {/* Edge fades */}
          <LinearGradient
            colors={[CARD_BG, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeLeft}
            pointerEvents="none"
          />
          <LinearGradient
            colors={['transparent', CARD_BG]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeRight}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  )

  if (embedded) {
    return <View>{header}{ruler}</View>
  }

  return (
    <AppCard>
      {header}
      {ruler}
    </AppCard>
  )
}

// Separate component to avoid re-creating inline elements
function TickMark({ tick }: { tick: Tick }) {
  const tickStyle =
    tick.type === 'major'
      ? styles.tickMajor
      : tick.type === 'mid'
        ? styles.tickMid
        : styles.tickMinor

  return (
    <View style={styles.tickCell}>
      <View style={tickStyle} />
      {tick.label != null && (
        <AppText
          fontSize={9}
          color={colors.gray8}
          textAlign="center"
          marginTop={2}
        >
          {tick.label}
        </AppText>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  valueTapArea: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  bigValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: colors.gray12,
    textAlign: 'center',
    minWidth: 50,
    padding: 0,
  },
  bigValueEditing: {
    borderBottomWidth: 2,
    borderBottomColor: accent.accent,
  },
  rulerContainer: {
    height: 52,
    overflow: 'hidden',
    marginTop: 4,
  },
  rulerContainerEmbedded: {
    marginTop: 0,
  },
  embeddedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  embeddedValueTap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  embeddedValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.gray12,
    textAlign: 'right',
    minWidth: 40,
    padding: 0,
  },
  tickCell: {
    width: TICK_SPACING,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tickMinor: {
    width: 1,
    height: 12,
    backgroundColor: colors.gray5,
  },
  tickMid: {
    width: 1,
    height: 20,
    backgroundColor: colors.gray7,
  },
  tickMajor: {
    width: 1.5,
    height: 28,
    backgroundColor: colors.gray9,
  },
  centerIndicator: {
    position: 'absolute',
    left: '50%',
    marginLeft: -1,
    width: 2,
    top: 0,
    height: 36,
    backgroundColor: accent.accent,
    borderRadius: 1,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
  },
})
