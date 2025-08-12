/**
 * Storage utilities for handling large data in the page builder
 * Provides compression, fallback mechanisms, and efficient storage strategies
 */

// Interface for storage options
export interface StorageOptions {
  compress?: boolean
  useIndexedDB?: boolean
  fallbackToMemory?: boolean
}

// Interface for storage result
export interface StorageResult {
  success: boolean
  error?: string
  size?: number
  method?: 'localStorage' | 'indexedDB' | 'memory'
}

// Memory storage fallback
const memoryStorage = new Map<string, string>()

// Check if localStorage is available and has space
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__localStorage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

// Check available localStorage space
export function getLocalStorageSpace(): { used: number; total: number; available: number } {
  if (!isLocalStorageAvailable()) {
    return { used: 0, total: 0, available: 0 }
  }

  let used = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      used += localStorage.getItem(key)?.length || 0
    }
  }

  // Estimate total space (typically 5MB, but varies by browser)
  const total = 5 * 1024 * 1024 // 5MB
  const available = total - used

  return { used, total, available }
}

// Simple string compression (using basic compression)
export function compressString(str: string): string {
  try {
    // For large strings, we can use a simple compression approach
    // This is a basic implementation - in production, consider using a proper compression library
    if (str.length < 1024) return str // Don't compress small strings
    
    // Simple compression: replace repeated patterns
    let compressed = str
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\s+/g, ' ')
      .trim()
    
    // If compression didn't help much, return original
    if (compressed.length >= str.length * 0.9) {
      return str
    }
    
    return `COMPRESSED:${btoa(compressed)}`
  } catch (e) {
    return str
  }
}

// Decompress string
export function decompressString(str: string): string {
  try {
    if (str.startsWith('COMPRESSED:')) {
      return atob(str.substring(10))
    }
    return str
  } catch (e) {
    return str
  }
}

// IndexedDB operations
class IndexedDBStorage {
  private dbName = 'PageBuilderDB'
  private storeName = 'pageBuilderData'
  private db: IDBDatabase | null = null

  async init(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        resolve(false)
        return
      }

      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => resolve(false)
      request.onsuccess = () => {
        this.db = request.result
        resolve(true)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async setItem(key: string, value: string): Promise<boolean> {
    if (!this.db) return false

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    })
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.db) return null

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    })
  }

  async removeItem(key: string): Promise<boolean> {
    if (!this.db) return false

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve(true)
      request.onerror = () => resolve(false)
    })
  }
}

const indexedDBStorage = new IndexedDBStorage()

// Main storage function with fallback mechanisms
export async function setStorageItem(
  key: string, 
  value: string, 
  options: StorageOptions = {}
): Promise<StorageResult> {
  const { compress = true, useIndexedDB = true, fallbackToMemory = true } = options
  
  let processedValue = value
  if (compress) {
    processedValue = compressString(value)
  }

  const size = new Blob([processedValue]).size

  // Try localStorage first
  if (isLocalStorageAvailable()) {
    const space = getLocalStorageSpace()
    if (space.available > size + 1024) { // Leave 1KB buffer
      try {
        localStorage.setItem(key, processedValue)
        return {
          success: true,
          size,
          method: 'localStorage'
        }
      } catch (e) {
        console.warn('localStorage failed, trying fallback:', e)
      }
    }
  }

  // Try IndexedDB
  if (useIndexedDB) {
    try {
      const initialized = await indexedDBStorage.init()
      if (initialized) {
        const success = await indexedDBStorage.setItem(key, processedValue)
        if (success) {
          return {
            success: true,
            size,
            method: 'indexedDB'
          }
        }
      }
    } catch (e) {
      console.warn('IndexedDB failed, trying fallback:', e)
    }
  }

  // Fallback to memory storage
  if (fallbackToMemory) {
    try {
      memoryStorage.set(key, processedValue)
      return {
        success: true,
        size,
        method: 'memory'
      }
    } catch (e) {
      console.warn('Memory storage failed:', e)
    }
  }

  return {
    success: false,
    error: 'All storage methods failed',
    size
  }
}

// Get item from storage (checks all fallbacks)
export async function getStorageItem(key: string): Promise<string | null> {
  // Try localStorage first
  if (isLocalStorageAvailable()) {
    const value = localStorage.getItem(key)
    if (value !== null) {
      return decompressString(value)
    }
  }

  // Try IndexedDB
  try {
    const value = await indexedDBStorage.getItem(key)
    if (value !== null) {
      return decompressString(value)
    }
  } catch (e) {
    console.warn('IndexedDB read failed:', e)
  }

  // Try memory storage
  const memoryValue = memoryStorage.get(key)
  if (memoryValue !== undefined) {
    return decompressString(memoryValue)
  }

  return null
}

// Remove item from storage
export async function removeStorageItem(key: string): Promise<boolean> {
  let success = false

  // Try localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(key)
      success = true
    } catch (e) {
      console.warn('localStorage remove failed:', e)
    }
  }

  // Try IndexedDB
  try {
    const dbSuccess = await indexedDBStorage.removeItem(key)
    success = success || dbSuccess
  } catch (e) {
    console.warn('IndexedDB remove failed:', e)
  }

  // Try memory storage
  success = success || memoryStorage.delete(key)

  return success
}

// Clear all storage
export async function clearStorage(): Promise<void> {
  // Clear localStorage
  if (isLocalStorageAvailable()) {
    try {
      localStorage.clear()
    } catch (e) {
      console.warn('localStorage clear failed:', e)
    }
  }

  // Clear IndexedDB
  try {
    await indexedDBStorage.removeItem('pagebuilder-preview')
  } catch (e) {
    console.warn('IndexedDB clear failed:', e)
  }

  // Clear memory storage
  memoryStorage.clear()
}

// Optimize page elements for storage
export function optimizePageElements(elements: any[]): any[] {
  return elements.map(element => {
    const optimized: any = {
      id: element.id,
      type: element.type,
      widgetType: element.widgetType,
      children: element.children ? optimizePageElements(element.children) : [],
      content: {},
      styles: element.styles || {},
      props: element.props || {}
    }

    // Optimize content - handle large data like images
    if (element.content) {
      Object.keys(element.content).forEach(key => {
        const value = element.content[key]
        
        // If it's a base64 image and large, store reference instead
        if (typeof value === 'string' && value.startsWith('data:image/') && value.length > 1000) {
          // For now, we'll keep a truncated version or reference
          // In a real implementation, you might want to upload to a server
          optimized.content[key] = `IMAGE:${value.substring(0, 50)}...`
        } else if (value !== null && value !== undefined && 
                   (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
          optimized.content[key] = value
        }
      })
    }

    return optimized
  })
}