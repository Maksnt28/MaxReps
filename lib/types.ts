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

export type MovementPattern = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'isolation'

export type TrainingSplit = 'ppl' | 'upper_lower' | 'full_body' | 'bro_split' | 'push_pull' | 'custom'

export const TRAINING_SPLITS: TrainingSplit[] = [
  'ppl', 'upper_lower', 'full_body', 'bro_split', 'push_pull', 'custom',
]

export const SESSION_DURATION_OPTIONS = [30, 45, 60, 75, 90, 120] as const

export const GOAL_CATEGORIES = [
  { key: 'strengthPower', goals: ['strength', 'hypertrophy', 'powerlifting'] as Goal[] },
  { key: 'bodyComposition', goals: ['weight_loss', 'body_recomp'] as Goal[] },
  { key: 'enduranceConditioning', goals: ['endurance', 'general_fitness', 'cardio'] as Goal[] },
  { key: 'skillsMobility', goals: ['calisthenics', 'flexibility', 'athletic_performance'] as Goal[] },
] as const
