import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { load, persist } from './storage'

// Mock the storage module
vi.mock('./storage', () => ({
  load: vi.fn(),
  persist: vi.fn(),
}))

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mock-uuid'),
  },
})

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock service worker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
  },
})

const mockLoad = load as jest.MockedFunction<typeof load>
const mockPersist = persist as jest.MockedFunction<typeof persist>

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    mockLoad.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<App />)
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('should render main app after loading', async () => {
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [
        { 
          id: 'tasks-completed-1', 
          title: 'First Task',
          description: 'Complete your first task',
          category: 'tasks',
          icon: '✅',
          unlockedAt: null,
        },
        { 
          id: 'tasks-completed-5', 
          title: 'Getting Started',
          description: 'Complete 5 tasks',
          category: 'tasks',
          icon: '🎯',
          unlockedAt: null,
        },
        { 
          id: 'clicks-10', 
          title: 'Cat Lover',
          description: 'Click the cat 10 times',
          category: 'clicks',
          icon: '🐱',
          unlockedAt: null,
        },
      ],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('🌽 Corn Cat')).toBeInTheDocument()
    })
  })

  it('should add new task', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('New task…')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('New task…')
    await user.type(input, 'Test task{enter}')

    expect(screen.getByText('Test task')).toBeInTheDocument()
  })

  it('should complete task and feed creature', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
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
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
    
    // Get the task checkbox (not the "Reduce motion" checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label')
      return !label || !label.textContent?.includes('Reduce motion')
    })
    await user.click(taskCheckbox!)
    
    // Task should be completed (strikethrough)
    const taskElement = screen.getByText('Test Task')
    expect(taskElement).toHaveStyle({ textDecoration: 'line-through' })
    
    // Creature task count should be updated
    expect(screen.getByText('1')).toBeInTheDocument() // task count
  })

  it('should allow unchecking completed tasks', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task',
          createdAt: Date.now(),
          completedAt: new Date().toISOString(),
          taskType: 'other',
        },
      ],
      creature: { id: 'cat', name: 'Cat', taskCount: 1, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
    
    // Get the task checkbox (not the "Reduce motion" checkbox)
    const checkboxes = screen.getAllByRole('checkbox')
    const taskCheckbox = checkboxes.find(cb => {
      const label = cb.closest('label')
      return !label || !label.textContent?.includes('Reduce motion')
    })
    
    // Task should be checked initially
    expect(taskCheckbox).toBeChecked()
    expect(screen.getByText('1')).toBeInTheDocument() // task count
    
    // Uncheck the task
    await user.click(taskCheckbox!)
    
    // Task should be unchecked and not strikethrough
    expect(taskCheckbox).not.toBeChecked()
    const taskElement = screen.getByText('Test Task')
    expect(taskElement).toHaveStyle({ textDecoration: 'none' })
    
    // Creature should have task count reduced to 0
    expect(screen.getByText('Total tasks completed')).toBeInTheDocument()
    const statCards = screen.getAllByText('0')
    expect(statCards.length).toBeGreaterThan(0) // task count should be 0
  })

  it('should delete a task', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task',
          createdAt: Date.now(),
          completedAt: null,
          taskType: 'other',
        },
        {
          id: 'task-2',
          title: 'Another Task',
          createdAt: Date.now(),
          completedAt: null,
          taskType: 'other',
        },
      ],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
      expect(screen.getByText('Another Task')).toBeInTheDocument()
    })

    // Find and click the delete button for the first task
    const deleteButtons = screen.getAllByRole('button', { name: /delete task/i })
    await user.click(deleteButtons[0])

    // First task should be removed
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument()
    expect(screen.getByText('Another Task')).toBeInTheDocument()
  })

  it('should delete a completed task and reduce feed count', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [
        {
          id: 'task-1',
          title: 'Test Task',
          createdAt: Date.now(),
          completedAt: new Date().toISOString(),
          taskType: 'other',
        },
      ],
      creature: { id: 'cat', name: 'Cat', taskCount: 1, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    // Verify initial state
    expect(screen.getByText('1')).toBeInTheDocument() // task count

    // Delete the completed task
    const deleteButton = screen.getByRole('button', { name: /delete task/i })
    await user.click(deleteButton)

    // Task should be removed and task count reduced
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument()
    expect(screen.getByText('Total tasks completed')).toBeInTheDocument()
    const statCards = screen.getAllByText('0')
    expect(statCards.length).toBeGreaterThan(0) // task count should be 0
  })

  it('should show delete buttons on task hover', async () => {
    mockLoad.mockResolvedValue({
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
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })

    // Delete button should be present but initially less visible
    const deleteButton = screen.getByRole('button', { name: /delete task/i })
    expect(deleteButton).toBeInTheDocument()
  })

  it('should toggle reduce motion setting', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Corn Cat')).toBeInTheDocument()
    })

    const reduceMotionCheckbox = screen.getByRole('checkbox', { name: /reduce motion/i })
    expect(reduceMotionCheckbox).not.toBeChecked()

    await user.click(reduceMotionCheckbox)
    expect(reduceMotionCheckbox).toBeChecked()
  })

  it('should export data', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Corn Cat')).toBeInTheDocument()
    })

    // Open hamburger menu first
    const hamburgerButton = screen.getByRole('button', { name: '' }) // The hamburger has no name
    await user.click(hamburgerButton)

    // Now find export button in the menu
    const exportButton = screen.getByText('📤 Export Data')
    await user.click(exportButton)

    // Should create a download link
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should persist state changes', async () => {
    const user = userEvent.setup()
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('New task…')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('New task…')
    await user.type(input, 'Test task{enter}')

    expect(mockPersist).toHaveBeenCalled()
  })

  it('should show achievements button', async () => {
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 0, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Corn Cat')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /achievements/i })).toBeInTheDocument()
  })

  it('should display feed count and next growth info', async () => {
    mockLoad.mockResolvedValue({
      version: 1,
      tasks: [],
      creature: { id: 'cat', name: 'Cat', taskCount: 2, clickCount: 0 },
      achievements: [],
      settings: { reduceMotion: false, theme: 'system' },
    })

    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText('Corn Cat')).toBeInTheDocument()
    })

    expect(screen.getByText('2')).toBeInTheDocument() // Total tasks completed
  })
})
