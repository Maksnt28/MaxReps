export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function computeRemaining(expiresAt: number | null): number {
  if (expiresAt === null) return 0
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
}
