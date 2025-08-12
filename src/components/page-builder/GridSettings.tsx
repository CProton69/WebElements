'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Grid, 
  Eye, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Layout,
  Settings,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GridConfig {
  columns: number
  gutterWidth: number
  rowHeight: number
  snapToGrid: boolean
  showGrid: boolean
  responsive: {
    desktop: GridSettings
    tablet: GridSettings
    mobile: GridSettings
  }
}

interface GridSettings {
  columns: number
  gutterWidth: number
  rowHeight: number
}

interface GridSettingsProps {
  gridConfig: GridConfig
  onGridConfigChange: (config: GridConfig) => void
  selectedDevice: 'desktop' | 'tablet' | 'mobile'
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void
}

export function GridSettingsPanel({ 
  gridConfig, 
  onGridConfigChange, 
  selectedDevice, 
  onDeviceChange 
}: GridSettingsProps) {
  const [localConfig, setLocalConfig] = useState<GridConfig>(gridConfig)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalConfig(gridConfig)
    setHasChanges(false)
  }, [gridConfig])

  const updateConfig = (updates: Partial<GridConfig>) => {
    const newConfig = { ...localConfig, ...updates }
    setLocalConfig(newConfig)
    setHasChanges(true)
  }

  const updateResponsiveConfig = (device: 'desktop' | 'tablet' | 'mobile', updates: Partial<GridSettings>) => {
    const newConfig = {
      ...localConfig,
      responsive: {
        ...localConfig.responsive,
        [device]: {
          ...localConfig.responsive[device],
          ...updates
        }
      }
    }
    setLocalConfig(newConfig)
    setHasChanges(true)
  }

  const handleSave = () => {
    onGridConfigChange(localConfig)
    setHasChanges(false)
  }

  const handleReset = () => {
    const defaultConfig: GridConfig = {
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
    }
    setLocalConfig(defaultConfig)
    setHasChanges(true)
  }

  const getCurrentDeviceSettings = () => {
    return localConfig.responsive[selectedDevice]
  }

  const deviceSettings = getCurrentDeviceSettings()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Grid Settings</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-gray-600"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-[#92003b] hover:bg-[#b8004a]"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Device Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Layout className="w-4 h-4 mr-2" />
            Device Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-1 mb-4">
            <Button
              variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('desktop')}
              className={cn(
                'flex-1',
                selectedDevice === 'desktop' && 'bg-[#92003b] hover:bg-[#b8004a]'
              )}
            >
              <Monitor className="w-4 h-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={selectedDevice === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('tablet')}
              className={cn(
                'flex-1',
                selectedDevice === 'tablet' && 'bg-[#92003b] hover:bg-[#b8004a]'
              )}
            >
              <Tablet className="w-4 h-4 mr-1" />
              Tablet
            </Button>
            <Button
              variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onDeviceChange('mobile')}
              className={cn(
                'flex-1',
                selectedDevice === 'mobile' && 'bg-[#92003b] hover:bg-[#b8004a]'
              )}
            >
              <Smartphone className="w-4 h-4 mr-1" />
              Mobile
            </Button>
          </div>

          <div className="space-y-4">
            {/* Columns */}
            <div>
              <Label className="text-sm font-medium">
                Columns: {deviceSettings.columns}
              </Label>
              <div className="mt-2">
                <Slider
                  value={[deviceSettings.columns]}
                  onValueChange={([value]) => 
                    updateResponsiveConfig(selectedDevice, { columns: value })
                  }
                  min={1}
                  max={16}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>16</span>
                </div>
              </div>
            </div>

            {/* Gutter Width */}
            <div>
              <Label className="text-sm font-medium">
                Gutter Width: {deviceSettings.gutterWidth}px
              </Label>
              <div className="mt-2">
                <Slider
                  value={[deviceSettings.gutterWidth]}
                  onValueChange={([value]) => 
                    updateResponsiveConfig(selectedDevice, { gutterWidth: value })
                  }
                  min={0}
                  max={50}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0px</span>
                  <span>50px</span>
                </div>
              </div>
            </div>

            {/* Row Height */}
            <div>
              <Label className="text-sm font-medium">
                Row Height: {deviceSettings.rowHeight}px
              </Label>
              <div className="mt-2">
                <Slider
                  value={[deviceSettings.rowHeight]}
                  onValueChange={([value]) => 
                    updateResponsiveConfig(selectedDevice, { rowHeight: value })
                  }
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10px</span>
                  <span>100px</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Global Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Snap to Grid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Snap to Grid</Label>
              <Badge variant="outline" className="text-xs">
                {localConfig.snapToGrid ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <Switch
              checked={localConfig.snapToGrid}
              onCheckedChange={(checked) => updateConfig({ snapToGrid: checked })}
            />
          </div>

          {/* Show Grid */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Show Grid Lines</Label>
              <Badge variant="outline" className="text-xs">
                {localConfig.showGrid ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
            <Switch
              checked={localConfig.showGrid}
              onCheckedChange={(checked) => updateConfig({ showGrid: checked })}
            />
          </div>

          <Separator />

          {/* Info */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Snap to Grid automatically aligns elements when dragging or resizing</p>
            <p>• Grid lines help visualize the layout structure</p>
            <p>• Settings can be customized per device type</p>
          </div>
        </CardContent>
      </Card>

      {/* Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateConfig({
                  responsive: {
                    desktop: { columns: 12, gutterWidth: 20, rowHeight: 20 },
                    tablet: { columns: 8, gutterWidth: 16, rowHeight: 16 },
                    mobile: { columns: 4, gutterWidth: 12, rowHeight: 12 }
                  }
                })
              }}
            >
              Bootstrap
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateConfig({
                  responsive: {
                    desktop: { columns: 12, gutterWidth: 24, rowHeight: 24 },
                    tablet: { columns: 8, gutterWidth: 20, rowHeight: 20 },
                    mobile: { columns: 4, gutterWidth: 16, rowHeight: 16 }
                  }
                })
              }}
            >
              Material
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateConfig({
                  responsive: {
                    desktop: { columns: 16, gutterWidth: 16, rowHeight: 16 },
                    tablet: { columns: 12, gutterWidth: 12, rowHeight: 12 },
                    mobile: { columns: 8, gutterWidth: 8, rowHeight: 8 }
                  }
                })
              }}
            >
              Tailwind
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                updateConfig({
                  responsive: {
                    desktop: { columns: 24, gutterWidth: 8, rowHeight: 8 },
                    tablet: { columns: 16, gutterWidth: 6, rowHeight: 6 },
                    mobile: { columns: 8, gutterWidth: 4, rowHeight: 4 }
                  }
                })
              }}
            >
              Fine Grid
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}