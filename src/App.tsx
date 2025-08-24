import { useEffect, useRef, useState } from 'react'
import localforage from 'localforage'
import './App.css'
import { load, persist } from './storage'
import type { SaveFile, Task, TaskType, Achievement } from './types'
import { completeTaskForCreature, deleteTask, clickCat } from './logic'
import { Achievements } from './achievements-ui'
import { Cat } from './Cat'



const TASK_TYPES: { value: TaskType; label: string; icon: string }[] = [
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'learning', label: 'Learning', icon: '📚' },
  { value: 'hobby', label: 'Hobby', icon: '🎨' },
  { value: 'chore', label: 'Chore', icon: '🧹' },
  { value: 'finance', label: 'Finance', icon: '💰' },
  { value: 'personal', label: 'Personal', icon: '🎯' },
  { value: 'creative', label: 'Creative', icon: '🎭' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'other', label: 'Other', icon: '📝' },
]

export default function App() {
  const [state, setState] = useState<SaveFile | null>(null)
  const [newTask, setNewTask] = useState('')
  const [newTaskType, setNewTaskType] = useState<TaskType>('other')
  const [animTick, setAnimTick] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [catEmotion, setCatEmotion] = useState<'normal' | 'overjoyed' | 'tearful' | 'annoyed'>('normal')
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isInPunishmentPeriod, setIsInPunishmentPeriod] = useState(false)
  const [punishmentEndTime, setPunishmentEndTime] = useState(0)

            const audioPoolRef = useRef<HTMLAudioElement[]>([])
          const audioIndexRef = useRef(0)
          const recentClicksRef = useRef<number[]>([])
          const angryMeowRef = useRef<HTMLAudioElement | null>(null)
          const sweetMeowRef = useRef<HTMLAudioElement | null>(null)
          const sparkleRef = useRef<HTMLAudioElement | null>(null)

            useEffect(() => {
            load().then(s => {

              setState(s)
              setReduceMotion(s.settings.reduceMotion)
              setTheme(s.settings.theme as 'dark' | 'light')
            })
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>{})
    }
    
                // Create audio pool for better performance
            for (let i = 0; i < 5; i++) {
              const audio = new Audio(`${import.meta.env.BASE_URL}pop.mp3`)
              audio.volume = 0.3
              audio.load()
              audioPoolRef.current.push(audio)
            }

            
            // Preload other sound effects
            angryMeowRef.current = new Audio(`${import.meta.env.BASE_URL}angry-meow.wav`)
            angryMeowRef.current.volume = 0.4
            angryMeowRef.current.load()
            
            sweetMeowRef.current = new Audio(`${import.meta.env.BASE_URL}sweet-kitty-meow.wav`)
            sweetMeowRef.current.volume = 0.4
            sweetMeowRef.current.load()
            
            sparkleRef.current = new Audio(`${import.meta.env.BASE_URL}twinkle-sparkle-sfx.mp3`)
            sparkleRef.current.volume = 0.5
            sparkleRef.current.load()
            

  }, [])



  // Check punishment period status
  useEffect(() => {
    if (isInPunishmentPeriod && punishmentEndTime > 0) {
      const checkPunishment = () => {
        const now = Date.now()
        if (now >= punishmentEndTime) {
          setIsInPunishmentPeriod(false)
          setPunishmentEndTime(0)
          // Clear recent clicks when punishment ends
          recentClicksRef.current = []
        }
      }
      
      const interval = setInterval(checkPunishment, 1000)
      return () => clearInterval(interval)
    }
  }, [isInPunishmentPeriod, punishmentEndTime])

  // Timer to refresh click allowance display (every second)
  useEffect(() => {
    const interval = setInterval(() => {
      // Clean up old clicks for procrastinator detection
      const now = Date.now()
      recentClicksRef.current = recentClicksRef.current.filter(
        timestamp => now - timestamp < 60000
      )
      
      // Force re-render every second to keep UI in sync
      setAnimTick(x => x + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [state])

            useEffect(() => {
            if (state) {

              persist(state)
            }
          }, [state])

  // Helper function to detect newly unlocked achievements
  function checkForNewAchievements(oldAchievements: Achievement[], newAchievements: Achievement[]) {
    const newlyUnlocked = newAchievements.find(newAch => 
      newAch.unlockedAt && !oldAchievements.find(oldAch => 
        oldAch.id === newAch.id && oldAch.unlockedAt
      )
    )
    
    if (newlyUnlocked) {
      setNewAchievement(newlyUnlocked)
      
      // Play sparkle sound effect
      if (!reduceMotion && sparkleRef.current) {
        sparkleRef.current.currentTime = 0
        sparkleRef.current.play()
      }
      
      // Auto-hide after 4 seconds
              setTimeout(() => setNewAchievement(null), 5000)
    }
  }

  // Helper function to get click status information
  function getClickStatus() {
    if (!state) return { allowance: 0, used: 0, timeLeft: 0 }
    
    const now = Date.now()
    const clickThreshold = 30 + (state.creature.taskCount * 10)
    
    // Clean up old clicks and get current count
    const recentClicks = recentClicksRef.current.filter(
      timestamp => now - timestamp < 60000
    )
    
    const timeLeft = isInPunishmentPeriod ? Math.max(0, punishmentEndTime - now) : 0
    
    return {
      allowance: clickThreshold,
      used: recentClicks.length,
      timeLeft: Math.ceil(timeLeft / 1000)
    }
  }

  // Theme management
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    
    // Update state if it exists
    if (state) {
      setState({
        ...state,
        settings: {
          ...state.settings,
          theme: newTheme
        }
      })
    }
  }

  // Apply theme on mount and theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function addTask() {
    if (!state || !newTask.trim()) return
    const t: Task = { 
      id: crypto.randomUUID(), 
      title: newTask.trim(), 
      taskType: newTaskType,
      createdAt: Date.now(),
      completedAt: null
    }
    setState({ ...state, tasks: [t, ...state.tasks] })
    setNewTask('')
    setNewTaskType('other')
  }

    function playFeedSound() {
    if (reduceMotion) return
    // Use audio pool for faster, more reliable playback
    if (audioPoolRef.current.length > 0) {
      const audio = audioPoolRef.current[audioIndexRef.current]
      audio.currentTime = 0
      audio.play()
      // Cycle through audio pool for overlapping sounds
      audioIndexRef.current = (audioIndexRef.current + 1) % audioPoolRef.current.length
    }
  }

            function onComplete(id: string) {
            if (!state) return
            
            // Check if the task is currently uncompleted (will be completed)
            const currentTask = state.tasks.find(task => task.id === id)
            const willComplete = !currentTask?.completedAt
            
            const next = completeTaskForCreature(state, id)
            
            // Check for new achievements
            checkForNewAchievements(state.achievements, next.achievements)
            
            setState(next)
            
            // Only play sound and animation if we're actually completing the task
            if (willComplete) {
              // trigger completion animation and play sweet meow
              setAnimTick(x => x + 1)
              
              // Reward: End punishment period and reset click allowance when task is completed
              if (isInPunishmentPeriod) {
                setIsInPunishmentPeriod(false)
                setPunishmentEndTime(0)
              }
              
              // Always reset recent clicks when a task is completed
              recentClicksRef.current = []
              
              // Only show emotion animation if motion is not reduced
              if (!reduceMotion) {
                setCatEmotion('overjoyed')
                // Reset emotion after animation
                setTimeout(() => setCatEmotion('normal'), 2000)
              }
              
              // Play sweet kitty meow sound
              if (!reduceMotion && sweetMeowRef.current) {
                sweetMeowRef.current.currentTime = 0
                sweetMeowRef.current.play()
              }
            }
          }

  function onDelete(id: string) {
    if (!state) return
    const taskToDelete = state.tasks.find(task => task.id === id)
    const wasCompleted = taskToDelete?.completedAt != null
    
    const result = deleteTask(state.tasks, state.creature, state.achievements, id)
    setState({
      ...state,
      ...result
    })
    
    // Show tearful animation if deleting a completed task (only if motion is not reduced)
    if (wasCompleted && !reduceMotion) {
      setCatEmotion('tearful')
      setTimeout(() => setCatEmotion('normal'), 2000)
    }
  }

  function exportData() {
    if (!state) return
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'corn-cat-save.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        setState(parsed)
        setReduceMotion(!!parsed?.settings?.reduceMotion)
      } catch {
        alert('Invalid file')
      }
    }
    reader.readAsText(file)
  }

  if (!state) return <div style={{padding:24}}>Loading…</div>

  return (
    <div style={{maxWidth:940, margin:'0 auto', padding:24, display:'grid', gap:16}}>
      <header className="row">
        <div className="header-left">
          <button 
            className="hamburger-menu"
            onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
          >
            <span className={`hamburger-icon ${showHamburgerMenu ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
          <h1 style={{margin:0, fontSize:28, display:'flex', alignItems:'center', gap:'12px'}}>
            Corn Cat
            <img src={`${import.meta.env.BASE_URL}cat-head.png`} alt="Cat Head" className="header-cat-icon" />
          </h1>
        </div>
        <div className="toolbar">
          <button onClick={() => setShowAchievements(true)} className="achievements-button">
            <img src={`${import.meta.env.BASE_URL}cat-trophy.png`} alt="Trophy" className="button-icon" />
            <span>Achievements</span>
          </button>
          <button onClick={toggleTheme} className="theme-toggle-button" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {showHamburgerMenu && (
        <div className="hamburger-overlay" onClick={() => setShowHamburgerMenu(false)}>
          <div className="hamburger-menu-panel" onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0, marginBottom:16}}>Menu</h3>
            <div className="menu-section">
              <button onClick={() => {
                setShowAbout(true)
                setShowHamburgerMenu(false)
              }} className="menu-item">ℹ️ About</button>
            </div>
            <div className="menu-section">
              <button onClick={exportData} className="menu-item">📤 Export Data</button>
              <label className="menu-item">
                <input type="file" accept="application/json" onChange={importData} style={{display:'none'}} id="importfile"/>
                <span role="button" onClick={() => document.getElementById('importfile')?.click()} tabIndex={0}>📥 Import Data</span>
              </label>
              <button onClick={async () => {
                if (confirm('This will clear all data. Are you sure?')) {
                  await localforage.clear()
                  window.location.reload()
                }
              }} className="menu-item danger">🗑️ Clear All Data</button>
            </div>
          </div>
        </div>
      )}

      <section className="card">
        <Cat 
          key={`cat-${isInPunishmentPeriod}`}
          isOverjoyed={catEmotion === 'overjoyed'}
          isTearful={catEmotion === 'tearful'}
          isAnnoyed={catEmotion === 'annoyed'}
          reduceMotion={reduceMotion}
          isInPunishmentPeriod={isInPunishmentPeriod}
          onClick={() => {
            // Handle cat click
            if (state) {
              // Check if we're in punishment period - if so, ignore clicks
              if (isInPunishmentPeriod) {
                return // No clicks allowed during punishment
              }
              // Track recent clicks with timer mechanism
              const now = Date.now()
              
              // Remove clicks older than 1 minute (sliding window)
              recentClicksRef.current = recentClicksRef.current.filter(
                timestamp => now - timestamp < 60000
              )
              
              // Add the click to our tracking
              recentClicksRef.current.push(now)
              
              // Force re-render to update click counter display
              setAnimTick(x => x + 1)
              
              // Click allowance: starts at 30/min, then 40/min, 50/min, etc.
              const clickThreshold = 30 + (state.creature.taskCount * 10)
              const recentClicksCount = recentClicksRef.current.length
              
              // Check if click allowance exceeded
              if (recentClicksCount >= clickThreshold) {
                // Start punishment period (1 minute from now)
                const punishmentDuration = 1 * 60 * 1000 // 1 minute
                setIsInPunishmentPeriod(true)
                setPunishmentEndTime(now + punishmentDuration)
                
                // Show annoyed animation
                if (!reduceMotion) {
                  setCatEmotion('annoyed')
                  setTimeout(() => setCatEmotion('normal'), 3000)
                }
                
                // Play angry meow sound
                if (!reduceMotion && angryMeowRef.current) {
                  angryMeowRef.current.currentTime = 0
                  angryMeowRef.current.play()
                }
              }
              

              
              // Play sound immediately for better responsiveness
              playFeedSound()
              
              const result = clickCat(state.creature, state.achievements, recentClicksCount)

              // Check for new achievements
              checkForNewAchievements(state.achievements, result.achievements)

              setState({
                ...state,
                ...result
              })
            }
          }}
        />
        
        <div className="reduce-motion-container">
          <label className="reduce-motion-toggle">
            <input type="checkbox" checked={reduceMotion} onChange={(e)=>{
              setReduceMotion(e.target.checked)
              setState({...state, settings:{...state.settings, reduceMotion:e.target.checked}})
            }} />
            <span>Reduce motion/sound</span>
          </label>

        </div>
        
        <div className="stats-container">
          <div className="stat-card">
            <div className="muted">Total tasks completed</div>
            <div style={{fontSize:24, fontWeight:700}}>{state.creature.taskCount}</div>
          </div>
          
          {/* Click Status Display */}
          {state && (() => {
            const clickStatus = getClickStatus()
            return (
              <div className={`stat-card click-status-stat ${isInPunishmentPeriod ? 'punishment' : ''}`}>
                <div className="muted">Clicks this minute</div>
                <div style={{fontSize:24, fontWeight:700, color: isInPunishmentPeriod ? '#dc2626' : '#3b82f6'}}>
                  {clickStatus.used}/{clickStatus.allowance}
                </div>
                {isInPunishmentPeriod && clickStatus.timeLeft > 0 && (
                  <div className="cooldown-timer-inline">
                    ⏱️ {clickStatus.timeLeft}s
                  </div>
                )}
              </div>
            )
          })()}
          
          <div className="stat-card">
            <div className="muted">Total clicks</div>
            <div style={{fontSize:24, fontWeight:700}}>{state.creature.clickCount}</div>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 style={{marginTop:0, textAlign:'center'}}>Tasks</h2>
        <div className="task-entry-container">
          <input
            value={newTask}
            onChange={e=>setNewTask(e.target.value)}
            placeholder="New task…"
            className="task-input"
            onKeyDown={(e)=>{ if(e.key==='Enter') addTask() }}
          />
          <select
            value={newTaskType}
            onChange={e => setNewTaskType(e.target.value as TaskType)}
            className="task-type-select"
          >
            {TASK_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          <button onClick={addTask} className="add-task-button">Add</button>
        </div>
        <ul className="task-list">
          {state.tasks.map(t => (
            <li className="task-item" key={t.id}>
              <span className="task-type-icon">
                {TASK_TYPES.find(type => type.value === t.taskType)?.icon || '📝'}
              </span>
              <span className="task-title" style={{textDecoration: t.completedAt ? 'line-through' : 'none'}}>{t.title}</span>
              <div className="task-actions">
                <button 
                  onClick={() => onDelete(t.id)}
                  className="delete-button"
                  aria-label={`Delete task: ${t.title}`}
                  title="Delete task"
                >
                  🗑️
                </button>
                <input type="checkbox" checked={!!t.completedAt} onChange={()=>onComplete(t.id)} />
              </div>
            </li>
          ))}
        </ul>
        {state.tasks.length === 0 && <p className="muted">Create a task, then check it off to make your cat happy!</p>}
      </section>



      <footer className="muted" style={{textAlign:'center'}}>
        Offline-ready PWA. Your data lives in your browser (IndexedDB via localForage).
      </footer>

      {showAchievements && (
        <Achievements 
          achievements={state.achievements} 
          onClose={() => setShowAchievements(false)} 
        />
      )}

      {newAchievement && (
        <div className="achievement-notification">
          <div className="achievement-content">
            <div className="achievement-header">
              <img src={`${import.meta.env.BASE_URL}cat-trophy.png`} alt="Trophy" className="achievement-trophy" />
              <span className="achievement-title">Achievement Unlocked!</span>
            </div>
            <div className="achievement-body">
              <span className="achievement-icon">{newAchievement.icon}</span>
              <div className="achievement-text">
                <div className="achievement-name">{newAchievement.title}</div>
                <div className="achievement-description">{newAchievement.description}</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* About Overlay */}
      {showAbout && (
        <div className="about-overlay" onClick={() => setShowAbout(false)}>
          <div className="about-content" onClick={e => e.stopPropagation()}>
            <div className="about-header">
              <h2>About Corn Cat</h2>
              <button 
                className="about-close"
                onClick={() => setShowAbout(false)}
                aria-label="Close about dialog"
              >
                ×
              </button>
            </div>
            <div className="about-body">
              <div className="about-section">
                <h3>Your Productivity Companion</h3>
                <p>Corn Cat is your friendly task management companion that accompanies your productivity!</p>
              </div>
              
              <div className="about-section">
                <h3>Task Management</h3>
                <ul>
                  <li>Add tasks with different categories (work, health, social, etc.)</li>
                  <li>Complete tasks to see your cat happy!</li>
                  <li>Delete tasks by hovering and clicking the trash icon</li>
                </ul>
              </div>

              <div className="about-section">
                <h3>Click System</h3>
                <ul>
                  <li>Click your cat to pop some popcorn!</li>
                  <li>Start with 30 clicks per minute allowance</li>
                  <li>Complete tasks to increase your click allowance (40, 50, 60+ clicks/min)</li>
                  <li>Exceed your allowance and face a 1-minute cooldown period!</li>
                </ul>
              </div>

              <div className="about-section">
                <h3>Achievements</h3>
                <ul>
                  <li>Unlock achievements for completing tasks and clicking milestones</li>
                  <li>View your achievement progress in the Achievements section</li>
                  <li>Each achievement celebrates your productivity journey</li>
                </ul>
              </div>

              <div className="about-section">
                <h3>Customization</h3>
                <ul>
                  <li>Toggle "Reduce Motion/Sound" to minimize animations and sounds</li>
                  <li>Export/import your data for backup and sharing</li>
                  <li>Your progress is automatically saved locally</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
