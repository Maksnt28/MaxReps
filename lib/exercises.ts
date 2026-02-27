import type { Exercise } from '@/hooks/useExercises'

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'traps', 'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves', 'abs',
] as const

export const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell',
] as const

interface LocalizedExercise {
  name: string
  cues: string | null
}

export function getLocalizedExercise(
  exercise: Exercise,
  locale: string,
): LocalizedExercise {
  if (locale === 'fr') {
    return {
      name: exercise.name_fr,
      cues: exercise.cues_fr,
    }
  }
  return {
    name: exercise.name_en,
    cues: exercise.cues_en,
  }
}

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

interface ExerciseFilters {
  search: string
  muscleGroup: string | null
  equipment: string | null
}

export function filterExercises(
  exercises: Exercise[],
  filters: ExerciseFilters,
  locale: string,
): Exercise[] {
  const { search, muscleGroup, equipment } = filters

  return exercises.filter((exercise) => {
    if (muscleGroup && exercise.muscle_primary !== muscleGroup) {
      return false
    }

    if (equipment && exercise.equipment !== equipment) {
      return false
    }

    if (search) {
      const { name } = getLocalizedExercise(exercise, locale)
      const normalizedSearch = normalizeForSearch(search)
      const normalizedName = normalizeForSearch(name)
      if (!normalizedName.includes(normalizedSearch)) {
        return false
      }
    }

    return true
  })
}
