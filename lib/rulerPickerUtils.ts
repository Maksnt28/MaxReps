export const TICK_SPACING = 8

export type TickType = 'minor' | 'mid' | 'major'

export interface Tick {
  value: number
  type: TickType
  label: string | null
}

export function valueToOffset(value: number, min: number, step: number): number {
  return ((value - min) / step) * TICK_SPACING
}

export function offsetToValue(
  offset: number,
  min: number,
  max: number,
  step: number,
): number {
  const raw = min + (offset / TICK_SPACING) * step
  return clampToStep(raw, min, max, step)
}

export function clampToStep(
  value: number,
  min: number,
  max: number,
  step: number,
): number {
  const snapped = Math.round(value / step) * step
  // Fix floating point: round to step's decimal precision
  const decimals = step < 1 ? 1 : 0
  const rounded = parseFloat(snapped.toFixed(decimals))
  return Math.max(min, Math.min(max, rounded))
}

export function formatValue(value: number, step: number): string {
  return step < 1 ? value.toFixed(1) : String(Math.round(value))
}

export function generateTicks(
  min: number,
  max: number,
  step: number,
  majorEvery: number,
  midEvery: number,
): Tick[] {
  const totalSteps = Math.round((max - min) / step)
  const ticks: Tick[] = []
  const decimals = step < 1 ? 1 : 0

  for (let i = 0; i <= totalSteps; i++) {
    const raw = min + i * step
    const value = parseFloat(raw.toFixed(decimals))

    // Check if value hits major/mid boundaries (use tolerance for floats)
    const isMajor = Math.abs(value % majorEvery) < 0.001 ||
      Math.abs(value % majorEvery - majorEvery) < 0.001
    const isMid = !isMajor && (
      Math.abs(value % midEvery) < 0.001 ||
      Math.abs(value % midEvery - midEvery) < 0.001
    )

    ticks.push({
      value,
      type: isMajor ? 'major' : isMid ? 'mid' : 'minor',
      label: isMajor ? String(Math.round(value)) : null,
    })
  }

  return ticks
}
