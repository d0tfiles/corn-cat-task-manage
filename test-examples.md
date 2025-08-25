# Testing Examples for Creature Tracker

This document provides examples of how to test different aspects of the Creature Tracker project.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test src/logic.test.ts
npm test src/storage.test.ts
npm test src/App.test.tsx
```

## Test Structure

### 1. Unit Tests (`src/logic.test.ts`, `src/storage.test.ts`)

Test individual functions and modules in isolation.

**Example: Testing creature feeding logic**
```typescript
import { describe, it, expect } from 'vitest'
import { feedCreature, thresholds } from './logic'

describe('feedCreature', () => {
  it('should feed creature and complete task', () => {
    const initialState = createMockState()
    const result = feedCreature(initialState, 'task-1')

    expect(result.creature.feedCount).toBe(1)
    expect(result.tasks.find(t => t.id === 'task-1')?.completedAt).toBeDefined()
  })
})
```

**Example: Testing storage operations**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { load, persist } from './storage'

describe('storage', () => {
  it('should return default state when no saved data exists', async () => {
    mockLocalForage.getItem.mockResolvedValue(null)
    const result = await load()
    expect(result).toEqual(expectedDefaultState)
  })
})
```

### 2. Component Tests (`src/App.test.tsx`)

Test React components using React Testing Library.

**Example: Testing component rendering and user interactions**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  it('should add new task', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const input = screen.getByPlaceholderText('New task…')
    await user.type(input, 'Test task{enter}')
    
    expect(screen.getByText('Test task')).toBeInTheDocument()
  })
})
```

### 3. Integration Tests (`src/integration.test.ts`)

Test interactions between different modules and complete user workflows.

**Example: Testing complete task completion workflow**
```typescript
describe('Complete user workflow', () => {
  it('should handle full task completion workflow', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Add task
    const input = screen.getByPlaceholderText('New task…')
    await user.type(input, 'Complete task{enter}')
    
    // Complete task
    const taskCheckbox = screen.getByRole('checkbox', { name: /complete task/i })
    await user.click(taskCheckbox)
    
    // Verify results
    expect(screen.getByText('1')).toBeInTheDocument() // feed count
    expect(mockPersist).toHaveBeenCalled() // state persisted
  })
})
```

## Testing Best Practices

### 1. Mocking External Dependencies

```typescript
// Mock localForage
vi.mock('localforage', () => ({
  default: {
    config: vi.fn(),
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}))

// Mock browser APIs
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid' },
})
```

### 2. Test Data Setup

```typescript
const createMockState = (overrides = {}) => ({
  version: 1,
  tasks: [],
  creature: { id: 'slime', name: 'Slime', feedCount: 0, stage: 0 },
  achievements: [],
  settings: { reduceMotion: false, theme: 'system' },
  ...overrides,
})
```

### 3. Async Testing

```typescript
it('should handle async operations', async () => {
  const result = await someAsyncFunction()
  expect(result).toBe(expectedValue)
})
```

### 4. User Interaction Testing

```typescript
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'text')
await user.keyboard('{Enter}')
```

## Test Coverage Areas

The test suite covers:

- ✅ **Core Logic**: Creature feeding mechanics, stage progression, achievement unlocking
- ✅ **Data Persistence**: Loading/saving state, error handling
- ✅ **User Interface**: Component rendering, user interactions, form handling
- ✅ **State Management**: React state updates, side effects
- ✅ **Edge Cases**: Error conditions, boundary values
- ✅ **Integration**: End-to-end workflows, module interactions

## Common Test Patterns

### Testing State Changes
```typescript
// Verify state was updated
expect(result.creature.feedCount).toBe(1)
expect(result.tasks[0].completedAt).toBeDefined()
```

### Testing Side Effects
```typescript
// Verify function was called
expect(mockPersist).toHaveBeenCalled()
expect(mockPersist).toHaveBeenCalledWith(expectedData)
```

### Testing UI Updates
```typescript
// Verify element is present
expect(screen.getByText('Task completed')).toBeInTheDocument()

// Verify element styling
expect(element).toHaveStyle({ textDecoration: 'line-through' })

// Verify element state
expect(checkbox).toBeChecked()
expect(button).toBeDisabled()
```

## Debugging Tests

### Using Test UI
```bash
npm run test:ui
```

### Running Specific Tests
```bash
npm test -- --run src/logic.test.ts
```

### Debug Mode
```bash
npm test -- --reporter=verbose
```

## Continuous Integration

The test setup is ready for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run tests with coverage
  run: npm run test:coverage
```

This comprehensive testing setup ensures the Creature Tracker application is reliable, maintainable, and bug-free.
