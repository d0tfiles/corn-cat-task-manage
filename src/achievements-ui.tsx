import { useState, useEffect } from 'react'
import type { Achievement, AchievementCategory } from './types'
import { getAchievementsByCategory, getUnlockedAchievements, getLockedAchievements } from './achievements'

// Helper function to get the correct asset path
const getAssetPath = (path: string) => {
  const basePath = import.meta.env.BASE_URL || '/'
  return `${basePath}${path.startsWith('/') ? path.slice(1) : path}`
}

interface AchievementsProps {
  achievements: Achievement[]
  onClose: () => void
}

const categoryLabels: Record<AchievementCategory, string> = {
  tasks: '✅ Tasks',
  streaks: '🔥 Streaks',
  variety: '🎯 Variety',
  clicks: '🐱 Clicks',
  procrastinator: '😅 Procrastinator'
}

const categoryColors: Record<AchievementCategory, string> = {
  tasks: '#228B22',
  streaks: '#FF6B35',
  variety: '#9B59B6',
  clicks: '#FF69B4',
  procrastinator: '#FF4500'
}

export function Achievements({ achievements, onClose }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('tasks')
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([])

  const unlockedAchievements = getUnlockedAchievements(achievements)
  const lockedAchievements = getLockedAchievements(achievements)
  const categoryAchievements = getAchievementsByCategory(selectedCategory)

  useEffect(() => {
    // Check for newly unlocked achievements
    const newlyUnlockedIds = unlockedAchievements
      .filter(a => a.unlockedAt && Date.now() - a.unlockedAt < 5000) // Show for 5 seconds
      .map(a => a.id)
    
    if (newlyUnlockedIds.length > 0) {
      setNewlyUnlocked(newlyUnlockedIds)
      setTimeout(() => setNewlyUnlocked([]), 5000)
    }
  }, [achievements])

  return (
    <div className="achievements-modal">
      <div className="achievements-content">
        <div className="achievements-header">
          <h2>
            <img src={getAssetPath('cat-trophy.png')} alt="Trophy" className="achievement-header-icon" />
            Achievements
          </h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="achievements-stats">
          <div className="stat">
            <span className="stat-number">{unlockedAchievements.length}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat">
            <span className="stat-number">{lockedAchievements.length}</span>
            <span className="stat-label">Locked</span>
          </div>
          <div className="stat">
            <span className="stat-number">{Math.round((unlockedAchievements.length / achievements.length) * 100)}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>

        <div className="category-tabs">
          {Object.entries(categoryLabels).map(([category, label]) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category as AchievementCategory)}
              style={{
                borderColor: categoryColors[category as AchievementCategory]
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="achievements-list">
          {categoryAchievements.map(achievement => {
            const userAchievement = achievements.find(a => a.id === achievement.id)
            const isUnlocked = !!userAchievement?.unlockedAt
            const isNewlyUnlocked = newlyUnlocked.includes(achievement.id)

            return (
              <div
                key={achievement.id}
                className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'} ${isNewlyUnlocked ? 'newly-unlocked' : ''}`}
              >
                <div className="achievement-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-info">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                  {isUnlocked && (
                    <span className="achievement-date">
                      Unlocked {new Date(userAchievement.unlockedAt!).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="achievement-status">
                  {isUnlocked ? (
                    <span className="unlock-badge">✓</span>
                  ) : (
                    <span className="lock-badge">🔒</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
