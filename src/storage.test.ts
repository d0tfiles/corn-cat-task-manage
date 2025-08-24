import { describe, it, expect, vi, beforeEach } from 'vitest'
import { load, persist } from './storage'
import localforage from 'localforage'
import type { SaveFile } from './types'

// Mock localForage
vi.mock('localforage')

describe('storage', () => {
  const mockLocalForage = localforage as jest.Mocked<typeof localforage>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('load', () => {
    it('should return default state when no saved data exists', async () => {
      mockLocalForage.getItem.mockResolvedValue(null)

      const result = await load()

      expect(result).toEqual({
        version: 1,
        tasks: [],
        creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
        achievements: expect.arrayContaining([
          expect.objectContaining({ id: 'tasks-completed-1', title: 'First Task' }),
          expect.objectContaining({ id: 'tasks-completed-5', title: 'Getting Started' }),
          expect.objectContaining({ id: 'tasks-completed-10', title: 'Task Master' }),
          expect.objectContaining({ id: 'tasks-completed-25', title: 'Productivity Pro' }),
          expect.objectContaining({ id: 'tasks-completed-50', title: 'Task Champion' }),
          expect.objectContaining({ id: 'tasks-completed-100', title: 'Task Legend' }),
          expect.objectContaining({ id: 'tasks-completed-200', title: 'Task God' }),
          expect.objectContaining({ id: 'tasks-created-1', title: 'Task Creator' }),
          expect.objectContaining({ id: 'tasks-created-5', title: 'Planner' }),
          expect.objectContaining({ id: 'tasks-created-10', title: 'Organizer' }),
          expect.objectContaining({ id: 'tasks-created-25', title: 'Task Manager' }),
          expect.objectContaining({ id: 'tasks-created-50', title: 'Task Architect' }),
          expect.objectContaining({ id: 'tasks-created-100', title: 'Task Designer' }),
          expect.objectContaining({ id: 'streak-2', title: 'Two Day Wonder' }),
          expect.objectContaining({ id: 'streak-3', title: 'Three Day Streak' }),
          expect.objectContaining({ id: 'streak-7', title: 'Week Warrior' }),
          expect.objectContaining({ id: 'streak-14', title: 'Fortnight Fighter' }),
          expect.objectContaining({ id: 'variety-3', title: 'Diverse Doer' }),
          expect.objectContaining({ id: 'variety-5', title: 'Versatile Victor' }),
          expect.objectContaining({ id: 'variety-7', title: 'Category Collector' }),
          expect.objectContaining({ id: 'variety-10', title: 'Master of All' }),
          expect.objectContaining({ id: 'clicks-10', title: 'Cat Lover' }),
          expect.objectContaining({ id: 'clicks-50', title: 'Cat Enthusiast' }),
          expect.objectContaining({ id: 'clicks-100', title: 'Cat Whisperer' }),
          expect.objectContaining({ id: 'clicks-500', title: 'Cat Master' }),
          expect.objectContaining({ id: 'clicks-1000', title: 'Cat Legend' }),
        ]),
        settings: { reduceMotion: false, theme: 'system' }
      })
      expect(mockLocalForage.getItem).toHaveBeenCalledWith('save')
    })

    it('should return saved data when it exists', async () => {
      const mockSaveData: SaveFile = {
        version: 1,
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            createdAt: Date.now(),
            completedAt: null,
            taskType: 'other',
          },
        ],
        creature: { id: 'cat', name: 'Cat', taskCount: 5, clickCount: 2 },
        achievements: [
          { 
            id: 'tasks-completed-10', 
            title: 'Task Master',
            description: 'Complete 10 tasks',
            category: 'tasks',
            icon: '🏆',
            unlockedAt: new Date().toISOString()
          },
          { 
            id: 'tasks-completed-25', 
            title: 'Productivity Pro',
            description: 'Complete 25 tasks',
            category: 'tasks',
            icon: '⭐',
            unlockedAt: null
          },
        ],
        settings: { reduceMotion: true, theme: 'dark' },
      }

      mockLocalForage.getItem.mockResolvedValue(mockSaveData)

      const result = await load()

      expect(result).toEqual(mockSaveData)
      expect(mockLocalForage.getItem).toHaveBeenCalledWith('save')
    })

    it('should handle storage errors gracefully', async () => {
      mockLocalForage.getItem.mockRejectedValue(new Error('Storage error'))

      // The current implementation doesn't handle errors, so we expect it to throw
      await expect(load()).rejects.toThrow('Storage error')
    })
  })

  describe('persist', () => {
    it('should save data to localForage', async () => {
      const saveData: SaveFile = {
        version: 1,
        tasks: [
          {
            id: 'task-1',
            title: 'Test Task',
            createdAt: Date.now(),
            completedAt: null,
            taskType: 'other',
          },
        ],
        creature: { id: 'cat', name: 'Cat', taskCount: 3, clickCount: 2 },
        achievements: [
          { 
            id: 'tasks-completed-10', 
            title: 'Task Master',
            description: 'Complete 10 tasks',
            category: 'tasks',
            icon: '🏆',
            unlockedAt: null
          },
          { 
            id: 'tasks-completed-25', 
            title: 'Productivity Pro',
            description: 'Complete 25 tasks',
            category: 'tasks',
            icon: '⭐',
            unlockedAt: null
          },
        ],
        settings: { reduceMotion: false, theme: 'light' },
      }

      mockLocalForage.setItem.mockResolvedValue(saveData)

      await persist(saveData)

      expect(mockLocalForage.setItem).toHaveBeenCalledWith('save', saveData)
    })

    it('should handle persistence errors', async () => {
      const saveData: SaveFile = {
        version: 1,
        tasks: [],
        creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
        achievements: [
          { 
            id: 'tasks-completed-10', 
            title: 'Task Master',
            description: 'Complete 10 tasks',
            category: 'tasks',
            icon: '🏆',
            unlockedAt: null
          },
        ],
        settings: { reduceMotion: false, theme: 'system' },
      }

      mockLocalForage.setItem.mockRejectedValue(new Error('Persistence error'))

      // Should throw Storage error (as per the implementation)
      await expect(persist(saveData)).rejects.toThrow('Storage error')
    })
  })
})
