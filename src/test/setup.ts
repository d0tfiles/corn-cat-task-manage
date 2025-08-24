import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localForage for tests
vi.mock('localforage', () => ({
  default: {
    config: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock structuredClone for tests
global.structuredClone = vi.fn((obj) => JSON.parse(JSON.stringify(obj)))

// Mock Audio API for tests
class MockAudio {
  volume = 1
  currentTime = 0
  play = vi.fn().mockResolvedValue(undefined)
  load = vi.fn()
  addEventListener = vi.fn()
  removeEventListener = vi.fn()
  dispatchEvent = vi.fn()
  pause = vi.fn()
  
  set onload(fn: () => void) {
    if (fn) fn()
  }
  
  set onerror(fn: () => void) {
    // Don't call error handler by default
  }
}

global.Audio = MockAudio as any

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

// Mock URL methods
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock service worker
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({}),
  },
  writable: true,
})
