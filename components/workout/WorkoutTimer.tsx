import { useEffect, useState } from 'react'
import { Text } from 'tamagui'

interface WorkoutTimerProps {
  startedAt: string
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${mm}:${ss}`
  return `${mm}:${ss}`
}

export function WorkoutTimer({ startedAt }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startedAt).getTime()

    function tick() {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  return (
    <Text color="$color" fontSize={18} fontWeight="700" fontVariant={['tabular-nums']}>
      {formatElapsed(elapsed)}
    </Text>
  )
}
