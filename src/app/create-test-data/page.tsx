'use client'

import { useEffect } from 'react'

export default function CreateTestDataPage() {
  useEffect(() => {
    // Create simple test data
    const testData = {
      elements: [
        {
          id: 'test-section-1',
          type: 'section',
          children: [
            {
              id: 'test-column-1',
              type: 'column',
              children: [
                {
                  id: 'test-heading-1',
                  type: 'widget',
                  widgetType: 'heading',
                  children: [],
                  content: { text: 'Test Page Created Successfully!' },
                  styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center', color: '#92003b' },
                  props: {}
                },
                {
                  id: 'test-text-1',
                  type: 'widget',
                  widgetType: 'text-editor',
                  children: [],
                  content: { html: '<p>If you can see this content in the preview, then the WebElements preview system is working correctly!</p><p>This test data was created automatically to verify the preview functionality.</p>' },
                  styles: { fontSize: '16px', lineHeight: '1.6', textAlign: 'center' },
                  props: {}
                },
                {
                  id: 'test-button-1',
                  type: 'widget',
                  widgetType: 'button',
                  children: [],
                  content: { text: 'Test Button Works!' },
                  styles: { 
                    backgroundColor: '#92003b', 
                    color: 'white', 
                    padding: '12px 24px', 
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '16px',
                    cursor: 'pointer'
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

    try {
      // Save to localStorage
      localStorage.setItem('pagebuilder-preview', JSON.stringify(testData))
      console.log('Test data saved to localStorage successfully')
      
      // Dispatch update event
      const updateEvent = new CustomEvent('pagebuilder-update', {
        detail: { elements: testData.elements }
      })
      window.dispatchEvent(updateEvent)
      console.log('Update event dispatched')
      
      // Show success message
      document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px;">
          <h1 style="color: #0ea5e9; margin-bottom: 16px;">✅ Test Data Created Successfully!</h1>
          <p style="margin-bottom: 16px;">Test data has been saved to localStorage and the preview system has been updated.</p>
          <h2 style="color: #374151; margin-bottom: 12px;">What to do next:</h2>
          <ol style="margin-left: 20px; margin-bottom: 16px;">
            <li style="margin-bottom: 8px;">Go to the main PageBuilder (<a href="/" style="color: #0ea5e9;">click here</a>)</li>
            <li style="margin-bottom: 8px;">Click the preview button (external link icon) in the top toolbar</li>
            <li style="margin-bottom: 8px;">The preview should open and show the test content</li>
            <li style="margin-bottom: 8px;">You should see a heading, text, and a pink button</li>
          </ol>
          <h2 style="color: #374151; margin-bottom: 12px;">Debugging Options:</h2>
          <ul style="margin-left: 20px;">
            <li style="margin-bottom: 8px;"><a href="/preview-simple" target="_blank" style="color: #0ea5e9;">Open Simple Preview</a> (with debug info)</li>
            <li style="margin-bottom: 8px;"><a href="/preview-debug" target="_blank" style="color: #0ea5e9;">Open Debug Tools</a></li>
            <li style="margin-bottom: 8px;"><a href="/test-preview" target="_blank" style="color: #0ea5e9;">Open Test Tools</a></li>
          </ul>
          <p style="margin-top: 16px; font-size: 14px; color: #6b7280;">
            If the preview still shows "Loading WebElements preview..." or doesn't show the test content, 
            check the browser console for error messages.
          </p>
        </div>
      `
    } catch (error) {
      console.error('Error creating test data:', error)
      document.body.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px;">
          <h1 style="color: #ef4444; margin-bottom: 16px;">❌ Error Creating Test Data</h1>
          <p style="margin-bottom: 16px;">An error occurred while creating test data:</p>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow-x: auto;">${error}</pre>
          <p style="margin-top: 16px;">Check the browser console for more details.</p>
        </div>
      `
    }
  }, [])

  return (
    <div>
      <p>Creating test data...</p>
    </div>
  )
}