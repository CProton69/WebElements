'use client'

import { useEffect, useState } from 'react'

export default function TestPreviewSystemPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
    console.log(result)
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    try {
      addResult('🧪 Starting preview system tests...')
      
      // Test 1: localStorage availability
      addResult('Test 1: Checking localStorage availability...')
      try {
        const testKey = '__preview_test__'
        localStorage.setItem(testKey, 'test')
        localStorage.removeItem(testKey)
        addResult('✅ localStorage is available')
      } catch (e) {
        addResult('❌ localStorage is not available: ' + e)
      }
      
      // Test 2: Create test data
      addResult('Test 2: Creating test data...')
      const testData = {
        elements: [
          {
            id: 'test-section',
            type: 'section',
            children: [
              {
                id: 'test-column',
                type: 'column',
                children: [
                  {
                    id: 'test-heading',
                    type: 'widget',
                    widgetType: 'heading',
                    children: [],
                    content: { text: 'Preview System Test' },
                    styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#92003b' },
                    props: {}
                  }
                ],
                content: {},
                styles: { padding: '40px 20px' },
                props: { width: 12 }
              }
            ],
            content: {},
            styles: { padding: '60px 0px', backgroundColor: '#f8f9fa' },
            props: {}
          }
        ]
      }
      addResult('✅ Test data created successfully')
      
      // Test 3: Save to localStorage
      addResult('Test 3: Saving test data to localStorage...')
      try {
        localStorage.setItem('pagebuilder-preview', JSON.stringify(testData))
        addResult('✅ Data saved to localStorage successfully')
      } catch (e) {
        addResult('❌ Failed to save to localStorage: ' + e)
      }
      
      // Test 4: Read from localStorage
      addResult('Test 4: Reading data from localStorage...')
      try {
        const savedData = localStorage.getItem('pagebuilder-preview')
        if (savedData) {
          const parsed = JSON.parse(savedData)
          addResult(`✅ Data read from localStorage successfully (${parsed.elements?.length || 0} elements)`)
        } else {
          addResult('❌ No data found in localStorage')
        }
      } catch (e) {
        addResult('❌ Failed to read from localStorage: ' + e)
      }
      
      // Test 5: URL parameter encoding
      addResult('Test 5: Testing URL parameter encoding...')
      try {
        const serialized = JSON.stringify(testData)
        const encoded = btoa(serialized)
        const decoded = atob(encoded)
        const parsed = JSON.parse(decoded)
        
        if (JSON.stringify(parsed) === JSON.stringify(testData)) {
          addResult('✅ URL parameter encoding/decoding works correctly')
        } else {
          addResult('❌ URL parameter encoding/decoding failed')
        }
      } catch (e) {
        addResult('❌ URL parameter encoding test failed: ' + e)
      }
      
      // Test 6: Custom events
      addResult('Test 6: Testing custom event system...')
      try {
        let eventReceived = false
        
        const handleTestEvent = (event: CustomEvent) => {
          if (event.detail && event.detail.elements) {
            eventReceived = true
          }
        }
        
        window.addEventListener('pagebuilder-update', handleTestEvent as EventListener)
        
        // Dispatch test event
        const testEvent = new CustomEvent('pagebuilder-update', {
          detail: { elements: testData.elements }
        })
        window.dispatchEvent(testEvent)
        
        // Small delay to allow event processing
        await new Promise(resolve => setTimeout(resolve, 100))
        
        window.removeEventListener('pagebuilder-update', handleTestEvent as EventListener)
        
        if (eventReceived) {
          addResult('✅ Custom event system works correctly')
        } else {
          addResult('❌ Custom event system failed')
        }
      } catch (e) {
        addResult('❌ Custom event test failed: ' + e)
      }
      
      // Test 7: Generate preview URL
      addResult('Test 7: Generating preview URL...')
      try {
        const serialized = JSON.stringify(testData)
        const encoded = btoa(serialized)
        const previewUrl = `/preview-direct?data=${encoded}`
        
        if (previewUrl.includes('/preview-direct?data=')) {
          addResult('✅ Preview URL generated successfully')
          addResult(`📎 Preview URL: ${previewUrl.substring(0, 100)}...`)
        } else {
          addResult('❌ Preview URL generation failed')
        }
      } catch (e) {
        addResult('❌ Preview URL generation failed: ' + e)
      }
      
      addResult('🎉 All tests completed!')
      
    } catch (error) {
      addResult('❌ Test suite failed: ' + error)
    } finally {
      setIsRunning(false)
    }
  }

  const openPreview = () => {
    try {
      const testData = {
        elements: [
          {
            id: 'test-section',
            type: 'section',
            children: [
              {
                id: 'test-column',
                type: 'column',
                children: [
                  {
                    id: 'test-heading',
                    type: 'widget',
                    widgetType: 'heading',
                    children: [],
                    content: { text: 'Preview System Test Successful!' },
                    styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#92003b' },
                    props: {}
                  },
                  {
                    id: 'test-text',
                    type: 'widget',
                    widgetType: 'text-editor',
                    children: [],
                    content: { html: '<p>If you can see this content, the preview system is working correctly!</p><p>This test page verifies that all components of the preview system are functioning properly.</p>' },
                    styles: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center' },
                    props: {}
                  },
                  {
                    id: 'test-button',
                    type: 'widget',
                    widgetType: 'button',
                    children: [],
                    content: { text: 'Test Complete!' },
                    styles: { 
                      backgroundColor: '#92003b', 
                      color: 'white', 
                      padding: '12px 24px', 
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '16px',
                      cursor: 'pointer',
                      margin: '20px auto',
                      display: 'block'
                    },
                    props: {}
                  }
                ],
                content: {},
                styles: { padding: '40px 20px', backgroundColor: '#ffffff' },
                props: { width: 12 }
              }
            ],
            content: {},
            styles: { padding: '60px 0px', backgroundColor: '#f8f9fa' },
            props: {}
          }
        ]
      }
      
      const serialized = JSON.stringify(testData)
      const encoded = btoa(serialized)
      const previewUrl = `/preview-direct?data=${encoded}`
      
      window.open(previewUrl, '_blank')
    } catch (error) {
      alert('Error opening preview: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Preview System Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page tests the WebElements preview system to ensure all components are working correctly.
              Click "Run Tests" to verify the system functionality.
            </p>
            
            <div className="flex gap-4 mb-6">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? 'Running Tests...' : 'Run Tests'}
              </button>
              
              <button
                onClick={openPreview}
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Open Test Preview
              </button>
              
              <button
                onClick={() => setTestResults([])}
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Results
              </button>
            </div>
          </div>
          
          <div className="border rounded-lg">
            <div className="bg-gray-100 px-4 py-2 border-b">
              <h2 className="font-semibold text-gray-700">Test Results</h2>
            </div>
            <div className="p-4">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No test results yet. Click "Run Tests" to start.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm font-mono ${
                        result.includes('✅') ? 'bg-green-50 text-green-800' :
                        result.includes('❌') ? 'bg-red-50 text-red-800' :
                        result.includes('🧪') || result.includes('🎉') ? 'bg-blue-50 text-blue-800' :
                        'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to Use</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Click "Run Tests" to verify the preview system components</li>
              <li>Check that all tests pass (✅)</li>
              <li>Click "Open Test Preview" to see a live preview</li>
              <li>The preview should open in a new tab with test content</li>
              <li>If any tests fail, check the browser console for details</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}