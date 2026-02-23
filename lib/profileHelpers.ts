export function parseLimitations(text: string): string[] {
  return text.split(',').map(s => s.trim()).filter(Boolean)
}

export function formatLimitations(arr: string[]): string {
  return arr.join(', ')
}
