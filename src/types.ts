export interface Task {
  id: string
  title: string
  completedAt: string | null
  taskType: TaskType
  createdAt: number
}

export type TaskType = 'work' | 'health' | 'social' | 'learning' | 'hobby' | 'chore' | 'finance' | 'personal' | 'creative' | 'travel' | 'other'

export type AchievementCategory = 'tasks' | 'streaks' | 'variety' | 'clicks' | 'procrastinator'

export interface Achievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  icon: string
  unlockedAt: string | null
}

export interface Creature {
  id: string
  name: string
  taskCount: number
  clickCount: number
}

export interface Settings {
  reduceMotion: boolean
  theme: string
}

export interface SaveFile {
  version: number
  tasks: Task[]
  creature: Creature
  achievements: Achievement[]
  settings: Settings
}
