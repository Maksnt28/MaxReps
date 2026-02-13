import { describe, it, expect } from 'vitest'

import {
  getLocalizedExercise,
  normalizeForSearch,
  filterExercises,
} from '@/lib/exercises'
import type { Exercise } from '@/hooks/useExercises'

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-1',
    name_en: 'Barbell Bench Press',
    name_fr: 'Développé couché barre',
    muscle_primary: 'chest',
    muscle_secondary: ['triceps', 'shoulders'],
    equipment: 'barbell',
    category: 'compound',
    difficulty: 'intermediate',
    cues_en: 'Retract shoulder blades, feet flat, drive through heels.',
    cues_fr: 'Rétractez les omoplates, pieds à plat, poussez avec les talons.',
    animation_url: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const exercises: Exercise[] = [
  makeExercise({
    id: 'ex-1',
    name_en: 'Barbell Bench Press',
    name_fr: 'Développé couché barre',
    muscle_primary: 'chest',
    equipment: 'barbell',
  }),
  makeExercise({
    id: 'ex-2',
    name_en: 'Dumbbell Curl',
    name_fr: 'Curl haltère',
    muscle_primary: 'biceps',
    equipment: 'dumbbell',
    category: 'isolation',
  }),
  makeExercise({
    id: 'ex-3',
    name_en: 'Cable Row',
    name_fr: 'Tirage câble',
    muscle_primary: 'back',
    muscle_secondary: ['biceps'],
    equipment: 'cable',
  }),
  makeExercise({
    id: 'ex-4',
    name_en: 'Barbell Squat',
    name_fr: 'Squat barre',
    muscle_primary: 'quads',
    equipment: 'barbell',
  }),
  makeExercise({
    id: 'ex-5',
    name_en: 'Push-Up',
    name_fr: 'Pompes',
    muscle_primary: 'chest',
    equipment: 'bodyweight',
    cues_en: null,
    cues_fr: null,
  }),
]

describe('normalizeForSearch', () => {
  it('lowercases text', () => {
    expect(normalizeForSearch('Hello')).toBe('hello')
  })

  it('strips diacritics', () => {
    expect(normalizeForSearch('Développé')).toBe('developpe')
  })

  it('strips multiple accented characters', () => {
    expect(normalizeForSearch('Rétractez')).toBe('retractez')
  })

  it('handles already-normalized text', () => {
    expect(normalizeForSearch('bench press')).toBe('bench press')
  })
})

describe('getLocalizedExercise', () => {
  const exercise = makeExercise()

  it('returns English name and cues for en locale', () => {
    const result = getLocalizedExercise(exercise, 'en')
    expect(result.name).toBe('Barbell Bench Press')
    expect(result.cues).toBe(
      'Retract shoulder blades, feet flat, drive through heels.',
    )
  })

  it('returns French name and cues for fr locale', () => {
    const result = getLocalizedExercise(exercise, 'fr')
    expect(result.name).toBe('Développé couché barre')
    expect(result.cues).toBe(
      'Rétractez les omoplates, pieds à plat, poussez avec les talons.',
    )
  })

  it('returns null cues when cues_en is null', () => {
    const noCues = makeExercise({ cues_en: null })
    const result = getLocalizedExercise(noCues, 'en')
    expect(result.cues).toBeNull()
  })

  it('returns null cues when cues_fr is null', () => {
    const noCues = makeExercise({ cues_fr: null })
    const result = getLocalizedExercise(noCues, 'fr')
    expect(result.cues).toBeNull()
  })

  it('falls back to English for unknown locale', () => {
    const result = getLocalizedExercise(exercise, 'de')
    expect(result.name).toBe('Barbell Bench Press')
    expect(result.cues).toBe(
      'Retract shoulder blades, feet flat, drive through heels.',
    )
  })
})

describe('filterExercises', () => {
  const noFilters = { search: '', muscleGroup: null, equipment: null }

  it('returns all exercises when no filters applied', () => {
    const result = filterExercises(exercises, noFilters, 'en')
    expect(result).toHaveLength(5)
  })

  it('filters by muscle_primary', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, muscleGroup: 'chest' },
      'en',
    )
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.id)).toEqual(['ex-1', 'ex-5'])
  })

  it('filters by equipment', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, equipment: 'barbell' },
      'en',
    )
    expect(result).toHaveLength(2)
    expect(result.map((e) => e.id)).toEqual(['ex-1', 'ex-4'])
  })

  it('filters by search (English)', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, search: 'curl' },
      'en',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-2')
  })

  it('search is case-insensitive', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, search: 'BENCH' },
      'en',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-1')
  })

  it('search is accent-insensitive for French names', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, search: 'developpe' },
      'fr',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-1')
  })

  it('combines muscle group + equipment filters', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, muscleGroup: 'chest', equipment: 'barbell' },
      'en',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-1')
  })

  it('combines search + muscle group + equipment filters', () => {
    const result = filterExercises(
      exercises,
      { search: 'bench', muscleGroup: 'chest', equipment: 'barbell' },
      'en',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-1')
  })

  it('returns empty array when no exercises match', () => {
    const result = filterExercises(
      exercises,
      { ...noFilters, muscleGroup: 'calves' },
      'en',
    )
    expect(result).toHaveLength(0)
  })

  it('does not match secondary muscles with muscle group filter', () => {
    // Cable Row has biceps as secondary, but muscle_primary is back
    const result = filterExercises(
      exercises,
      { ...noFilters, muscleGroup: 'biceps' },
      'en',
    )
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('ex-2') // Only the Dumbbell Curl
  })
})
