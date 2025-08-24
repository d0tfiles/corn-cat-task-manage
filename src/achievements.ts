import type { Achievement } from './types'

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt'>[] = [
  // Task completion achievements
  {
    id: 'tasks-completed-1',
    title: 'First Task',
    description: 'Complete your first task',
    category: 'tasks',
    icon: '✅'
  },
  {
    id: 'tasks-completed-5',
    title: 'Getting Started',
    description: 'Complete 5 tasks',
    category: 'tasks',
    icon: '🎯'
  },
  {
    id: 'tasks-completed-10',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    category: 'tasks',
    icon: '🏆'
  },
  {
    id: 'tasks-completed-25',
    title: 'Productivity Pro',
    description: 'Complete 25 tasks',
    category: 'tasks',
    icon: '⭐'
  },
  {
    id: 'tasks-completed-50',
    title: 'Task Champion',
    description: 'Complete 50 tasks',
    category: 'tasks',
    icon: '👑'
  },
  {
    id: 'tasks-completed-100',
    title: 'Task Legend',
    description: 'Complete 100 tasks',
    category: 'tasks',
    icon: '💎'
  },
  {
    id: 'tasks-completed-200',
    title: 'Task God',
    description: 'Complete 200 tasks',
    category: 'tasks',
    icon: '🌟'
  },

  // Task creation achievements
  {
    id: 'tasks-created-1',
    title: 'Task Creator',
    description: 'Create your first task',
    category: 'tasks',
    icon: '📝'
  },
  {
    id: 'tasks-created-5',
    title: 'Planner',
    description: 'Create 5 tasks',
    category: 'tasks',
    icon: '📋'
  },
  {
    id: 'tasks-created-10',
    title: 'Organizer',
    description: 'Create 10 tasks',
    category: 'tasks',
    icon: '🗂️'
  },
  {
    id: 'tasks-created-25',
    title: 'Task Manager',
    description: 'Create 25 tasks',
    category: 'tasks',
    icon: '📊'
  },
  {
    id: 'tasks-created-50',
    title: 'Task Architect',
    description: 'Create 50 tasks',
    category: 'tasks',
    icon: '🏗️'
  },
  {
    id: 'tasks-created-100',
    title: 'Task Designer',
    description: 'Create 100 tasks',
    category: 'tasks',
    icon: '🎨'
  },

  // Streak achievements
  {
    id: 'streak-2',
    title: 'Two Day Wonder',
    description: 'Complete tasks for 2 consecutive days',
    category: 'streaks',
    icon: '🔥'
  },
  {
    id: 'streak-3',
    title: 'Three Day Streak',
    description: 'Complete tasks for 3 consecutive days',
    category: 'streaks',
    icon: '🔥🔥'
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Complete tasks for 7 consecutive days',
    category: 'streaks',
    icon: '🔥🔥🔥'
  },
  {
    id: 'streak-14',
    title: 'Fortnight Fighter',
    description: 'Complete tasks for 14 consecutive days',
    category: 'streaks',
    icon: '🔥🔥🔥🔥'
  },

  // Variety achievements
  {
    id: 'variety-3',
    title: 'Diverse Doer',
    description: 'Complete tasks from 3 different categories',
    category: 'variety',
    icon: '🌈'
  },
  {
    id: 'variety-5',
    title: 'Versatile Victor',
    description: 'Complete tasks from 5 different categories',
    category: 'variety',
    icon: '🎭'
  },
  {
    id: 'variety-7',
    title: 'Category Collector',
    description: 'Complete tasks from 7 different categories',
    category: 'variety',
    icon: '🎪'
  },
  {
    id: 'variety-10',
    title: 'Master of All',
    description: 'Complete tasks from 10 different categories',
    category: 'variety',
    icon: '👑'
  },

  // Click achievements
  {
    id: 'clicks-10',
    title: 'Cat Lover',
    description: 'Click the cat 10 times',
    category: 'clicks',
    icon: '🐱'
  },
  {
    id: 'clicks-50',
    title: 'Cat Enthusiast',
    description: 'Click the cat 50 times',
    category: 'clicks',
    icon: '🐱❤️'
  },
  {
    id: 'clicks-100',
    title: 'Cat Whisperer',
    description: 'Click the cat 100 times',
    category: 'clicks',
    icon: '🐱✨'
  },
  {
    id: 'clicks-500',
    title: 'Cat Master',
    description: 'Click the cat 500 times',
    category: 'clicks',
    icon: '🐱👑'
  },
  {
    id: 'clicks-1000',
    title: 'Cat Legend',
    description: 'Click the cat 1000 times',
    category: 'clicks',
    icon: '🐱💎'
  },

  // Procrastinator achievements
  {
    id: 'procrastinator-10',
    title: 'Mild Procrastinator',
    description: 'Click the cat 10 times in under a minute',
    category: 'procrastinator',
    icon: '😅'
  },
  {
    id: 'procrastinator-20',
    title: 'Moderate Procrastinator',
    description: 'Click the cat 20 times in under a minute',
    category: 'procrastinator',
    icon: '😰'
  },
  {
    id: 'procrastinator-30',
    title: 'Serious Procrastinator',
    description: 'Click the cat 30 times in under a minute',
    category: 'procrastinator',
    icon: '😱'
  },
  {
    id: 'procrastinator-50',
    title: 'Master Procrastinator',
    description: 'Click the cat 50 times in under a minute',
    category: 'procrastinator',
    icon: '🤯'
  },
  {
    id: 'procrastinator-100',
    title: 'Legendary Procrastinator',
    description: 'Click the cat 100 times in under a minute',
    category: 'procrastinator',
    icon: '💀'
  }
]

export function getAchievementsByCategory(category: string): Omit<Achievement, 'unlockedAt'>[] {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category)
}

export function getAchievementById(id: string): Omit<Achievement, 'unlockedAt'> | undefined {
  return ACHIEVEMENTS.find(achievement => achievement.id === id)
}

export function getUnlockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter(achievement => achievement.unlockedAt != null)
}

export function getLockedAchievements(achievements: Achievement[]): Achievement[] {
  return achievements.filter(achievement => achievement.unlockedAt == null)
}
