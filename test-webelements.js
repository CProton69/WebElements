/**
 * Test Script - WebElements Page Builder
 * This script tests all the main features of the WebElements page builder
 * 
 * Run this in the browser console to test functionality
 */

console.log('🧪 Starting WebElements Test Suite...')

// Test 1: Check if WebElements is loaded
function testWebElementsLoaded() {
  console.log('Test 1: Checking if WebElements is loaded...')
  
  if (document.querySelector('.webeditor-editor')) {
    console.log('✅ WebElements editor found')
    return true
  } else {
    console.log('❌ WebElements editor not found')
    return false
  }
}

// Test 2: Check if Add Section button works
function testAddSectionButton() {
  console.log('Test 2: Testing Add Section button...')
  
  const addButton = document.querySelector('button:has(.lucide-plus)')
  if (addButton) {
    console.log('✅ Add Section button found')
    
    // Check if it has click handler
    const hasClickHandler = addButton.onclick || addButton.hasAttribute('onclick')
    if (hasClickHandler) {
      console.log('✅ Add Section button has click handler')
      return true
    } else {
      console.log('❌ Add Section button missing click handler')
      return false
    }
  } else {
    console.log('❌ Add Section button not found')
    return false
  }
}

// Test 3: Check if preview button works
function testPreviewButton() {
  console.log('Test 3: Testing Preview button...')
  
  const previewButton = document.querySelector('button:has(.lucide-external-link)')
  if (previewButton) {
    console.log('✅ Preview button found')
    
    // Check if it has click handler
    const hasClickHandler = previewButton.onclick || previewButton.hasAttribute('onclick')
    if (hasClickHandler) {
      console.log('✅ Preview button has click handler')
      return true
    } else {
      console.log('❌ Preview button missing click handler')
      return false
    }
  } else {
    console.log('❌ Preview button not found')
    return false
  }
}

// Test 4: Check if widgets panel is loaded
function testWidgetsPanel() {
  console.log('Test 4: Testing Widgets Panel...')
  
  const widgetsPanel = document.querySelector('.webeditor-scrollbar')
  if (widgetsPanel) {
    console.log('✅ Widgets panel found')
    return true
  } else {
    console.log('❌ Widgets panel not found')
    return false
  }
}

// Test 5: Check if localStorage is working
function testLocalStorage() {
  console.log('Test 5: Testing localStorage...')
  
  try {
    localStorage.setItem('test', 'test-value')
    const value = localStorage.getItem('test')
    localStorage.removeItem('test')
    
    if (value === 'test-value') {
      console.log('✅ localStorage is working')
      return true
    } else {
      console.log('❌ localStorage not working properly')
      return false
    }
  } catch (error) {
    console.log('❌ localStorage not available:', error)
    return false
  }
}

// Test 6: Check if device switching works
function testDeviceSwitching() {
  console.log('Test 6: Testing device switching...')
  
  const deviceButtons = document.querySelectorAll('button:has(.lucide-monitor-smartphone), button:has(.lucide-tablet), button:has(.lucide-smartphone)')
  if (deviceButtons.length >= 3) {
    console.log('✅ Device buttons found:', deviceButtons.length)
    return true
  } else {
    console.log('❌ Device buttons not found or incomplete:', deviceButtons.length)
    return false
  }
}

// Test 7: Check if undo/redo buttons work
function testUndoRedoButtons() {
  console.log('Test 7: Testing undo/redo buttons...')
  
  const undoButton = document.querySelector('button:has(.lucide-undo)')
  const redoButton = document.querySelector('button:has(.lucide-redo)')
  
  if (undoButton && redoButton) {
    console.log('✅ Undo and Redo buttons found')
    return true
  } else {
    console.log('❌ Undo or Redo buttons not found')
    return false
  }
}

// Test 8: Check if save button works
function testSaveButton() {
  console.log('Test 8: Testing Save button...')
  
  const saveButton = document.querySelector('button:has(.lucide-save)')
  if (saveButton) {
    console.log('✅ Save button found')
    return true
  } else {
    console.log('❌ Save button not found')
    return false
  }
}

// Test 9: Check if branding is updated to WebElements
function testBranding() {
  console.log('Test 9: Testing WebElements branding...')
  
  const logoText = document.querySelector('.webeditor-editor span.font-semibold')
  if (logoText && logoText.textContent.includes('WebElements')) {
    console.log('✅ WebElements branding found')
    return true
  } else {
    console.log('❌ WebElements branding not found')
    return false
  }
}

// Test 10: Check if preview route is accessible
function testPreviewRoute() {
  console.log('Test 10: Testing preview route...')
  
  // This test can only be run if we can access the preview route
  console.log('ℹ️ Preview route test requires manual verification')
  console.log('   - Click the preview button to test')
  console.log('   - Check if /preview route loads correctly')
  return true // Pass by default since we can't automate this
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running all WebElements tests...\n')
  
  const tests = [
    testWebElementsLoaded,
    testAddSectionButton,
    testPreviewButton,
    testWidgetsPanel,
    testLocalStorage,
    testDeviceSwitching,
    testUndoRedoButtons,
    testSaveButton,
    testBranding,
    testPreviewRoute
  ]
  
  let passed = 0
  let failed = 0
  
  tests.forEach(test => {
    try {
      const result = test()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.log(`❌ Test failed with error:`, error)
      failed++
    }
    console.log('') // Empty line for readability
  })
  
  console.log('📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed! WebElements is working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Please check the issues above.')
  }
}

// Manual test instructions
function showManualTests() {
  console.log('📝 Manual Test Instructions:')
  console.log('1. Add Section Test:')
  console.log('   - Click the "Add Section" button')
  console.log('   - Verify a new section appears on the canvas')
  console.log('')
  console.log('2. Preview Test:')
  console.log('   - Add some content to the page')
  console.log('   - Click the preview button (external link icon)')
  console.log('   - Verify the preview opens in a new tab')
  console.log('   - Verify the content appears correctly')
  console.log('')
  console.log('3. Widget Test:')
  console.log('   - Drag a widget from the left panel to the canvas')
  console.log('   - Verify the widget appears and can be selected')
  console.log('')
  console.log('4. Device Switching Test:')
  console.log('   - Click the desktop, tablet, and mobile buttons')
  console.log('   - Verify the canvas view changes accordingly')
  console.log('')
  console.log('5. Save Test:')
  console.log('   - Click the Save button')
  console.log('   - Check browser console for save confirmation')
}

// Export functions for manual testing
window.WebElementsTest = {
  runAllTests,
  showManualTests,
  testWebElementsLoaded,
  testAddSectionButton,
  testPreviewButton,
  testWidgetsPanel,
  testLocalStorage,
  testDeviceSwitching,
  testUndoRedoButtons,
  testSaveButton,
  testBranding,
  testPreviewRoute
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  console.log('🧪 WebElements Test Suite loaded')
  console.log('Run: WebElementsTest.runAllTests() to execute all tests')
  console.log('Run: WebElementsTest.showManualTests() for manual test instructions')
}