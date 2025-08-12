// Real-time update system for pages and menus
import { useState, useEffect } from 'react'

export interface RealtimeUpdate {
  type: 'page' | 'menu' | 'page-menu'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
}

class RealtimeManager {
  private callbacks: Set<(update: RealtimeUpdate) => void> = new Set()
  private socket: any = null

  constructor() {
    // Initialize socket connection if available
    if (typeof window !== 'undefined') {
      this.initializeSocket()
    }
  }

  private initializeSocket() {
    // This would typically connect to a WebSocket server
    // For now, we'll use event-based updates
  }

  // Subscribe to real-time updates
  subscribe(callback: (update: RealtimeUpdate) => void) {
    this.callbacks.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback)
    }
  }

  // Broadcast an update to all subscribers
  broadcast(update: RealtimeUpdate) {
    console.log('Broadcasting real-time update:', update)
    
    // Notify all subscribers
    this.callbacks.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in realtime callback:', error)
      }
    })

    // Also dispatch a custom event for cross-component communication
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('realtime-update', {
        detail: update
      })
      window.dispatchEvent(event)
    }
  }

  // Specific update methods
  broadcastPageUpdate(action: 'create' | 'update' | 'delete', pageData: any) {
    this.broadcast({
      type: 'page',
      action,
      data: pageData,
      timestamp: Date.now()
    })
  }

  broadcastMenuUpdate(action: 'create' | 'update' | 'delete', menuData: any) {
    this.broadcast({
      type: 'menu',
      action,
      data: menuData,
      timestamp: Date.now()
    })
  }

  broadcastPageMenuUpdate(pageData: any) {
    this.broadcast({
      type: 'page-menu',
      action: 'update',
      data: pageData,
      timestamp: Date.now()
    })
  }
}

// Global instance
export const realtimeManager = new RealtimeManager()

// Hook for components to use real-time updates
export function useRealtimeUpdates() {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([])

  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((update) => {
      setUpdates(prev => [...prev.slice(-49), update]) // Keep last 50 updates
    })

    return unsubscribe
  }, [])

  return { updates, broadcast: realtimeManager.broadcast.bind(realtimeManager) }
}