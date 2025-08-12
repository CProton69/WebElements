'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { widgetRegistry } from './WidgetRegistry'
import { WidgetDefinition } from './WidgetRegistry'

interface WidgetsPanelProps {
  onWidgetAdd: (widgetType: string, widgetData: any) => void
}

const categoryIcons: Record<string, string> = {
  basic: 'Type',
  pro: 'Zap',
  theme: 'Palette',
  woocommerce: 'ShoppingCart',
  forms: 'FileText',
  media: 'Image',
  interactive: 'MousePointer'
}

export function WidgetsPanel({ onWidgetAdd }: WidgetsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('basic')
  const [widgets, setWidgets] = useState<WidgetDefinition[]>([])
  const [filteredWidgets, setFilteredWidgets] = useState<WidgetDefinition[]>([])

  useEffect(() => {
    // Load widgets from registry
    const allWidgets = widgetRegistry.getAll()
    setWidgets(allWidgets)
    setFilteredWidgets(allWidgets.filter(w => w.category === 'basic'))
  }, [])

  useEffect(() => {
    let filtered = widgets

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(widget => widget.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(query) ||
        widget.description.toLowerCase().includes(query)
      )
    }

    setFilteredWidgets(filtered)
  }, [searchQuery, activeCategory, widgets])

  const handleDragStart = (e: React.DragEvent, widget: WidgetDefinition) => {
    e.dataTransfer.setData('widgetType', widget.type)
    e.dataTransfer.setData('widgetName', widget.name)
    e.dataTransfer.setData('widgetData', JSON.stringify({
      type: widget.type,
      name: widget.name,
      defaultContent: widget.defaultContent,
      defaultStyles: widget.defaultStyles,
      defaultProps: widget.defaultProps
    }))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleWidgetClick = (widget: WidgetDefinition) => {
    onWidgetAdd(widget.type, {
      type: widget.type,
      name: widget.name,
      defaultContent: widget.defaultContent,
      defaultStyles: widget.defaultStyles,
      defaultProps: widget.defaultProps
    })
  }

  const categories = [
    { id: 'all', name: 'All', count: widgets.length },
    { id: 'basic', name: 'Basic', count: widgets.filter(w => w.category === 'basic').length },
    { id: 'pro', name: 'Pro', count: widgets.filter(w => w.category === 'pro').length },
    { id: 'theme', name: 'Theme', count: widgets.filter(w => w.category === 'theme').length },
    { id: 'woocommerce', name: 'WooCommerce', count: widgets.filter(w => w.category === 'woocommerce').length },
    { id: 'forms', name: 'Forms', count: widgets.filter(w => w.category === 'forms').length },
    { id: 'media', name: 'Media', count: widgets.filter(w => w.category === 'media').length },
    { id: 'interactive', name: 'Interactive', count: widgets.filter(w => w.category === 'interactive').length }
  ]

  const getWidgetIcon = (widget: WidgetDefinition) => {
    // This would normally load the actual icon component
    // For now, we'll use a simple fallback
    return (
      <div className="w-8 h-8 bg-[#92003b]/10 rounded-lg flex items-center justify-center">
        <span className="text-[#92003b] text-sm font-medium">
          {widget.name.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#2c3e50] text-white">
      {/* Header */}
      <div className="p-4 border-b border-[#34495e]">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Widgets
        </h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search widgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#34495e] border-[#4a5568] text-white placeholder-gray-400 focus:border-[#92003b]"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-[#34495e]">
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid grid-cols-4 w-full bg-[#34495e]">
            {categories.slice(0, 4).map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
              >
                {category.name}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-[#4a5568] text-white">
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsList className="grid grid-cols-4 w-full bg-[#34495e] mt-2">
            {categories.slice(4).map(category => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
              >
                {category.name}
                {category.count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs bg-[#4a5568] text-white">
                    {category.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Widget List */}
      <ScrollArea className="flex-1 overflow-y-auto webeditor-scrollbar">
        <div className="p-4 space-y-2 min-h-0">
          {filteredWidgets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No widgets found</p>
              <p className="text-xs mt-1">Try adjusting your search or category</p>
            </div>
          ) : (
            filteredWidgets.map(widget => (
              <div
                key={widget.type}
                draggable
                onDragStart={(e) => handleDragStart(e, widget)}
                onClick={() => handleWidgetClick(widget)}
                className={cn(
                  'p-3 rounded-lg cursor-pointer transition-all hover:bg-[#34495e] border border-transparent hover:border-[#92003b]/30',
                  'group'
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getWidgetIcon(widget)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white group-hover:text-[#92003b] transition-colors">
                        {widget.name}
                      </h3>
                      {widget.category === 'pro' && (
                        <Badge className="bg-yellow-500 text-black text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Pro
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {widget.description}
                    </p>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs border-[#4a5568] text-gray-400">
                    {widget.category}
                  </Badge>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-gray-400 hover:text-white hover:bg-[#92003b]"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWidgetClick(widget)
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <ScrollBar className="w-2 bg-[#34495e]" />
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-[#34495e] text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>{filteredWidgets.length} widgets</span>
          <span>Drag to canvas or click to add</span>
        </div>
      </div>
    </div>
  )
}