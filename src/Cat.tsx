import React, { useRef, useEffect, useState } from 'react'

interface CatProps {
  isOverjoyed: boolean
  isTearful: boolean
  isAnnoyed: boolean
  reduceMotion: boolean
  isInPunishmentPeriod: boolean
  onClick: () => void
}

export function Cat({ isOverjoyed, isTearful, isAnnoyed, reduceMotion, isInPunishmentPeriod, onClick }: CatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const popcornImgRef = useRef<HTMLImageElement | null>(null)
  const [popcornVisible, setPopcornVisible] = useState(false)
  const [popcornPosition, setPopcornPosition] = useState({ x: 0, y: 0 })
  
  // Preload popcorn image for faster animation
  useEffect(() => {
    popcornImgRef.current = new Image()
    popcornImgRef.current.onload = () => {}
    popcornImgRef.current.onerror = () => {}
    popcornImgRef.current.src = `${import.meta.env.BASE_URL}popcorn.png`
  }, [])



  // Determine which cat image to show
  const getCatImage = () => {
    const basePath = import.meta.env.BASE_URL
    if (isAnnoyed) return `${basePath}cat-annoyed.png`
    if (isTearful) return `${basePath}cat-tearful.png`
    if (isOverjoyed) return `${basePath}cat-overjoyed.png`

    return `${basePath}cat.png`
  }

  // Handle cat click
  const handleCatClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isInPunishmentPeriod) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Check if click is within cat bounds (scaled cat is centered)
    const maxWidth = canvas.width * 0.8
    const maxHeight = canvas.height * 0.8
    const catX = (canvas.width - maxWidth) / 2
    const catY = (canvas.height - maxHeight) / 2

    if (x >= catX && x <= catX + maxWidth && y >= catY && y <= catY + maxHeight) {
      // Always show popcorn animation on click
      setPopcornPosition({ x, y })
      setPopcornVisible(true)
      
      // Hide popcorn after shorter animation
      setTimeout(() => {
        setPopcornVisible(false)
      }, 250)
      
      // Call the onClick handler (which will handle sound and state update)
      onClick()
    }
  }

  // Store the current cat image in a ref for reuse
  const catImgRef = useRef<HTMLImageElement | null>(null)
  
  // Redraw canvas when needed
  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas with themed background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim()
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw cat if image is loaded
    if (catImgRef.current) {
      const maxWidth = canvas.width * 0.8
      const maxHeight = canvas.height * 0.8
      const scale = Math.min(maxWidth / catImgRef.current.width, maxHeight / catImgRef.current.height)
      
      const scaledWidth = catImgRef.current.width * scale
      const scaledHeight = catImgRef.current.height * scale
      
      // Center the cat
      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2
      
      ctx.drawImage(catImgRef.current, x, y, scaledWidth, scaledHeight)
    }
    
    // Draw popcorn AFTER cat (so it appears in front)
    if (popcornVisible && popcornImgRef.current) {
      const size = 60
      ctx.save()
      ctx.globalAlpha = 0.9
      ctx.drawImage(popcornImgRef.current, popcornPosition.x - size/2, popcornPosition.y - size/2, size, size)
      ctx.restore()
    }
  }

  // Load cat image when cat state changes
  useEffect(() => {
    const newImg = new Image()
    newImg.onload = () => {
      catImgRef.current = newImg
      redrawCanvas()
    }
    newImg.src = getCatImage()
  }, [isOverjoyed, isTearful, isAnnoyed, isInPunishmentPeriod])



  // Redraw when popcorn state changes
  useEffect(() => {
    redrawCanvas()
  }, [popcornVisible, popcornPosition])

  return (
    <div className="cat-wrapper">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        onClick={handleCatClick}
        style={{ 
          cursor: isInPunishmentPeriod ? 'not-allowed' : `url('${import.meta.env.BASE_URL}pointer.png'), pointer`,
          opacity: isInPunishmentPeriod ? 0.5 : 1,
          filter: isInPunishmentPeriod ? 'grayscale(50%)' : 'none'
        }}

        className={
          reduceMotion 
            ? '' // No animations when motion is reduced
            : isAnnoyed ? 'cat-annoyed' : isOverjoyed ? 'cat-overjoyed' : isTearful ? 'cat-tearful' : ''
        }
      />
    </div>
  )
}

