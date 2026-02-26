import { View, Text, Pressable, StyleSheet } from 'react-native'

interface ErrorFallbackProps {
  resetError: () => void
}

export function ErrorFallback({ resetError }: ErrorFallbackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>
        The app ran into an unexpected problem.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={resetError}
        accessibilityLabel="Try again"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08080A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FF5A6A',
    marginBottom: 16,
    width: 72,
    height: 72,
    lineHeight: 72,
    textAlign: 'center',
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FF5A6A',
    overflow: 'hidden',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E8E8EA',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#5C5C66',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
})
