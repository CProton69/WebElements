'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PreviewDebugPage() {
  const [storageInfo, setStorageInfo] = useState<any>({})
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
    console.log(result)
  }

  const testLocalStorage = () => {
    try {
      const data = localStorage.getItem('pagebuilder-preview')
      addResult(`localStorage direct access: ${data ? 'Found data' : 'No data'}`)
      if (data) {
        addResult(`localStorage data size: ${data.length} characters`)
        try {
          const parsed = JSON.parse(data)
          addResult(`localStorage parsed successfully: ${parsed.length} elements`)
        } catch (e) {
          addResult(`localStorage parse failed: ${e}`)
        }
      }
    } catch (e) {
      addResult(`localStorage access failed: ${e}`)
    }
  }

  const testStorageUtility = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { getStorageItem } = await import('@/lib/storage-utils')
      const data = await getStorageItem('pagebuilder-preview')
      addResult(`Storage utility: ${data ? 'Found data' : 'No data'}`)
      if (data) {
        addResult(`Storage utility data size: ${data.length} characters`)
        try {
          const parsed = JSON.parse(data)
          addResult(`Storage utility parsed successfully: ${parsed.length} elements`)
        } catch (e) {
          addResult(`Storage utility parse failed: ${e}`)
        }
      }
    } catch (e) {
      addResult(`Storage utility failed: ${e}`)
    }
  }

  const testCustomEvent = () => {
    addResult('Testing custom event listener...')
    
    const handleCustomUpdate = (event: CustomEvent) => {
      addResult(`Custom event received! Elements: ${event.detail?.elements?.length || 0}`)
    }

    window.addEventListener('pagebuilder-update', handleCustomUpdate as EventListener)
    
    // Test event
    const testEvent = new CustomEvent('pagebuilder-update', {
      detail: { elements: [{ id: 'test', type: 'widget' }] }
    })
    window.dispatchEvent(testEvent)
    
    setTimeout(() => {
      window.removeEventListener('pagebuilder-update', handleCustomUpdate as EventListener)
      addResult('Custom event test completed')
    }, 1000)
  }

  const createTestData = async () => {
    try {
      const testData = {
        timestamp: Date.now(),
        elements: [
          {
            id: 'test-element',
            type: 'widget',
            widgetType: 'heading',
            content: { text: 'Test Heading' },
            styles: { fontSize: '24px' },
            children: [],
            props: {}
          }
        ]
      }
      
      const serialized = JSON.stringify(testData)
      addResult(`Creating test data: ${serialized.length} characters`)
      
      // Test localStorage
      try {
        localStorage.setItem('pagebuilder-preview', serialized)
        addResult('Test data saved to localStorage')
      } catch (e) {
        addResult(`localStorage save failed: ${e}`)
      }
      
      // Test storage utility
      try {
        const { setStorageItem } = await import('@/lib/storage-utils')
        const result = await setStorageItem('pagebuilder-preview', serialized, {
          compress: true,
          useIndexedDB: true,
          fallbackToMemory: true
        })
        addResult(`Storage utility save: ${result.success ? 'Success' : 'Failed'} (${result.method})`)
      } catch (e) {
        addResult(`Storage utility save failed: ${e}`)
      }
    } catch (e) {
      addResult(`Create test data failed: ${e}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  useEffect(() => {
    // Get localStorage info
    try {
      let used = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) {
          used += localStorage.getItem(key)?.length || 0
        }
      }
      setStorageInfo({
        totalItems: localStorage.length,
        usedBytes: used,
        usedMB: (used / 1024 / 1024).toFixed(2)
      })
    } catch (e) {
      setStorageInfo({ error: e })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview System Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-semibold">localStorage Info</h3>
                <p>Items: {storageInfo.totalItems || 0}</p>
                <p>Used: {storageInfo.usedMB || 0} MB</p>
                <p>Bytes: {storageInfo.usedBytes || 0}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded">
                <h3 className="font-semibold">Test Controls</h3>
                <div className="space-y-2">
                  <Button onClick={testLocalStorage} size="sm" className="w-full">
                    Test localStorage
                  </Button>
                  <Button onClick={testStorageUtility} size="sm" className="w-full">
                    Test Storage Utility
                  </Button>
                  <Button onClick={testCustomEvent} size="sm" className="w-full">
                    Test Custom Event
                  </Button>
                  <Button onClick={createTestData} size="sm" className="w-full">
                    Create Test Data
                  </Button>
                  <Button onClick={clearResults} variant="outline" size="sm" className="w-full">
                    Clear Results
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded">
                <h3 className="font-semibold">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={() => window.open('/preview', '_blank')} 
                    size="sm" 
                    className="w-full"
                  >
                    Open Preview
                  </Button>
                  <Button 
                    onClick={() => window.open('/', '_blank')} 
                    size="sm" 
                    className="w-full"
                  >
                    Open Builder
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <div className="text-gray-500">No test results yet. Click the test buttons above.</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}