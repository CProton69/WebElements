'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Type, 
  Palette, 
  Layout, 
  Image as ImageIcon, 
  Monitor,
  Smartphone,
  Tablet,
  Save,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react'

interface GlobalSettings {
  // Typography
  fonts: {
    primaryFont: string
    secondaryFont: string
    headingFont: string
    baseFontSize: number
    lineHeight: number
    letterSpacing: number
  }
  
  // Colors
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
  
  // Theme
  theme: {
    mode: 'light' | 'dark' | 'auto'
    borderRadius: number
    buttonStyle: 'rounded' | 'square' | 'pill'
    shadowStyle: 'none' | 'subtle' | 'medium' | 'strong'
    animationStyle: 'none' | 'subtle' | 'smooth' | 'playful'
  }
  
  // Layout
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
  
  // Site Identity
  siteIdentity: {
    siteTitle: string
    siteDescription: string
    logoUrl: string
    faviconUrl: string
  }
}

interface GlobalSettingsProps {
  settings: GlobalSettings
  onSettingsChange: (settings: GlobalSettings) => void
  onReset?: () => void
}

const defaultFonts = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Noto Sans',
  'Source Sans Pro'
]

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

export function GlobalSettings({ settings, onSettingsChange, onReset }: GlobalSettingsProps) {
  const [localSettings, setLocalSettings] = useState<GlobalSettings>(settings)

  const handleSave = () => {
    onSettingsChange(localSettings)
  }

  const handleReset = () => {
    setLocalSettings(defaultSettings)
    onReset?.()
  }

  const updateSettings = (path: string[], value: any) => {
    setLocalSettings(prev => {
      const newSettings = { ...prev }
      let current: any = newSettings
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return newSettings
    })
  }

  const ColorPicker = ({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Global Settings</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Settings Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="typography" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="typography" className="text-xs">
                <Type className="w-3 h-3 mr-1" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="w-3 h-3 mr-1" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-xs">
                <Settings className="w-3 h-3 mr-1" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="w-3 h-3 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="identity" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                Identity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="typography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Typography Settings</CardTitle>
                  <CardDescription>
                    Configure fonts and text styling for your entire site
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Primary Font</Label>
                      <Select 
                        value={localSettings.fonts.primaryFont} 
                        onValueChange={(value) => updateSettings(['fonts', 'primaryFont'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultFonts.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Secondary Font</Label>
                      <Select 
                        value={localSettings.fonts.secondaryFont} 
                        onValueChange={(value) => updateSettings(['fonts', 'secondaryFont'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultFonts.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Heading Font</Label>
                      <Select 
                        value={localSettings.fonts.headingFont} 
                        onValueChange={(value) => updateSettings(['fonts', 'headingFont'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultFonts.map(font => (
                            <SelectItem key={font} value={font}>{font}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Base Font Size: {localSettings.fonts.baseFontSize}px</Label>
                      <Slider
                        value={[localSettings.fonts.baseFontSize]}
                        onValueChange={([value]) => updateSettings(['fonts', 'baseFontSize'], value)}
                        min={12}
                        max={24}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Line Height: {localSettings.fonts.lineHeight}</Label>
                      <Slider
                        value={[localSettings.fonts.lineHeight]}
                        onValueChange={([value]) => updateSettings(['fonts', 'lineHeight'], value)}
                        min={1}
                        max={2.5}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Letter Spacing: {localSettings.fonts.letterSpacing}px</Label>
                      <Slider
                        value={[localSettings.fonts.letterSpacing]}
                        onValueChange={([value]) => updateSettings(['fonts', 'letterSpacing'], value)}
                        min={-2}
                        max={5}
                        step={0.1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Palette</CardTitle>
                  <CardDescription>
                    Define the color scheme for your website
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Primary Colors</h4>
                      <ColorPicker
                        value={localSettings.colors.primary}
                        onChange={(value) => updateSettings(['colors', 'primary'], value)}
                        label="Primary"
                      />
                      <ColorPicker
                        value={localSettings.colors.secondary}
                        onChange={(value) => updateSettings(['colors', 'secondary'], value)}
                        label="Secondary"
                      />
                      <ColorPicker
                        value={localSettings.colors.accent}
                        onChange={(value) => updateSettings(['colors', 'accent'], value)}
                        label="Accent"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Text Colors</h4>
                      <ColorPicker
                        value={localSettings.colors.text}
                        onChange={(value) => updateSettings(['colors', 'text'], value)}
                        label="Primary Text"
                      />
                      <ColorPicker
                        value={localSettings.colors.textLight}
                        onChange={(value) => updateSettings(['colors', 'textLight'], value)}
                        label="Secondary Text"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Background Colors</h4>
                      <ColorPicker
                        value={localSettings.colors.background}
                        onChange={(value) => updateSettings(['colors', 'background'], value)}
                        label="Background"
                      />
                      <ColorPicker
                        value={localSettings.colors.surface}
                        onChange={(value) => updateSettings(['colors', 'surface'], value)}
                        label="Surface"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Status Colors</h4>
                      <ColorPicker
                        value={localSettings.colors.success}
                        onChange={(value) => updateSettings(['colors', 'success'], value)}
                        label="Success"
                      />
                      <ColorPicker
                        value={localSettings.colors.warning}
                        onChange={(value) => updateSettings(['colors', 'warning'], value)}
                        label="Warning"
                      />
                      <ColorPicker
                        value={localSettings.colors.error}
                        onChange={(value) => updateSettings(['colors', 'error'], value)}
                        label="Error"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="theme" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Settings</CardTitle>
                  <CardDescription>
                    Customize the overall appearance and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Theme Mode</Label>
                      <Select 
                        value={localSettings.theme.mode} 
                        onValueChange={(value: 'light' | 'dark' | 'auto') => updateSettings(['theme', 'mode'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (System)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Border Radius: {localSettings.theme.borderRadius}px</Label>
                      <Slider
                        value={[localSettings.theme.borderRadius]}
                        onValueChange={([value]) => updateSettings(['theme', 'borderRadius'], value)}
                        min={0}
                        max={20}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Button Style</Label>
                      <Select 
                        value={localSettings.theme.buttonStyle} 
                        onValueChange={(value: 'rounded' | 'square' | 'pill') => updateSettings(['theme', 'buttonStyle'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="pill">Pill</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Shadow Style</Label>
                      <Select 
                        value={localSettings.theme.shadowStyle} 
                        onValueChange={(value: 'none' | 'subtle' | 'medium' | 'strong') => updateSettings(['theme', 'shadowStyle'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Animation Style</Label>
                      <Select 
                        value={localSettings.theme.animationStyle} 
                        onValueChange={(value: 'none' | 'subtle' | 'smooth' | 'playful') => updateSettings(['theme', 'animationStyle'], value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="smooth">Smooth</SelectItem>
                          <SelectItem value="playful">Playful</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Layout Settings</CardTitle>
                  <CardDescription>
                    Configure layout dimensions and responsive breakpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Container Width: {localSettings.layout.containerWidth}px</Label>
                      <Slider
                        value={[localSettings.layout.containerWidth]}
                        onValueChange={([value]) => updateSettings(['layout', 'containerWidth'], value)}
                        min={800}
                        max={1600}
                        step={50}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Content Spacing: {localSettings.layout.contentSpacing}px</Label>
                      <Slider
                        value={[localSettings.layout.contentSpacing]}
                        onValueChange={([value]) => updateSettings(['layout', 'contentSpacing'], value)}
                        min={10}
                        max={50}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Section Spacing: {localSettings.layout.sectionSpacing}px</Label>
                      <Slider
                        value={[localSettings.layout.sectionSpacing]}
                        onValueChange={([value]) => updateSettings(['layout', 'sectionSpacing'], value)}
                        min={20}
                        max={100}
                        step={10}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Column Gap: {localSettings.layout.columnGap}px</Label>
                      <Slider
                        value={[localSettings.layout.columnGap]}
                        onValueChange={([value]) => updateSettings(['layout', 'columnGap'], value)}
                        min={10}
                        max={40}
                        step={5}
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Responsive Breakpoints</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <div className="flex-1">
                          <Label>Mobile: {localSettings.layout.responsiveBreakpoints.mobile}px</Label>
                          <Slider
                            value={[localSettings.layout.responsiveBreakpoints.mobile]}
                            onValueChange={([value]) => updateSettings(['layout', 'responsiveBreakpoints', 'mobile'], value)}
                            min={320}
                            max={768}
                            step={10}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tablet className="w-4 h-4" />
                        <div className="flex-1">
                          <Label>Tablet: {localSettings.layout.responsiveBreakpoints.tablet}px</Label>
                          <Slider
                            value={[localSettings.layout.responsiveBreakpoints.tablet]}
                            onValueChange={([value]) => updateSettings(['layout', 'responsiveBreakpoints', 'tablet'], value)}
                            min={768}
                            max={1024}
                            step={10}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        <div className="flex-1">
                          <Label>Desktop: {localSettings.layout.responsiveBreakpoints.desktop}px</Label>
                          <Slider
                            value={[localSettings.layout.responsiveBreakpoints.desktop]}
                            onValueChange={([value]) => updateSettings(['layout', 'responsiveBreakpoints', 'desktop'], value)}
                            min={1024}
                            max={1600}
                            step={10}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="identity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Site Identity</CardTitle>
                  <CardDescription>
                    Manage your site's basic information and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="site-title">Site Title</Label>
                      <Input
                        id="site-title"
                        value={localSettings.siteIdentity.siteTitle}
                        onChange={(e) => updateSettings(['siteIdentity', 'siteTitle'], e.target.value)}
                        placeholder="My Website"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="site-description">Site Description</Label>
                      <Textarea
                        id="site-description"
                        value={localSettings.siteIdentity.siteDescription}
                        onChange={(e) => updateSettings(['siteIdentity', 'siteDescription'], e.target.value)}
                        placeholder="A brief description of your site"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={localSettings.siteIdentity.logoUrl}
                        onChange={(e) => updateSettings(['siteIdentity', 'logoUrl'], e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="favicon-url">Favicon URL</Label>
                      <Input
                        id="favicon-url"
                        value={localSettings.siteIdentity.faviconUrl}
                        onChange={(e) => updateSettings(['siteIdentity', 'faviconUrl'], e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}