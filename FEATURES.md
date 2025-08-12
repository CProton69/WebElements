# WebElements - Local Development Guide

## 🚀 Features Added

### 1. Branding Update
- Changed all branding from "Elementor" to "WebElements"
- Updated logo from "E" to "W"
- Updated all CSS class names from `elementor-*` to `webeditor-*`
- Updated all documentation and comments

### 2. Fixed "Add Section" Button
The "Add Section" button in the top toolbar now works correctly. When clicked, it adds a new section with a column to your page.

### 3. Browser Preview Feature
Added a new preview button (external link icon) next to the existing preview button. This allows you to:
- Preview your page in a new browser tab
- See how your page looks without the editor interface
- Test your page in a clean environment
- Includes error handling and fallback mechanisms

### 4. App.js for Local Development
Created an `App.js` file that provides a simple entry point for local development. This file includes:
- Development server utilities
- Production build scripts
- Comprehensive documentation
- Quick start guide

## 🎯 How to Use the New Features

### Adding Sections
1. Click the "Add Section" button in the top toolbar (center of the toolbar)
2. A new section with a column will be added to your page
3. You can then drag widgets from the left panel into the section

### Previewing in Browser
1. Add some content to your page using the Add Section button or by dragging widgets
2. Click the external link icon (🔗) in the top toolbar
3. This will save your current page state and open it in a new tab
4. The preview shows your page without the editor interface
5. Use the "Close Preview" button to return to the editor

### Running Locally with App.js
The project already has a working development setup, but you can also use the App.js file:

**Current Setup (Recommended):**
```bash
npm run dev
```

**Alternative with App.js:**
```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## 🔧 Technical Details

### Branding Changes
- **TopToolbar**: Updated logo from "E" to "W" and name from "Elementor" to "WebElements"
- **CSS Classes**: All `elementor-*` classes changed to `webeditor-*`
- **ImportExport**: Updated exported HTML/CSS class names
- **Preview Page**: Updated branding and error handling
- **App.js**: Updated documentation and console messages

### Add Section Implementation
- Located in `src/components/page-builder/TopToolbar.tsx`
- Creates a new section element with proper structure
- Uses the existing `onElementAdd` callback
- Includes default styles and a single column

### Browser Preview Implementation
- Preview button in `src/components/page-builder/TopToolbar.tsx`
- Preview page at `src/app/preview/page.tsx`
- Saves page state to localStorage before opening preview
- Includes error handling and fallback mechanisms
- Renders all widgets in a clean, standalone environment

### App.js Features
- Standalone entry point for development
- Express server integration
- Static file serving
- Comprehensive documentation and examples

## 🧪 Testing

### Automated Testing
A comprehensive test suite is available in `test-webelements.js`:
- Tests all major features
- Can be run in browser console
- Provides detailed feedback on functionality

**How to run tests:**
1. Open the WebElements editor in your browser
2. Open browser console (F12)
3. Paste the contents of `test-webelements.js`
4. Run: `WebElementsTest.runAllTests()`

### Manual Testing
1. **Add Section**: Click the button and verify sections are added
2. **Preview**: Add content and click preview button
3. **Widgets**: Drag widgets from left panel to canvas
4. **Device Switching**: Test desktop/tablet/mobile views
5. **Save**: Verify save functionality works

## 🐛 Troubleshooting

### Add Section Not Working
If the "Add Section" button doesn't work:
1. Check browser console for errors
2. Ensure the page builder has loaded completely
3. Try refreshing the page
4. Run the test suite to verify functionality

### Preview Not Loading
If the preview page doesn't load:
1. Make sure you have added content to your page
2. Check that localStorage is enabled in your browser
3. Look for console errors in the preview tab
4. Ensure popups are allowed for the preview to open

### Local Development Issues
If you have trouble running locally:
1. Ensure all dependencies are installed: `npm install`
2. Check that port 3000 is available
3. Verify Node.js version (recommended: 16+)
4. Check the dev.log file for server errors

## 📝 Next Steps

The WebElements page builder now has:
- ✅ Complete branding update to WebElements
- ✅ Working "Add Section" functionality
- ✅ Browser preview capability with error handling
- ✅ Local development setup
- ✅ Comprehensive testing suite
- ✅ Complete documentation

You can now build complete web pages with a professional drag-and-drop interface using WebElements!