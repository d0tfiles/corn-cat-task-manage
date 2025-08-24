import { describe, it, expect } from 'vitest'
import { 
  completeTask, 
  deleteTask, 
  clickCat, 
  getCompletedTasksCount, 
  getCurrentStreak, 
  getUniqueTaskTypes, 
  getStage, 
  checkAchievements,
  thresholds 
} from './logic'
import type { Task, Creature, Achievement } from './types'

function createMockState(): { tasks: Task[], creature: Creature, achievements: Achievement[] } {
  return {
    tasks: [
      {
        id: '1',
        title: 'Work task',
        completedAt: null,
        taskType: 'work',
        createdAt: Date.now()
      },
      {
        id: '2',
        title: 'Health task',
        completedAt: new Date().toISOString(),
        taskType: 'health',
        createdAt: Date.now()
      },
      {
        id: '3',
        title: 'Social task',
        completedAt: null,
        taskType: 'social',
        createdAt: Date.now()
      }
    ],
    creature: {
      id: 'cat',
      name: 'Cat',
      taskCount: 1,
      clickCount: 0
    },
    achievements: [
      {
        id: 'tasks-completed-1',
        title: 'First Task',
        description: 'Complete your first task',
        category: 'tasks',
        icon: '✅',
        unlockedAt: null
      },
      {
        id: 'tasks-completed-5',
        title: 'Getting Started',
        description: 'Complete 5 tasks',
        category: 'tasks',
        icon: '🎯',
        unlockedAt: null
      },
      {
        id: 'clicks-10',
        title: 'Cat Lover',
        description: 'Click the cat 10 times',
        category: 'clicks',
        icon: '🐱',
        unlockedAt: null
      }
    ]
  }
}

describe('completeTask', () => {
  it('should complete an uncompleted task', () => {
    const state = createMockState()
    const result = completeTask(state.tasks, state.creature, state.achievements, '1')
    
    expect(result.tasks[0].completedAt).toBeTruthy()
    expect(result.creature.taskCount).toBe(2)
  })

  it('should uncheck a completed task', () => {
    const state = createMockState()
    const result = completeTask(state.tasks, state.creature, state.achievements, '2')
    
    expect(result.tasks[1].completedAt).toBeNull()
    expect(result.creature.taskCount).toBe(0)
  })

  it('should unlock achievements when completing tasks', () => {
    const state = createMockState()
    const result = completeTask(state.tasks, state.creature, state.achievements, '1')
    
    const firstTaskAchievement = result.achievements.find(a => a.id === 'tasks-completed-1')
    expect(firstTaskAchievement?.unlockedAt).toBeTruthy()
  })
})

describe('deleteTask', () => {
  it('should delete an uncompleted task', () => {
    const state = createMockState()
    const result = deleteTask(state.tasks, state.creature, state.achievements, '1')
    
    expect(result.tasks).toHaveLength(2)
    expect(result.tasks.find(t => t.id === '1')).toBeUndefined()
    expect(result.creature.taskCount).toBe(1) // Unchanged
  })

  it('should delete a completed task and reduce task count', () => {
    const state = createMockState()
    const result = deleteTask(state.tasks, state.creature, state.achievements, '2')
    
    expect(result.tasks).toHaveLength(2)
    expect(result.tasks.find(t => t.id === '2')).toBeUndefined()
    expect(result.creature.taskCount).toBe(0)
  })

  it('should handle deleting non-existent task', () => {
    const state = createMockState()
    const result = deleteTask(state.tasks, state.creature, state.achievements, '999')
    
    expect(result.tasks).toHaveLength(3)
    expect(result.creature.taskCount).toBe(1)
  })
})

describe('clickCat', () => {
  it('should increment click count', () => {
    const state = createMockState()
    const result = clickCat(state.creature, state.achievements)
    
    expect(result.creature.clickCount).toBe(1)
  })

  it('should unlock click achievements', () => {
    const state = createMockState()
    state.creature.clickCount = 9
    const result = clickCat(state.creature, state.achievements)
    
    const clickAchievement = result.achievements.find(a => a.id === 'clicks-10')
    expect(clickAchievement?.unlockedAt).toBeTruthy()
  })
})

describe('getCompletedTasksCount', () => {
  it('should count completed tasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completedAt: null, taskType: 'work', createdAt: Date.now() },
      { id: '2', title: 'Task 2', completedAt: new Date().toISOString(), taskType: 'health', createdAt: Date.now() },
      { id: '3', title: 'Task 3', completedAt: new Date().toISOString(), taskType: 'social', createdAt: Date.now() }
    ]
    
    expect(getCompletedTasksCount(tasks)).toBe(2)
  })
})

describe('getCurrentStreak', () => {
  it('should calculate consecutive days correctly', () => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)
    
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completedAt: today.toISOString(), taskType: 'work', createdAt: Date.now() },
      { id: '2', title: 'Task 2', completedAt: yesterday.toISOString(), taskType: 'health', createdAt: Date.now() },
      { id: '3', title: 'Task 3', completedAt: twoDaysAgo.toISOString(), taskType: 'social', createdAt: Date.now() }
    ]
    
    expect(getCurrentStreak(tasks)).toBe(3)
  })

  it('should handle non-consecutive days', () => {
    const today = new Date()
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completedAt: today.toISOString(), taskType: 'work', createdAt: Date.now() },
      { id: '2', title: 'Task 2', completedAt: threeDaysAgo.toISOString(), taskType: 'health', createdAt: Date.now() }
    ]
    
    expect(getCurrentStreak(tasks)).toBe(1)
  })

  it('should return 0 for no completed tasks', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completedAt: null, taskType: 'work', createdAt: Date.now() }
    ]
    
    expect(getCurrentStreak(tasks)).toBe(0)
  })
})

describe('getUniqueTaskTypes', () => {
  it('should count unique completed task types', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Work 1', completedAt: new Date().toISOString(), taskType: 'work', createdAt: Date.now() },
      { id: '2', title: 'Work 2', completedAt: new Date().toISOString(), taskType: 'work', createdAt: Date.now() },
      { id: '3', title: 'Health', completedAt: new Date().toISOString(), taskType: 'health', createdAt: Date.now() },
      { id: '4', title: 'Social', completedAt: null, taskType: 'social', createdAt: Date.now() }
    ]
    
    expect(getUniqueTaskTypes(tasks)).toBe(2)
  })
})

describe('getStage', () => {
  it('should return correct stage for task count', () => {
    expect(getStage(0)).toBe(1)
    expect(getStage(1)).toBe(1)
    expect(getStage(2)).toBe(2)
    expect(getStage(5)).toBe(4)
    expect(getStage(10)).toBe(6)
  })
})

describe('checkAchievements', () => {
  it('should unlock feeding achievements', () => {
    const tasks: Task[] = [
      { id: '1', title: 'Task 1', completedAt: new Date().toISOString(), taskType: 'work', createdAt: Date.now() }
    ]
    const creature: Creature = { id: 'cat', name: 'Cat', taskCount: 1, clickCount: 0 }
    const achievements: Achievement[] = [
      {
        id: 'tasks-completed-1',
        title: 'First Task',
        description: 'Complete your first task',
        category: 'tasks',
        icon: '✅',
        unlockedAt: null
      }
    ]
    
    const result = checkAchievements(tasks, creature, achievements)
    expect(result[0].unlockedAt).toBeTruthy()
  })

  it('should unlock click achievements', () => {
    const tasks: Task[] = []
    const creature: Creature = { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 10 }
    const achievements: Achievement[] = [
      {
        id: 'clicks-10',
        title: 'Cat Lover',
        description: 'Click the cat 10 times',
        category: 'clicks',
        icon: '🐱',
        unlockedAt: null
      }
    ]
    
    const result = checkAchievements(tasks, creature, achievements)
    expect(result[0].unlockedAt).toBeTruthy()
  })
})

describe('thresholds', () => {
  it('should have correct threshold values', () => {
    expect(thresholds).toEqual([1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100])
  })
})
