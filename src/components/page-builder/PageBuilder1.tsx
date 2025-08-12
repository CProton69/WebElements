'use client'

import { useState, useEffect, useCallback } from 'react'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { WidgetsPanel } from './WidgetsPanel'
import { Canvas } from './Canvas'
import { PropertiesPanel } from './PropertiesPanel'
import { PropertiesPanelEnhanced } from './PropertiesPanelEnhanced'
import { PropertiesPanelFixed } from './PropertiesPanelFixed'
import { NavigatorPanel } from './NavigatorPanel'
import { TopToolbar, DeviceType } from './TopToolbar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHistoryManager, useKeyboardShortcuts } from './HistoryManager'
import { widgetRegistry } from './WidgetRegistry'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Undo, Redo, Save } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { TemplateManager as OriginalTemplateManager } from './TemplateManager'
import { GlobalSettings } from './GlobalSettings'
import { PagesManager } from './PagesManager'
import { PagesManagerEnhanced } from './PagesManagerEnhanced'
import { PageCreationModal } from './PageCreationModal'
import { MenusManager } from './MenusManager'
import { GridSettingsPanel } from './GridSettings'
import { GridOverlay } from './GridOverlay'
import { NewOptionsModal } from './NewOptionsModal'
import { MediaManager } from './media/MediaManager'
import { MediaManagerEnhanced } from './media/MediaManagerEnhanced'
import { TemplateManager } from './templates/TemplateManager'
import { TemplateManagerEnhanced } from './templates/TemplateManagerEnhanced'
import { LandingPageCreator } from './landing/LandingPageCreator'
import { setStorageItem, getStorageItem, optimizePageElements } from '@/lib/storage-utils'
// Import widgets to ensure they are registered
import './widgets'

// Function to safely serialize page elements for localStorage
const safeSerializeElements = (elements: PageElement[]): string => {
  // First optimize the elements for storage
  const optimizedElements = optimizePageElements(elements)
  
  const cleanElement = (element: any): any => {
    const cleaned: any = {
      id: element.id,
      type: element.type,
      widgetType: element.widgetType,
      children: element.children ? element.children.map(cleanElement) : [],
      content: {},
      styles: {},
      props: {}
    }

    // Clean content - only keep serializable data
    if (element.content && typeof element.content === 'object') {
      Object.keys(element.content).forEach(key => {
        const value = element.content[key]
        if (value === null || value === undefined || 
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleaned.content[key] = value
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects recursively
          try {
            cleaned.content[key] = JSON.parse(JSON.stringify(value))
          } catch (e) {
            // Skip non-serializable objects
            console.warn('Skipping non-serializable content:', key, value)
          }
        }
      })
    }

    // Clean styles - only keep serializable data
    if (element.styles && typeof element.styles === 'object') {
      Object.keys(element.styles).forEach(key => {
        const value = element.styles[key]
        if (value === null || value === undefined || 
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleaned.styles[key] = value
        }
      })
    }

    // Clean props - only keep serializable data
    if (element.props && typeof element.props === 'object') {
      Object.keys(element.props).forEach(key => {
        const value = element.props[key]
        if (value === null || value === undefined || 
            typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          cleaned.props[key] = value
        }
      })
    }

    return cleaned
  }

  return JSON.stringify(optimizedElements.map(cleanElement))
}

export interface PageElement {
  id: string
  type: 'section' | 'column' | 'widget' | 'flex-container'
  widgetType?: string
  children: PageElement[]
  content: any
  styles: any
  props: any
}

export interface GlobalSettings {
  fonts: {
    primaryFont: string
    secondaryFont: string
    headingFont: string
    baseFontSize: number
    lineHeight: number
    letterSpacing: number
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    textLight: string
    background: string
    surface: string
    border: string
    success: string
    warning: string
    error: string
    info: string
  }
  theme: {
    mode: 'light' | 'dark' | 'auto'
    borderRadius: number
    buttonStyle: 'rounded' | 'square' | 'pill'
    shadowStyle: 'none' | 'subtle' | 'medium' | 'strong'
    animationStyle: 'none' | 'subtle' | 'smooth' | 'playful'
  }
  layout: {
    containerWidth: number
    contentSpacing: number
    sectionSpacing: number
    columnGap: number
    responsiveBreakpoints: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
  siteIdentity: {
    siteTitle: string
    siteDescription: string
    logoUrl: string
    faviconUrl: string
  }
}

export function PageBuilder() {
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
  const [pageElements, setPageElements] = useState<PageElement[]>([
    // Add a default section for testing
    {
      id: 'section-default',
      type: 'section',
      children: [
        {
          id: 'column-default',
          type: 'column',
          children: [
            {
              id: 'widget-default',
              type: 'widget',
              widgetType: 'heading',
              children: [],
              content: { text: 'Welcome to WebElements' },
              styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center' },
              props: {}
            }
          ],
          content: {},
          styles: { padding: '20px' },
          props: { width: 12 }
        }
      ],
      content: {},
      styles: { padding: '60px 0px', backgroundColor: '#f8f9fa' },
      props: {}
    }
  ])
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('desktop')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showNavigator, setShowNavigator] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showGlobalSettings, setShowGlobalSettings] = useState(false)
  const [showPagesManager, setShowPagesManager] = useState(false)
  const [showPageCreationModal, setShowPageCreationModal] = useState(false)
  const [showMenusManager, setShowMenusManager] = useState(false)
  const [showGridSettings, setShowGridSettings] = useState(false)
  const [showNewOptionsModal, setShowNewOptionsModal] = useState(false)
  const [showMediaManager, setShowMediaManager] = useState(false)
  const [showTemplateManager, setShowTemplateManager] = useState(false)
  const [showLandingPageCreator, setShowLandingPageCreator] = useState(false)
  
  // Grid configuration state
  const [gridConfig, setGridConfig] = useState({
    columns: 12,
    gutterWidth: 20,
    rowHeight: 20,
    snapToGrid: false,
    showGrid: false,
    responsive: {
      desktop: { columns: 12, gutterWidth: 20, rowHeight: 20 },
      tablet: { columns: 8, gutterWidth: 16, rowHeight: 16 },
      mobile: { columns: 4, gutterWidth: 12, rowHeight: 12 }
    }
  })
  
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    fonts: {
      primaryFont: 'Inter',
      secondaryFont: 'Roboto',
      headingFont: 'Montserrat',
      baseFontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0
    },
    colors: {
      primary: '#92003b',
      secondary: '#b8004a',
      accent: '#e11d48',
      text: '#1f2937',
      textLight: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    theme: {
      mode: 'light',
      borderRadius: 8,
      buttonStyle: 'rounded',
      shadowStyle: 'medium',
      animationStyle: 'smooth'
    },
    layout: {
      containerWidth: 1200,
      contentSpacing: 20,
      sectionSpacing: 60,
      columnGap: 20,
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
      }
    },
    siteIdentity: {
      siteTitle: 'My Website',
      siteDescription: 'Built with Elementor',
      logoUrl: '',
      faviconUrl: ''
    }
  })

  const {
    undo,
    redo,
    push,
    getCurrentElements,
    canUndo,
    canRedo,
    getUndoDescription,
    getRedoDescription,
    getHistorySize,
    getCurrentPosition
  } = useHistoryManager(pageElements)

  // Update page elements and push to history
  const updatePageElements = useCallback(async (newElements: PageElement[], description?: string) => {
    console.log('updatePageElements called with:', newElements.length, 'elements, description:', description)
    setPageElements(newElements)
    push(newElements, description)
    
    // Trigger real-time preview update with improved storage handling
    try {
      const serializedData = safeSerializeElements(newElements)
      
      // Use the new storage utility with fallback mechanisms
      const storageResult = await setStorageItem('pagebuilder-preview', serializedData, {
        compress: true,
        useIndexedDB: true,
        fallbackToMemory: true
      })
      
      if (storageResult.success) {
        console.log(`Preview data stored successfully using ${storageResult.method} (${storageResult.size} bytes)`)
        
        // Dispatch custom event for real-time preview updates
        const updateEvent = new CustomEvent('pagebuilder-update', {
          detail: { elements: JSON.parse(serializedData) }
        })
        window.dispatchEvent(updateEvent)
        
        console.log('Real-time preview update triggered')
      } else {
        console.warn('Failed to store preview data:', storageResult.error)
        // Show user-friendly warning
        toast.warning('Preview storage is full. Some features may be limited.')
      }
    } catch (error) {
      console.error('Error triggering real-time preview update:', error)
      toast.error('Failed to update preview. Please try refreshing the page.')
    }
  }, [push])

  // Initialize widget registry
  useEffect(() => {
    // Widget registry is already initialized by the static import
    console.log('Widget registry initialized')
  }, [])

  useEffect(() => {
    const handleOpenProperties = (event: CustomEvent) => {
      if (event.detail && event.detail.element) {
        console.log('Opening properties for element:', event.detail.element.id)
        setSelectedElement(event.detail.element)
        // Ensure the properties panel is visible by focusing on it
        setTimeout(() => {
          const propertiesPanel = document.querySelector('[data-properties-panel]')
          if (propertiesPanel) {
            propertiesPanel.scrollIntoView({ behavior: 'smooth' })
          }
        }, 150)
      }
    }

    document.addEventListener('open-properties', handleOpenProperties as EventListener)
    
    return () => {
      document.removeEventListener('open-properties', handleOpenProperties as EventListener)
    }
  }, [])

  const handleSave = () => {
    // Save functionality
    console.log('Saving page...', pageElements)
    // Here you would typically save to a database or local storage
    try {
      const serializedData = safeSerializeElements(pageElements)
      localStorage.setItem('pagebuilder-data', serializedData)
      console.log('Page saved successfully')
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Error saving page data. Please check the console for details.')
    }
  }

  useKeyboardShortcuts(
    () => {
      const result = undo()
      if (result) {
        setPageElements(result.elements)
      }
    },
    () => {
      const result = redo()
      if (result) {
        setPageElements(result.elements)
      }
    },
    handleSave
  )

  const handleElementSelect = (element: PageElement) => {
    setSelectedElement(element)
  }

  const handleElementUpdate = async (elementId: string, updates: Partial<PageElement>) => {
    console.log('handleElementUpdate called:', elementId, updates)
    const updateElement = (elements: PageElement[]): PageElement[] => {
      return elements.map(el => {
        if (el.id === elementId) {
          console.log('Found element to update:', el.id)
          const updatedElement = { ...el, ...updates }
          console.log('Updated element:', updatedElement)
          return updatedElement
        }
        if (el.children && el.children.length > 0) {
          return {
            ...el,
            children: updateElement(el.children)
          }
        }
        return el
      })
    }
    
    const newElements = updateElement(pageElements)
    await updatePageElements(newElements, `Update ${updates.content?.text || updates.widgetType || 'element'}`)
  }

  const handleElementAdd = async (newElements: PageElement[], description: string) => {
    console.log('handleElementAdd called with:', newElements.length, 'elements, description:', description)
    console.log('Current pageElements:', pageElements.length, 'elements')
    await updatePageElements(newElements, description)
  }

  const handleDeviceChange = (device: DeviceType) => {
    setSelectedDevice(device)
  }

  const handlePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleUndo = () => {
    const result = undo()
    if (result) {
      setPageElements(result.elements)
    }
  }

  const handleRedo = () => {
    const result = redo()
    if (result) {
      setPageElements(result.elements)
    }
  }

  const handleShowNavigator = () => {
    setShowNavigator(true)
  }

  const handleShowHistory = () => {
    setShowHistory(true)
  }

  const handleShowKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(true)
  }

  const handleElementReorder = (elementId: string, newParentId: string | null, index: number) => {
    // Implementation for reordering elements in navigator
    console.log('Reorder element:', elementId, 'to parent:', newParentId, 'at index:', index)
  }

  const handleShowTemplates = () => {
    setShowTemplates(true)
  }

  const handleTemplateLoad = async (templateElements: PageElement[]) => {
    setPageElements(templateElements)
    await updatePageElements(templateElements, 'Load template')
    setShowTemplates(false)
  }

  const handleShowGlobalSettings = () => {
    setShowGlobalSettings(true)
  }

  const handleShowPagesManager = () => {
    setShowPagesManager(true)
  }

  const handleShowPageCreationModal = () => {
    setShowPageCreationModal(true)
  }

  const handleShowMenusManager = () => {
    setShowMenusManager(true)
  }

  const handleShowGridSettings = () => {
    setShowGridSettings(true)
  }

  const handleShowNewOptions = () => {
    setShowNewOptionsModal(true)
  }

  const handleNewOptionSelect = (option: string) => {
    switch (option) {
      case 'media':
        setShowMediaManager(true)
        break
      case 'page':
        setShowPageCreationModal(true)
        break
      case 'landing':
        setShowLandingPageCreator(true)
        break
      case 'template':
        setShowTemplateManager(true)
        break
      default:
        break
    }
  }

  const handleMediaSelect = async (media: any) => {
    console.log('Media selected:', media)
    
    // Add media to canvas as a new image widget
    if (media && media.url) {
      const newImageWidget: PageElement = {
        id: `widget-${Date.now()}`,
        type: 'widget',
        widgetType: 'image',
        children: [],
        content: { 
          url: media.url,
          alt: media.name || 'Image',
          caption: ''
        },
        styles: { 
          maxWidth: '100%', 
          height: 'auto',
          borderRadius: '8px'
        },
        props: {}
      }
      
      // Add the image widget to the canvas
      const newElements = [...pageElements, newImageWidget]
      await updatePageElements(newElements, `Add image: ${media.name}`)
      
      // Auto-select the new image widget
      setTimeout(() => {
        setSelectedElement(newImageWidget)
        const event = new CustomEvent('open-properties', {
          detail: { element: newImageWidget }
        })
        document.dispatchEvent(event)
      }, 100)
      
      toast.success(`Image "${media.name}" added to canvas`)
    }
  }

  const handleTemplateSelect = async (template: any) => {
    console.log('Template selected:', template)
    // Apply template to current page
    if (template.content) {
      try {
        const templateElements = Array.isArray(template.content) ? template.content : [template.content]
        setPageElements(templateElements)
        await updatePageElements(templateElements, 'Apply template')
      } catch (error) {
        console.error('Error applying template:', error)
      }
    }
  }

  const handleLandingPageCreate = (landingPageData: any) => {
    console.log('Landing page created:', landingPageData)
    // Create landing page based on the data
    // This would typically create a new page and load it into the canvas
    setShowLandingPageCreator(false)
  }

  const handleGridConfigChange = (newConfig: typeof gridConfig) => {
    setGridConfig(newConfig)
    // Save to localStorage
    try {
      localStorage.setItem('grid-config', JSON.stringify(newConfig))
      console.log('Grid configuration saved successfully')
    } catch (error) {
      console.error('Error saving grid configuration:', error)
    }
  }

  const handlePageCreated = async (createdPage: any) => {
    console.log('Page created successfully:', createdPage)
    
    // Parse the page content and load it into the canvas
    try {
      let newElements: PageElement[] = []
      
      if (createdPage.content) {
        try {
          const parsedContent = JSON.parse(createdPage.content)
          if (parsedContent && typeof parsedContent === 'object') {
            newElements = Array.isArray(parsedContent) ? parsedContent : [parsedContent]
          }
        } catch (e) {
          console.log('Failed to parse page content, using default structure')
          // If content is not valid JSON, create a basic structure
          newElements = [
            {
              id: `section-${Date.now()}`,
              type: 'section',
              children: [
                {
                  id: `column-${Date.now()}-1`,
                  type: 'column',
                  children: [
                    {
                      id: `widget-${Date.now()}-1`,
                      type: 'widget',
                      widgetType: 'heading',
                      children: [],
                      content: { text: createdPage.title || 'New Page' },
                      styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center' },
                      props: {}
                    }
                  ],
                  content: {},
                  styles: { padding: '20px' },
                  props: { width: 12 }
                }
              ],
              content: {},
              styles: { padding: '60px 0px', backgroundColor: '#f8f9fa' },
              props: {}
            }
          ]
        }
      } else {
        // Create default structure if no content
        newElements = [
          {
            id: `section-${Date.now()}`,
            type: 'section',
            children: [
              {
                id: `column-${Date.now()}-1`,
                type: 'column',
                children: [
                  {
                    id: `widget-${Date.now()}-1`,
                    type: 'widget',
                    widgetType: 'heading',
                    children: [],
                    content: { text: createdPage.title || 'New Page' },
                    styles: { fontSize: '32px', fontWeight: 'bold', textAlign: 'center' },
                    props: {}
                  }
                ],
                content: {},
                styles: { padding: '20px' },
                props: { width: 12 }
              }
            ],
            content: {},
            styles: { padding: '60px 0px', backgroundColor: '#f8f9fa' },
            props: {}
          }
        ]
      }

      // Update the canvas with the new page content
      await updatePageElements(newElements, `Load page: ${createdPage.title}`)
      
      // Auto-select the first element to open properties panel
      if (newElements.length > 0) {
        setTimeout(() => {
          setSelectedElement(newElements[0])
          // Trigger properties panel focus
          const event = new CustomEvent('open-properties', {
            detail: { element: newElements[0] }
          })
          document.dispatchEvent(event)
        }, 100)
      }

      // Show success notification
      setTimeout(() => {
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50'
        notification.textContent = `Page "${createdPage.title}" created and loaded successfully!`
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      }, 500)

    } catch (error) {
      console.error('Error loading page content into canvas:', error)
    }
  }

  const handleGlobalSettingsChange = (newSettings: GlobalSettings) => {
    setGlobalSettings(newSettings)
    // Save to localStorage
    try {
      localStorage.setItem('global-settings', JSON.stringify(newSettings))
      console.log('Global settings saved successfully')
    } catch (error) {
      console.error('Error saving global settings:', error)
    }
  }

  const handleGlobalSettingsReset = () => {
    // Reset to default settings
    const defaultSettings: GlobalSettings = {
      fonts: {
        primaryFont: 'Inter',
        secondaryFont: 'Roboto',
        headingFont: 'Montserrat',
        baseFontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0
      },
      colors: {
        primary: '#92003b',
        secondary: '#b8004a',
        accent: '#e11d48',
        text: '#1f2937',
        textLight: '#6b7280',
        background: '#ffffff',
        surface: '#f9fafb',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      theme: {
        mode: 'light',
        borderRadius: 8,
        buttonStyle: 'rounded',
        shadowStyle: 'medium',
        animationStyle: 'smooth'
      },
      layout: {
        containerWidth: 1200,
        contentSpacing: 20,
        sectionSpacing: 60,
        columnGap: 20,
        responsiveBreakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200
        }
      },
      siteIdentity: {
        siteTitle: 'My Website',
        siteDescription: 'Built with Elementor',
        logoUrl: '',
        faviconUrl: ''
      }
    }
    setGlobalSettings(defaultSettings)
    localStorage.removeItem('global-settings')
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar 
        selectedDevice={selectedDevice}
        onDeviceChange={handleDeviceChange}
        onPreviewMode={handlePreviewMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        canUndo={canUndo}
        canRedo={canRedo}
        undoDescription={getUndoDescription()}
        redoDescription={getRedoDescription()}
        elements={pageElements}
        onElementsUpdate={setPageElements}
        onElementAdd={handleElementAdd}
        onShowNavigator={handleShowNavigator}
        onShowHistory={handleShowHistory}
        onShowKeyboardShortcuts={handleShowKeyboardShortcuts}
        onShowTemplates={handleShowTemplates}
        onShowGlobalSettings={handleShowGlobalSettings}
        onShowPagesManager={handleShowPagesManager}
        onShowMenusManager={handleShowMenusManager}
        onShowGridSettings={handleShowGridSettings}
        onShowNewOptions={handleShowNewOptions}
      />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Widgets */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <WidgetsPanel onWidgetAdd={async (widgetType, widgetData) => {
            let newElement: PageElement
            
            if (widgetType === 'section') {
              newElement = {
                id: `section-${Date.now()}`,
                type: 'section',
                children: [
                  {
                    id: `column-${Date.now()}-1`,
                    type: 'column',
                    children: [],
                    content: {},
                    styles: widgetData.defaultStyles,
                    props: { width: 12 }
                  }
                ],
                content: widgetData.defaultContent,
                styles: widgetData.defaultStyles,
                props: widgetData.defaultProps
              }
            } else if (widgetType === 'column') {
              newElement = {
                id: `column-${Date.now()}`,
                type: 'column',
                children: [],
                content: widgetData.defaultContent,
                styles: widgetData.defaultStyles,
                props: { ...widgetData.defaultProps, width: 6 }
              }
            } else if (widgetType === 'flex-container') {
              newElement = {
                id: `flex-container-${Date.now()}`,
                type: 'flex-container',
                children: [],
                content: widgetData.defaultContent,
                styles: widgetData.defaultStyles,
                props: widgetData.defaultProps
              }
            } else {
              // Regular widget
              newElement = {
                id: `widget-${Date.now()}`,
                type: 'widget',
                widgetType: widgetType,
                children: [],
                content: widgetData.defaultContent,
                styles: widgetData.defaultStyles,
                props: widgetData.defaultProps
              }
            }
            
            const newElements = [...pageElements, newElement]
            await updatePageElements(newElements, `Add ${widgetData.name}`)
          }} />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Main Canvas */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="relative h-full">
            <Canvas 
              elements={pageElements}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
              selectedDevice={selectedDevice}
              isPreviewMode={isPreviewMode}
              onDeviceChange={handleDeviceChange}
              gridConfig={{
                snapToGrid: gridConfig.snapToGrid,
                showGrid: gridConfig.showGrid,
                columns: gridConfig.responsive[selectedDevice].columns,
                gutterWidth: gridConfig.responsive[selectedDevice].gutterWidth,
                rowHeight: gridConfig.responsive[selectedDevice].rowHeight
              }}
              containerWidth={globalSettings.layout.containerWidth}
            />
            <GridOverlay
              showGrid={gridConfig.showGrid}
              gridConfig={{
                columns: gridConfig.responsive[selectedDevice].columns,
                gutterWidth: gridConfig.responsive[selectedDevice].gutterWidth,
                rowHeight: gridConfig.responsive[selectedDevice].rowHeight
              }}
              containerWidth={globalSettings.layout.containerWidth}
              containerHeight={800}
              className="pointer-events-none"
            />
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right Panel - Properties */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PropertiesPanelEnhanced 
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            selectedDevice={selectedDevice}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Navigator Panel Sheet */}
      <Sheet open={showNavigator} onOpenChange={setShowNavigator}>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Page Navigator</SheetTitle>
            <SheetDescription>
              View and manage your page structure
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <NavigatorPanel 
              elements={pageElements}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              onElementReorder={handleElementReorder}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* History Panel Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
            <SheetDescription>
              View your action history and undo/redo changes
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">History Size</span>
                <Badge variant="secondary">{getHistorySize()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Position</span>
                <Badge variant="secondary">{getCurrentPosition()}</Badge>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo - {getUndoDescription()}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo className="w-4 h-4 mr-2" />
                  Redo - {getRedoDescription()}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Keyboard Shortcuts Sheet */}
      <Sheet open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Keyboard Shortcuts</SheetTitle>
            <SheetDescription>
              Quick keyboard shortcuts for common actions
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Undo</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Z</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redo</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Y</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Save</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Find</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+E</kbd>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Template Manager Sheet */}
      <Sheet open={showTemplates} onOpenChange={setShowTemplates}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Template Manager</SheetTitle>
            <SheetDescription>
              Save, load, and manage your page templates
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full">
            <OriginalTemplateManager 
              elements={pageElements}
              selectedElement={selectedElement}
              onTemplateLoad={handleTemplateLoad}
              onElementAdd={handleElementAdd}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Global Settings Sheet */}
      <Sheet open={showGlobalSettings} onOpenChange={setShowGlobalSettings}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Global Settings</SheetTitle>
            <SheetDescription>
              Configure global fonts, colors, theme, and layout settings
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full">
            <GlobalSettings 
              settings={globalSettings}
              onSettingsChange={handleGlobalSettingsChange}
              onReset={handleGlobalSettingsReset}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Pages Manager Sheet */}
      <Sheet open={showPagesManager} onOpenChange={setShowPagesManager}>
        <SheetContent side="right" className="w-full sm:w-[800px] lg:w-[1000px]">
          <SheetHeader>
            <SheetTitle>Pages Manager</SheetTitle>
            <SheetDescription>
              Create, edit, and manage your website pages
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <PagesManagerEnhanced onPageSelect={(page) => {
              // Load page content into the builder
              console.log('Loading page:', page)
              toast.success(`Page "${page.title}" loaded into builder`)
            }} />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Menus Manager Sheet */}
      <Sheet open={showMenusManager} onOpenChange={setShowMenusManager}>
        <SheetContent side="right" className="w-full sm:w-[800px] lg:w-[1000px]">
          <SheetHeader>
            <SheetTitle>Menus Manager</SheetTitle>
            <SheetDescription>
              Create, edit, and manage your website navigation menus
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <MenusManager />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Grid Settings Sheet */}
      <Sheet open={showGridSettings} onOpenChange={setShowGridSettings}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Grid Settings</SheetTitle>
            <SheetDescription>
              Configure grid layout and snap-to-grid functionality
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <GridSettingsPanel 
              gridConfig={gridConfig}
              onGridConfigChange={handleGridConfigChange}
              selectedDevice={selectedDevice}
              onDeviceChange={handleDeviceChange}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* New Options Modal */}
      <NewOptionsModal
        isOpen={showNewOptionsModal}
        onClose={() => setShowNewOptionsModal(false)}
        onOptionSelect={handleNewOptionSelect}
      />
      
      {/* Media Manager */}
      <MediaManagerEnhanced
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelectMedia={handleMediaSelect}
      />
      
      {/* Template Manager */}
      <TemplateManagerEnhanced
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onSelectTemplate={handleTemplateSelect}
      />
      
      {/* Landing Page Creator */}
      <LandingPageCreator
        isOpen={showLandingPageCreator}
        onClose={() => setShowLandingPageCreator(false)}
        onCreateLandingPage={handleLandingPageCreate}
      />
    </div>
  )
}