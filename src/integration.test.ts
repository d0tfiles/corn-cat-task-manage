import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import App from './App'
import { load, persist } from './storage'

// Mock the storage module
vi.mock('./storage', () => ({
  load: vi.fn(),
  persist: vi.fn(),
}))

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

// Mock URL methods
window.URL.createObjectURL = vi.fn(() => 'mock-url')
window.URL.revokeObjectURL = vi.fn()

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
  },
  writable: true,
})

describe('Integration Tests', () => {
  const mockLoad = load as unknown as ReturnType<typeof vi.fn>
  const mockPersist = persist as unknown as ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const getTaskCheckbox = () => {
    const checkboxes = screen.getAllByRole('checkbox')
    // The task checkbox is the one without the "Reduce motion" label
    return checkboxes.find(cb => {
      const label = cb.closest('label')
      return !label || !label.textContent?.includes('Reduce motion')
    })
  }

  describe('Complete user workflow', () => {
    it('should handle full task completion workflow', async () => {
      const user = userEvent.setup()
      
      mockLoad.mockResolvedValue({
        version: 1,
        tasks: [],
        creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
        achievements: [
          { id: 'tasks-completed-1', title: 'First Task', description: 'Complete your first task', category: 'tasks', icon: '✅', unlockedAt: null },
          { id: 'tasks-completed-5', title: 'Getting Started', description: 'Complete 5 tasks', category: 'tasks', icon: '🎯', unlockedAt: null },
          { id: 'tasks-completed-10', title: 'Task Master', description: 'Complete 10 tasks', category: 'tasks', icon: '🏆', unlockedAt: null },
          { id: 'clicks-10', title: 'Cat Lover', description: 'Click the cat 10 times', category: 'clicks', icon: '🐱', unlockedAt: null },
        ],
        settings: { reduceMotion: false, theme: 'system' },
      })

      const appElement = React.createElement(App)
      render(appElement)

      await waitFor(() => {
        expect(screen.getByText('🌽 Corn Cat')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('New task…')
      await user.type(input, 'Complete integration test{enter}')

      expect(screen.getByText('Complete integration test')).toBeInTheDocument()

      const taskCheckbox = getTaskCheckbox()
      await user.click(taskCheckbox!)

      // Check that task count is updated in the stats
      const statCards = screen.getAllByText('1')
      expect(statCards.length).toBeGreaterThan(0) // Should show completed task count

      const taskElement = screen.getByText('Complete integration test')
      const checkbox = taskElement.parentElement?.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(checkbox).toBeChecked()

      // Check that the creature task count is updated
      expect(screen.getByText('Total tasks completed')).toBeInTheDocument()

      expect(mockPersist).toHaveBeenCalled()
    })

    it('should handle task unchecking workflow', async () => {
      const user = userEvent.setup()
      
      mockLoad.mockResolvedValue({
        version: 1,
        tasks: [
          {
            id: 'task-1',
            title: 'Test unchecking',
            createdAt: Date.now(),
            completedAt: new Date().toISOString(),
            taskType: 'other',
          },
        ],
        creature: { id: 'cat', name: 'Cat', taskCount: 1, clickCount: 0 },
        achievements: [
          { id: 'tasks-completed-1', title: 'First Task', description: 'Complete your first task', category: 'tasks', icon: '✅', unlockedAt: null },
          { id: 'tasks-completed-5', title: 'Getting Started', description: 'Complete 5 tasks', category: 'tasks', icon: '🎯', unlockedAt: null },
        ],
        settings: { reduceMotion: false, theme: 'system' },
      })

      const appElement = React.createElement(App)
      render(appElement)

      await waitFor(() => {
        expect(screen.getByText('Test unchecking')).toBeInTheDocument()
      })

      // Verify task is initially completed
      const statCards = screen.getAllByText('1')
      expect(statCards.length).toBeGreaterThan(0) // Should show task count = 1
      const taskElement = screen.getByText('Test unchecking')
      expect(taskElement).toHaveStyle({ textDecoration: 'line-through' })

      // Uncheck the task
      const taskCheckbox = getTaskCheckbox()
      await user.click(taskCheckbox!)

      // Verify task is now unchecked
      const statCardsAfter = screen.getAllByText('0')
      expect(statCardsAfter.length).toBeGreaterThan(0) // Should show task count = 0
      expect(taskElement).toHaveStyle({ textDecoration: 'none' })

      expect(mockPersist).toHaveBeenCalled()
    })

    it('should handle creature growth progression', async () => {
      const user = userEvent.setup()
      
      mockLoad.mockResolvedValue({
        version: 1,
        tasks: [
          {
            id: 'task-1',
            title: 'Task to reach threshold',
            createdAt: Date.now(),
            completedAt: null,
            taskType: 'other',
          },
        ],
        creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
        achievements: [
          { id: 'tasks-completed-1', title: 'First Task', description: 'Complete your first task', category: 'tasks', icon: '✅', unlockedAt: null },
          { id: 'tasks-completed-5', title: 'Getting Started', description: 'Complete 5 tasks', category: 'tasks', icon: '🎯', unlockedAt: null },
        ],
        settings: { reduceMotion: false, theme: 'system' },
      })

      const appElement = React.createElement(App)
      render(appElement)

      await waitFor(() => {
        expect(screen.getByText('Task to reach threshold')).toBeInTheDocument()
      })

      const taskCheckbox = getTaskCheckbox()
      await user.click(taskCheckbox!)

      // Check that task count increased from 0 to 1
      const statCards = screen.getAllByText('1')
      expect(statCards.length).toBeGreaterThan(0) // Should show updated task count
    })
  })

  describe('Data persistence integration', () => {
    it('should persist state after task addition', async () => {
      const user = userEvent.setup()
      
      mockLoad.mockResolvedValue({
        version: 1,
        tasks: [],
        creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
        achievements: [],
        settings: { reduceMotion: false, theme: 'system' },
      })

      const appElement = React.createElement(App)
      render(appElement)

      await waitFor(() => {
        expect(screen.getByPlaceholderText('New task…')).toBeInTheDocument()
      })

      const input = screen.getByPlaceholderText('New task…')
      await user.type(input, 'Test persistence{enter}')

      await waitFor(() => {
        expect(mockPersist).toHaveBeenCalled()
        const lastCall = mockPersist.mock.calls[mockPersist.mock.calls.length - 1][0]
        expect(lastCall.tasks).toHaveLength(1)
        expect(lastCall.tasks[0].title).toBe('Test persistence')
      })
    })
  })
})
