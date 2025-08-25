import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS, getAchievementsByCategory, getAchievementById, getUnlockedAchievements, getLockedAchievements } from './achievements'
import type { Achievement } from './types'

describe('achievements', () => {
  describe('ACHIEVEMENTS', () => {
    it('should have all required achievement categories', () => {
      const categories = new Set(ACHIEVEMENTS.map(a => a.category))
      expect(categories).toContain('tasks')
      expect(categories).toContain('streaks')
      expect(categories).toContain('variety')
      expect(categories).toContain('clicks')
    })

    it('should have unique IDs for all achievements', () => {
      const ids = ACHIEVEMENTS.map(a => a.id)
      const uniqueIds = new Set(ids)
      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have proper achievement structure', () => {
      ACHIEVEMENTS.forEach(achievement => {
        expect(achievement).toHaveProperty('id')
        expect(achievement).toHaveProperty('title')
        expect(achievement).toHaveProperty('description')
        expect(achievement).toHaveProperty('category')
        expect(achievement).toHaveProperty('icon')
        expect(typeof achievement.id).toBe('string')
        expect(typeof achievement.title).toBe('string')
        expect(typeof achievement.description).toBe('string')
      })
    })

    it('should have task completion achievements', () => {
      const taskCompletedAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('tasks-completed-'))
      expect(taskCompletedAchievements).toHaveLength(7)
    })

    it('should have task creation achievements', () => {
      const taskCreatedAchievements = ACHIEVEMENTS.filter(a => a.id.startsWith('tasks-created-'))
      expect(taskCreatedAchievements).toHaveLength(6)
    })

    it('should have streak achievements', () => {
      const streakAchievements = ACHIEVEMENTS.filter(a => a.category === 'streaks')
      expect(streakAchievements).toHaveLength(4)
    })

    it('should have variety achievements', () => {
      const varietyAchievements = ACHIEVEMENTS.filter(a => a.category === 'variety')
      expect(varietyAchievements).toHaveLength(4)
    })
  })

  describe('getAchievementsByCategory', () => {
    it('should return achievements for tasks category', () => {
      const taskAchievements = getAchievementsByCategory('tasks')
      expect(taskAchievements).toHaveLength(13) // 7 completion + 6 creation
      taskAchievements.forEach(a => {
        expect(a.category).toBe('tasks')
      })
    })

    it('should return achievements for clicks category', () => {
      const clickAchievements = getAchievementsByCategory('clicks')
      expect(clickAchievements).toHaveLength(5)
      clickAchievements.forEach(a => {
        expect(a.category).toBe('clicks')
      })
    })

    it('should return achievements for streaks category', () => {
      const streakAchievements = getAchievementsByCategory('streaks')
      expect(streakAchievements).toHaveLength(4)
      streakAchievements.forEach(a => {
        expect(a.category).toBe('streaks')
      })
    })

    it('should return achievements for variety category', () => {
      const varietyAchievements = getAchievementsByCategory('variety')
      expect(varietyAchievements).toHaveLength(4)
      varietyAchievements.forEach(a => {
        expect(a.category).toBe('variety')
      })
    })

    it('should return empty array for unknown category', () => {
      const unknownAchievements = getAchievementsByCategory('unknown')
      expect(unknownAchievements).toHaveLength(0)
    })
  })

  describe('getAchievementById', () => {
    it('should return achievement for valid ID', () => {
      const achievement = getAchievementById('tasks-completed-10')
      expect(achievement).toBeDefined()
      expect(achievement?.id).toBe('tasks-completed-10')
      expect(achievement?.title).toBe('Task Master')
    })

    it('should return undefined for invalid ID', () => {
      const achievement = getAchievementById('invalid-id')
      expect(achievement).toBeUndefined()
    })
  })

  describe('getUnlockedAchievements', () => {
    it('should return only unlocked achievements', () => {
      const achievements: Achievement[] = [
        {
          id: 'tasks-completed-10',
          title: 'Task Master',
          description: 'Complete 10 tasks',
          category: 'tasks',
          icon: '🏆',
          unlockedAt: new Date().toISOString(),
        },
        {
          id: 'tasks-completed-25',
          title: 'Productivity Pro',
          description: 'Complete 25 tasks',
          category: 'tasks',
          icon: '⭐',
          unlockedAt: null,
        },
      ]

      const unlocked = getUnlockedAchievements(achievements)
      expect(unlocked).toHaveLength(1)
      expect(unlocked[0].id).toBe('tasks-completed-10')
    })

    it('should return empty array when no achievements are unlocked', () => {
      const achievements: Achievement[] = [
        {
          id: 'tasks-completed-10',
          title: 'Task Master',
          description: 'Complete 10 tasks',
          category: 'tasks',
          icon: '🏆',
          unlockedAt: null,
        },
      ]

      const unlocked = getUnlockedAchievements(achievements)
      expect(unlocked).toHaveLength(0)
    })
  })

  describe('getLockedAchievements', () => {
    it('should return only locked achievements', () => {
      const achievements: Achievement[] = [
        {
          id: 'tasks-completed-10',
          title: 'Task Master',
          description: 'Complete 10 tasks',
          category: 'tasks',
          icon: '🏆',
          unlockedAt: new Date().toISOString(),
        },
        {
          id: 'tasks-completed-25',
          title: 'Productivity Pro',
          description: 'Complete 25 tasks',
          category: 'tasks',
          icon: '⭐',
          unlockedAt: null,
        },
      ]

      const locked = getLockedAchievements(achievements)
      expect(locked).toHaveLength(1)
      expect(locked[0].id).toBe('tasks-completed-25')
    })

    it('should return all achievements when none are unlocked', () => {
      const achievements: Achievement[] = [
        {
          id: 'tasks-completed-10',
          title: 'Task Master',
          description: 'Complete 10 tasks',
          category: 'tasks',
          icon: '🏆',
          unlockedAt: null,
        },
        {
          id: 'tasks-completed-25',
          title: 'Productivity Pro',
          description: 'Complete 25 tasks',
          category: 'tasks',
          icon: '⭐',
          unlockedAt: null,
        },
      ]

      const locked = getLockedAchievements(achievements)
      expect(locked).toHaveLength(2)
    })
  })
})
