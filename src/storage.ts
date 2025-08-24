import localforage from 'localforage'
import type { SaveFile, Task } from './types'
import { ACHIEVEMENTS } from './achievements'

localforage.config({
  name: 'corn-cat',
  storeName: 'corn-cat-data'
})

const DEFAULT: SaveFile = {
  version: 1,
  tasks: [],
  creature: {
    id: 'cat',
    name: 'Cat',
    taskCount: 0,
    clickCount: 0
  },
  achievements: ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlockedAt: null
  })),
  settings: {
    reduceMotion: false,
    theme: 'dark'
  }
}

// Helper function to categorize tasks based on text content
function categorizeTask(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('office') || lowerText.includes('meeting')) return 'work'
  if (lowerText.includes('health') || lowerText.includes('exercise') || lowerText.includes('gym') || lowerText.includes('workout') || lowerText.includes('doctor')) return 'health'
  if (lowerText.includes('social') || lowerText.includes('friend') || lowerText.includes('party') || lowerText.includes('date') || lowerText.includes('family')) return 'social'
  if (lowerText.includes('learn') || lowerText.includes('study') || lowerText.includes('read') || lowerText.includes('course') || lowerText.includes('class')) return 'learning'
  if (lowerText.includes('hobby') || lowerText.includes('game') || lowerText.includes('craft') || lowerText.includes('music') || lowerText.includes('art')) return 'hobby'
  if (lowerText.includes('chore') || lowerText.includes('clean') || lowerText.includes('laundry') || lowerText.includes('dishes') || lowerText.includes('grocery')) return 'chore'
  if (lowerText.includes('finance') || lowerText.includes('money') || lowerText.includes('bill') || lowerText.includes('budget') || lowerText.includes('save')) return 'finance'
  if (lowerText.includes('personal') || lowerText.includes('self') || lowerText.includes('meditation') || lowerText.includes('goal')) return 'personal'
  if (lowerText.includes('creative') || lowerText.includes('write') || lowerText.includes('draw') || lowerText.includes('design') || lowerText.includes('paint')) return 'creative'
  if (lowerText.includes('travel') || lowerText.includes('trip') || lowerText.includes('vacation') || lowerText.includes('flight')) return 'travel'
  
  return 'other'
}

// Migrate old tasks to include taskType
function migrateTasks(tasks: Task[]): Task[] {
  return tasks.map(task => {
    if (!task.taskType) {
      return {
        ...task,
        taskType: categorizeTask(task.title || (task as any).text || '')
      }
    }
    return task
  })
}

export async function load(): Promise<SaveFile> {
  try {
    const data = await localforage.getItem<SaveFile>('save')
    if (!data) return DEFAULT

    // Migrate old data structure if needed
    const migratedData = {
      ...DEFAULT,
      ...data,
      tasks: migrateTasks(data.tasks || []),
      creature: data.creature || data.cat || DEFAULT.creature,
      achievements: data.achievements || DEFAULT.achievements,
      settings: data.settings || DEFAULT.settings
    }

    return migratedData
  } catch (error) {
    console.error('Storage error:', error)
    throw new Error('Storage error')
  }
}

export async function save(data: SaveFile): Promise<void> {
  try {
    await localforage.setItem('save', data)
  } catch (error) {
    console.error('Storage error:', error)
    throw new Error('Storage error')
  }
}

export async function clear(): Promise<void> {
  try {
    await localforage.clear()
  } catch (error) {
    console.error('Storage error:', error)
    throw new Error('Storage error')
  }
}

export async function persist(data: SaveFile): Promise<void> {
  return save(data)
}
