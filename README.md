# 🌽 Corn Cat

A delightful task management app featuring a corn-loving cat companion! Complete tasks to make your corn cat happy and watch it pop popcorn when you click it! 🌽🍿

## Features

- **Corn Cat Character**: A cute corn-loving cat that reacts to your actions
- **Click Interaction**: Click on the cat to feed it corn and see popcorn pop out! 🍿
- **Task Management**: Add, complete, uncheck, and delete tasks with different categories
- **Cat Emotions**: The cat shows different emotions based on your actions:
  - Normal state: Default cat appearance
  - Overjoyed: When you complete a task
  - Tearful: When you delete a completed task
- **Achievement System**: Unlock achievements for:
  - Task completion milestones
  - Task creation milestones  
  - Consecutive day streaks
  - Task variety (different categories)
  - Cat click milestones
- **Data Persistence**: Your progress is automatically saved locally
- **Export/Import**: Backup and restore your data

## How to Use

1. **Add Tasks**: Type a task description and select a category, then click "Add"
2. **Complete Tasks**: Check the checkbox next to a task to mark it complete
3. **Uncheck Tasks**: Uncheck a completed task to undo the completion
4. **Delete Tasks**: Hover over a task and click the 🗑️ button to delete it
5. **Interact with Corn Cat**: Click on the cat to feed it corn and see popcorn animation! 🌽🍿
6. **View Achievements**: Click the achievements button to see your progress


## Technical Details

- **Framework**: React + TypeScript + Vite
- **State Management**: React hooks with local storage persistence
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS with animations and responsive design
- **PWA**: Progressive Web App with offline support

## Data Structure

The app saves data locally using IndexedDB with the following structure:

```typescript
interface SaveFile {
  version: number
  tasks: Task[]
  creature: {
    id: string
    name: string
    taskCount: number
    clickCount: number
  }
  achievements: Achievement[]
  settings: {
    reduceMotion: boolean
    theme: string
  }
}
```

## License

MIT License - feel free to use and modify as needed!

