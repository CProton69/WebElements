/**
 * App.js - Local Development Entry Point
 * This file provides a simple way to run the WebElements page builder locally
 * 
 * Usage:
 * 1. Make sure you have Node.js installed
 * 2. Install dependencies: npm install
 * 3. Run the development server: npm run dev
 * 4. Open http://localhost:3000 in your browser
 * 
 * For production build:
 * 1. Build the project: npm run build
 * 2. Start the production server: npm start
 */

// Import required modules
const express = require('express');
const next = require('next');
const path = require('path');

// Environment configuration
const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Local development utilities
const localUtils = {
  /**
   * Start the development server
   */
  startDevServer: async () => {
    try {
      await app.prepare();
      const server = express();
      
      // Serve static files
      server.use(express.static(path.join(__dirname, 'public')));
      
      // Handle all requests with Next.js
      server.all('*', (req, res) => {
        return handle(req, res);
      });
      
      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 WebElements running at http://localhost:${port}`);
        console.log(`📝 Editor available at http://localhost:${port}`);
        console.log(`👀 Preview available at http://localhost:${port}/preview`);
        console.log('\n💡 Tips:');
        console.log('   - Click "Add Section" to add new sections');
        console.log('   - Drag and drop widgets from the left panel');
        console.log('   - Use the preview button to see your page in a new tab');
        console.log('   - Press Ctrl+S to save your work');
        console.log('   - Press Ctrl+Z/Ctrl+Y to undo/redo');
      });
    } catch (error) {
      console.error('Error starting server:', error);
      process.exit(1);
    }
  },

  /**
   * Build the project for production
   */
  buildProject: async () => {
    try {
      console.log('🔨 Building project for production...');
      await app.prepare();
      console.log('✅ Build completed successfully');
      console.log('🚀 Run "npm start" to start the production server');
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  },

  /**
   * Start production server
   */
  startProdServer: async () => {
    try {
      await app.prepare();
      const server = express();
      
      // Serve static files
      server.use(express.static(path.join(__dirname, 'public')));
      server.use(express.static(path.join(__dirname, '.next')));
      
      // Handle all requests with Next.js
      server.all('*', (req, res) => {
        return handle(req, res);
      });
      
      server.listen(port, (err) => {
        if (err) throw err;
        console.log(`🚀 Production WebElements server running at http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Error starting production server:', error);
      process.exit(1);
    }
  }
};

// Export utilities for external use
module.exports = localUtils;

// If this file is run directly, start the appropriate server
if (require.main === module) {
  if (dev) {
    localUtils.startDevServer();
  } else {
    localUtils.startProdServer();
  }
}

// Development scripts for package.json
/*
Add these scripts to your package.json:

{
  "scripts": {
    "dev": "node App.js",
    "build": "NODE_ENV=production node App.js --build",
    "start": "NODE_ENV=production node App.js",
    "lint": "next lint"
  }
}
*/

// Quick start guide
/*
Quick Start Guide:

1. Installation:
   npm install

2. Development:
   npm run dev
   # Open http://localhost:3000

3. Building for Production:
   npm run build
   npm start

4. Features:
   - Drag and drop page builder
   - Real-time preview
   - Responsive design
   - Widget library
   - Theme customization
   - Export/Import functionality

5. Keyboard Shortcuts:
   - Ctrl+S: Save
   - Ctrl+Z: Undo
   - Ctrl+Y: Redo
   - Ctrl+E: Search

6. File Structure:
   src/
   ├── app/
   │   ├── page.tsx          # Main page builder
   │   ├── preview/          # Preview page
   │   └── layout.tsx        # App layout
   ├── components/
   │   ├── page-builder/     # Page builder components
   │   ├── ui/               # UI components
   │   └── widgets/          # Widget components
   └── lib/                  # Utility libraries
*/