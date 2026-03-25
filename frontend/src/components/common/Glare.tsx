import React, { useRef } from 'react'

interface GlareProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export const Glare = ({ children, className = "", ...props }: GlareProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    containerRef.current.style.setProperty('--mouse-x', `${x}px`)
    containerRef.current.style.setProperty('--mouse-y', `${y}px`)
  }

  return (
    <div 
      ref={containerRef} 
      className={`glare-container ${className}`} 
      onMouseMove={handleMouseMove}
      {...props}
    >
      <div className="glare-effect" />
      <div className="glare-content">
        {children}
      </div>
    </div>
  )
}
