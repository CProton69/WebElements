'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPreviewPage() {
  const [testData, setTestData] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const createTestPage = () => {
    const testPage = {
      elements: [
        {
          id: 'section-1',
          type: 'section',
          children: [
            {
              id: 'column-1',
              type: 'column',
              children: [
                {
                  id: 'heading-1',
                  type: 'widget',
                  widgetType: 'heading',
                  content: { text: 'Test Page for Preview' },
                  styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center' },
                  children: [],
                  props: {}
                },
                {
                  id: 'text-1',
                  type: 'widget',
                  widgetType: 'text-editor',
                  content: { html: '<p>This is a test page created to verify that the preview system is working correctly. If you can see this content in the preview, then the system is functioning properly.</p>' },
                  styles: { fontSize: '16px', lineHeight: '1.6' },
                  children: [],
                  props: {}
                },
                {
                  id: 'button-1',
                  type: 'widget',
                  widgetType: 'button',
                  content: { text: 'Test Button' },
                  styles: { 
                    backgroundColor: '#92003b', 
                    color: 'white', 
                    padding: '12px 24px', 
                    borderRadius: '4px',
                    border: 'none'
                  },
                  children: [],
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

    // Save to localStorage
    try {
      localStorage.setItem('pagebuilder-preview', JSON.stringify(testPage))
      setTestData(testPage)
      console.log('Test page saved to localStorage')
      
      // Dispatch update event
      const updateEvent = new CustomEvent('pagebuilder-update', {
        detail: { elements: testPage.elements }
      })
      window.dispatchEvent(updateEvent)
      console.log('Update event dispatched')
      
      alert('Test page created! You can now open the preview to see it.')
    } catch (error) {
      console.error('Error creating test page:', error)
      alert('Error creating test page: ' + error)
    }
  }

  const openPreview = () => {
    const previewWindow = window.open('/preview', '_blank')
    if (!previewWindow) {
      alert('Please allow popups to open the preview window')
    }
  }

  const checkStorage = () => {
    try {
      const data = localStorage.getItem('pagebuilder-preview')
      if (data) {
        const parsed = JSON.parse(data)
        setTestData(parsed)
        alert(`Found data in localStorage with ${parsed.elements?.length || 0} elements`)
      } else {
        alert('No data found in localStorage')
      }
    } catch (error) {
      alert('Error checking storage: ' + error)
    }
  }

  const clearStorage = () => {
    try {
      localStorage.removeItem('pagebuilder-preview')
      setTestData(null)
      alert('Storage cleared')
    } catch (error) {
      alert('Error clearing storage: ' + error)
    }
  }

  useEffect(() => {
    // Check if there's already test data
    try {
      const data = localStorage.getItem('pagebuilder-preview')
      if (data) {
        setTestData(JSON.parse(data))
      }
    } catch (error) {
      console.error('Error loading existing data:', error)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Test Controls</h3>
                <Button onClick={createTestPage} className="w-full">
                  Create Test Page
                </Button>
                <Button onClick={openPreview} variant="outline" className="w-full">
                  Open Preview Window
                </Button>
                <Button onClick={checkStorage} variant="outline" className="w-full">
                  Check Storage
                </Button>
                <Button onClick={clearStorage} variant="destructive" className="w-full">
                  Clear Storage
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Quick Links</h3>
                <Button 
                  onClick={() => window.open('/', '_blank')} 
                  variant="outline" 
                  className="w-full"
                >
                  Open Page Builder
                </Button>
                <Button 
                  onClick={() => window.open('/preview-debug', '_blank')} 
                  variant="outline" 
                  className="w-full"
                >
                  Open Debug Tools
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {testData && (
          <Card>
            <CardHeader>
              <CardTitle>Current Test Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600 mb-2">
                  Elements in storage: {testData.elements?.length || 0}
                </p>
                <div className="text-xs font-mono bg-white p-2 rounded overflow-x-auto">
                  <pre>{JSON.stringify(testData, null, 2)}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Create Test Page" to create sample data</li>
              <li>Click "Check Storage" to verify data was saved</li>
              <li>Click "Open Preview Window" to see the preview</li>
              <li>The preview should show the test page content</li>
              <li>If it shows "Welcome to WebElements Preview", the storage system isn't working</li>
              <li>Use the debug tools for more detailed troubleshooting</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}