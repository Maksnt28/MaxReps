import { View, StyleSheet } from 'react-native'
import { accent, gray } from '@/lib/theme'

interface ProgressDotsProps {
  currentStep: number
  totalSteps: number
}

export function ProgressDots({ currentStep, totalSteps }: ProgressDotsProps) {
  return (
    <View style={styles.container} accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[styles.dot, i < currentStep ? styles.filled : styles.unfilled]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filled: {
    backgroundColor: accent.accent,
  },
  unfilled: {
    backgroundColor: gray.gray4,
  },
})
