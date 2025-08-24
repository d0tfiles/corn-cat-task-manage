import type { Task, Creature, Achievement, SaveFile } from './types'
import { ACHIEVEMENTS } from './achievements'

export const thresholds = [1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 60, 75, 90, 100]

export function completeTask(tasks: Task[], creature: Creature, achievements: Achievement[], taskId: string): {
  tasks: Task[]
  creature: Creature
  achievements: Achievement[]
} {
  const updatedTasks = tasks.map(task => 
    task.id === taskId 
      ? { ...task, completedAt: task.completedAt ? null : new Date().toISOString() }
      : task
  )

  const completedTasksCount = getCompletedTasksCount(updatedTasks)
  
  const updatedCreature: Creature = {
    ...creature,
    taskCount: completedTasksCount
  }

  const updatedAchievements = checkAchievements(updatedTasks, updatedCreature, achievements, 0)

  return {
    tasks: updatedTasks,
    creature: updatedCreature,
    achievements: updatedAchievements
  }
}

export function deleteTask(tasks: Task[], creature: Creature, achievements: Achievement[], taskId: string): {
  tasks: Task[]
  creature: Creature
  achievements: Achievement[]
} {
  const taskToDelete = tasks.find(task => task.id === taskId)
  const wasCompleted = taskToDelete?.completedAt != null

  const updatedTasks = tasks.filter(task => task.id !== taskId)
  
  let updatedCreature = { ...creature }
  
  // If the deleted task was completed, reduce the task count
  if (wasCompleted) {
    const completedTasksCount = getCompletedTasksCount(updatedTasks)
    
    updatedCreature = {
      ...creature,
      taskCount: completedTasksCount
    }
  }

  const updatedAchievements = checkAchievements(updatedTasks, updatedCreature, achievements, 0)

  return {
    tasks: updatedTasks,
    creature: updatedCreature,
    achievements: updatedAchievements
  }
}

export function clickCat(creature: Creature, achievements: Achievement[], recentClicks: number = 0): {
  creature: Creature
  achievements: Achievement[]
} {
  const updatedCreature: Creature = {
    ...creature,
    clickCount: creature.clickCount + 1
  }

  const updatedAchievements = checkAchievements([], updatedCreature, achievements, recentClicks)

  return {
    creature: updatedCreature,
    achievements: updatedAchievements
  }
}

export function completeTaskForCreature(state: SaveFile, taskId: string): SaveFile {
  const result = completeTask(state.tasks, state.creature, state.achievements, taskId)
  return {
    ...state,
    ...result
  }
}

export function getCompletedTasksCount(tasks: Task[]): number {
  return tasks.filter(task => task.completedAt != null).length
}

export function getCurrentStreak(tasks: Task[]): number {
  const completedTasks = tasks.filter(task => task.completedAt != null)
  if (completedTasks.length === 0) return 0

  // Get unique completion dates
  const completionDates = [...new Set(
    completedTasks.map(task => task.completedAt!.split('T')[0])
  )].sort()

  if (completionDates.length === 0) return 0

  // Count consecutive days from the most recent
  let streak = 1
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  // Start from the most recent completion date
  let currentDate = completionDates[completionDates.length - 1]
  
  // If the most recent completion is today or yesterday, count backwards
  if (currentDate === today || currentDate === yesterday) {
    for (let i = completionDates.length - 2; i >= 0; i--) {
      const prevDate = completionDates[i]
      const expectedDate = new Date(currentDate)
      expectedDate.setDate(expectedDate.getDate() - 1)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]
      
      if (prevDate === expectedDateStr) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }
  } else {
    // If the most recent completion is not today/yesterday, no current streak
    streak = 0
  }

  return streak
}

export function getUniqueTaskTypes(tasks: Task[]): number {
  const completedTasks = tasks.filter(task => task.completedAt != null)
  const uniqueTypes = new Set(completedTasks.map(task => task.taskType))
  return uniqueTypes.size
}

export function getStage(taskCount: number): number {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (taskCount >= thresholds[i]) {
      return i + 1
    }
  }
  return 1
}

export function checkAchievements(tasks: Task[], creature: Creature, achievements: Achievement[], recentClicks: number = 0): Achievement[] {
  const completedTasksCount = getCompletedTasksCount(tasks)
  const totalTasksCount = tasks.length
  const currentStreak = getCurrentStreak(tasks)
  const uniqueTaskTypes = getUniqueTaskTypes(tasks)
  


  return achievements.map(achievement => {
    if (achievement.unlockedAt) return achievement

    let shouldUnlock = false

    switch (achievement.category) {
      case 'tasks':
        if (achievement.id.startsWith('tasks-completed-')) {
          shouldUnlock = completedTasksCount >= parseInt(achievement.id.split('-')[2])
        } else if (achievement.id.startsWith('tasks-created-')) {
          shouldUnlock = totalTasksCount >= parseInt(achievement.id.split('-')[2])
        }
        break
      case 'streaks':
        shouldUnlock = currentStreak >= parseInt(achievement.id.split('-')[1])
        break
      case 'variety':
        shouldUnlock = uniqueTaskTypes >= parseInt(achievement.id.split('-')[1])
        break
      case 'clicks':
        shouldUnlock = creature.clickCount >= parseInt(achievement.id.split('-')[1])
        break
      case 'procrastinator':
        const requiredClicks = parseInt(achievement.id.split('-')[1])
        shouldUnlock = recentClicks >= requiredClicks

        break
    }

    if (shouldUnlock) {
      return {
        ...achievement,
        unlockedAt: new Date().toISOString()
      }
    }

    return achievement
  })
}
