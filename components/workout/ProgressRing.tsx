import Svg, { Circle } from 'react-native-svg'
import { colors } from '@/lib/theme'

interface ProgressRingProps {
  size?: number
  strokeWidth?: number
  progress: number // 0→1 fraction remaining
}

export function ProgressRing({ size = 15, strokeWidth = 1.5, progress }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.gray4}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={colors.accent}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
      />
    </Svg>
  )
}
