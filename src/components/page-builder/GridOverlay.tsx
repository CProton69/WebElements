'use client'

import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface GridOverlayProps {
  showGrid: boolean
  gridConfig: {
    columns: number
    gutterWidth: number
    rowHeight: number
  }
  containerWidth: number
  containerHeight: number
  className?: string
}

export function GridOverlay({ 
  showGrid, 
  gridConfig, 
  containerWidth, 
  containerHeight, 
  className 
}: GridOverlayProps) {
  const { columns, gutterWidth, rowHeight } = gridConfig

  const gridStyle = useMemo(() => {
    if (!showGrid) return {}

    const totalGutterWidth = (columns - 1) * gutterWidth
    const columnWidth = (containerWidth - totalGutterWidth) / columns

    const backgroundImage = `
      linear-gradient(to right, 
        transparent 0px, 
        transparent ${columnWidth}px, 
        rgba(156, 163, 175, 0.3) ${columnWidth}px, 
        rgba(156, 163, 175, 0.3) ${columnWidth + gutterWidth}px
      ),
      linear-gradient(to bottom, 
        transparent 0px, 
        transparent ${rowHeight}px, 
        rgba(156, 163, 175, 0.2) ${rowHeight}px, 
        rgba(156, 163, 175, 0.2) ${rowHeight + 1}px
      )
    `

    const backgroundSize = `${columnWidth + gutterWidth}px ${rowHeight + 1}px`

    return {
      backgroundImage,
      backgroundSize,
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat'
    }
  }, [showGrid, columns, gutterWidth, rowHeight, containerWidth])

  if (!showGrid) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none z-10',
        className
      )}
      style={gridStyle}
    />
  )
}

// Hook for snapping to grid
export function useGridSnapping(gridConfig: { columns: number; gutterWidth: number; rowHeight: number }) {
  const snapToGrid = (value: number, gridSize: number) => {
    return Math.round(value / gridSize) * gridSize
  }

  const snapPosition = (x: number, y: number, containerWidth: number) => {
    const { columns, gutterWidth, rowHeight } = gridConfig
    const totalGutterWidth = (columns - 1) * gutterWidth
    const columnWidth = (containerWidth - totalGutterWidth) / columns
    const columnGridSize = columnWidth + gutterWidth

    return {
      x: snapToGrid(x, columnGridSize),
      y: snapToGrid(y, rowHeight)
    }
  }

  const snapSize = (width: number, height: number, containerWidth: number) => {
    const { columns, gutterWidth, rowHeight } = gridConfig
    const totalGutterWidth = (columns - 1) * gutterWidth
    const columnWidth = (containerWidth - totalGutterWidth) / columns
    const columnGridSize = columnWidth + gutterWidth

    return {
      width: snapToGrid(width, columnGridSize),
      height: snapToGrid(height, rowHeight)
    }
  }

  const getGridInfo = (containerWidth: number) => {
    const { columns, gutterWidth, rowHeight } = gridConfig
    const totalGutterWidth = (columns - 1) * gutterWidth
    const columnWidth = (containerWidth - totalGutterWidth) / columns
    const columnGridSize = columnWidth + gutterWidth

    return {
      columnWidth,
      columnGridSize,
      rowHeight,
      columns,
      gutterWidth
    }
  }

  return {
    snapPosition,
    snapSize,
    getGridInfo,
    snapToGrid
  }
}