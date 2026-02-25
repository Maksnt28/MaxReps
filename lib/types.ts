export interface PRSummaryItem {
  exerciseName: string
  weight: number
  previousMax: number
  delta: number
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type Goal =
  | 'strength'
  | 'hypertrophy'
  | 'general_fitness'
  | 'body_recomp'
  | 'powerlifting'
  | 'weight_loss'
  | 'endurance'
  | 'athletic_performance'
  | 'calisthenics'
  | 'flexibility'
  | 'cardio'

export type Sex = 'male' | 'female'

export const GOAL_CATEGORIES = [
  { key: 'strengthPower', goals: ['strength', 'hypertrophy', 'powerlifting'] as Goal[] },
  { key: 'bodyComposition', goals: ['weight_loss', 'body_recomp'] as Goal[] },
  { key: 'enduranceConditioning', goals: ['endurance', 'general_fitness', 'cardio'] as Goal[] },
  { key: 'skillsMobility', goals: ['calisthenics', 'flexibility', 'athletic_performance'] as Goal[] },
] as const
