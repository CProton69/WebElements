'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Menu, 
  Square, 
  RectangleHorizontal, 
  LayoutPanelLeft,
  Calendar,
  MoreHorizontal,
  GripVertical,
  ExternalLink,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { realtimeManager } from '@/lib/realtime'
import { validateMenu, formatValidationErrors } from '@/lib/validation'

interface MenuItem {
  id: string
  label: string
  url: string
  type: 'page' | 'custom' | 'category'
  target?: '_blank' | '_self'
  children?: MenuItem[]
}

interface MenuData {
  id: string
  name: string
  location?: string
  items: string // JSON string of MenuItem[]
  style?: string // JSON string for menu styling
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MenusManagerProps {
  onOpen?: () => void
  onClose?: () => void
}

export function MenusManager({ onOpen, onClose }: MenusManagerProps) {
  const [menus, setMenus] = useState<MenuData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMenu, setEditingMenu] = useState<MenuData | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [menuToDelete, setMenuToDelete] = useState<MenuData | null>(null)

  useEffect(() => {
    fetchMenus()
  }, [])

  // Set up real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const update = event.detail
      if (update.type === 'menu') {
        console.log('Real-time menu update received:', update)
        fetchMenus()
      }
    }

    const unsubscribe = realtimeManager.subscribe((update) => {
      if (update.type === 'menu') {
        console.log('Real-time menu update received:', update)
        fetchMenus()
      }
    })

    // Also listen for custom events
    window.addEventListener('realtime-update', handleRealtimeUpdate as EventListener)

    return () => {
      unsubscribe()
      window.removeEventListener('realtime-update', handleRealtimeUpdate as EventListener)
    }
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await fetch('/api/menus')
      if (response.ok) {
        const data = await response.json()
        setMenus(data.menus || [])
      }
    } catch (error) {
      console.error('Error fetching menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMenu = () => {
    setEditingMenu(null)
    setShowEditor(true)
  }

  const handleEditMenu = (menu: MenuData) => {
    setEditingMenu(menu)
    setShowEditor(true)
  }

  const handleDeleteMenu = async (menu: MenuData) => {
    try {
      const response = await fetch(`/api/menus/${menu.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete menu')
      }
      
      // Broadcast real-time update
      realtimeManager.broadcastMenuUpdate('delete', menu)
      
      await fetchMenus()
      setMenuToDelete(null)
    } catch (error) {
      console.error('Error deleting menu:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu'
      alert(errorMessage)
    }
  }

  const handleSaveMenu = async (menuData: Partial<MenuData>) => {
    try {
      const url = editingMenu ? `/api/menus/${editingMenu.id}` : '/api/menus'
      const method = editingMenu ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save menu')
      }
      
      const savedMenu = await response.json()
      
      // Broadcast real-time update
      if (editingMenu) {
        realtimeManager.broadcastMenuUpdate('update', savedMenu)
      } else {
        realtimeManager.broadcastMenuUpdate('create', savedMenu)
      }
      
      await fetchMenus()
      setShowEditor(false)
      setEditingMenu(null)
    } catch (error) {
      console.error('Error saving menu:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to save menu'
      alert(errorMessage)
    }
  }

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'header':
        return <Square className="w-4 h-4" />
      case 'footer':
        return <RectangleHorizontal className="w-4 h-4" />
      case 'sidebar':
        return <LayoutPanelLeft className="w-4 h-4" />
      default:
        return <Menu className="w-4 h-4" />
    }
  }

  const parseMenuItems = (itemsString: string): MenuItem[] => {
    try {
      return JSON.parse(itemsString)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Menus</h2>
          <p className="text-gray-600">Manage your website navigation menus</p>
        </div>
        <Button onClick={handleCreateMenu} className="bg-[#92003b] hover:bg-[#b8004a]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Menu
        </Button>
      </div>

      {/* Menus Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Menu className="w-5 h-5" />
            All Menus
          </CardTitle>
        </CardHeader>
        <CardContent>
          {menus.length === 0 ? (
            <div className="text-center py-12">
              <Menu className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menus yet</h3>
              <p className="text-gray-500 mb-4">Create your first menu to get started</p>
              <Button onClick={handleCreateMenu} className="bg-[#92003b] hover:bg-[#b8004a]">
                <Plus className="w-4 h-4 mr-2" />
                Create Menu
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menus.map((menu) => {
                  const items = parseMenuItems(menu.items)
                  return (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">{menu.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLocationIcon(menu.location)}
                          <span className="capitalize text-sm">
                            {menu.location || 'Unassigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {items.length} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(menu.updatedAt), 'MMM d, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMenu(menu)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                onClick={() => setMenuToDelete(menu)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Menu</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{menu.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => menuToDelete && handleDeleteMenu(menuToDelete)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Menu Editor Modal */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMenu ? 'Edit Menu' : 'Create New Menu'}
            </DialogTitle>
          </DialogHeader>
          <MenuEditor
            menu={editingMenu}
            onSave={handleSaveMenu}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface MenuEditorProps {
  menu?: MenuData | null
  onSave: (menuData: Partial<MenuData>) => void
  onCancel: () => void
}

function MenuEditor({ menu, onSave, onCancel }: MenuEditorProps) {
  const [formData, setFormData] = useState({
    name: menu?.name || '',
    location: menu?.location || 'unassigned',
    items: menu?.items || '[]',
    style: menu?.style || '{}',
    isActive: menu?.isActive ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      return menu ? JSON.parse(menu.items) : []
    } catch {
      return []
    }
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over?.id)

        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prepare data for validation
    const menuDataForValidation = {
      ...formData,
      items: JSON.stringify(menuItems)
    }
    
    // Validate using validation utility
    const validation = validateMenu(menuDataForValidation)
    
    if (!validation.isValid) {
      const formattedErrors = formatValidationErrors(validation.errors)
      setErrors(formattedErrors)
      return
    }

    onSave({
      ...formData,
      items: JSON.stringify(menuItems)
    })
  }

  const addMenuItem = (type: MenuItem['type'] = 'custom') => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      label: type === 'page' ? 'Select Page' : 'New Item',
      url: type === 'page' ? '#' : '/',
      type,
      target: '_self',
      children: []
    }
    
    setMenuItems(prev => [...prev, newItem])
  }

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    )
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Menu Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Menu Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="location">Display Location</Label>
            <Select value={formData.location} onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="isActive">Status</Label>
            <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === 'active' }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Menu Items</h3>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMenuItem('custom')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Custom Link
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addMenuItem('page')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Page Link
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={menuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {menuItems.map((item, index) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateMenuItem(item.id, updates)}
                  onDelete={() => deleteMenuItem(item.id)}
                  isFirst={index === 0}
                  isLast={index === menuItems.length - 1}
                />
              ))}
            </SortableContext>
          </DndContext>
          
          {menuItems.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Menu className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No menu items yet</p>
              <p className="text-sm text-gray-400">Add your first menu item above</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#92003b] hover:bg-[#b8004a]">
          {menu ? 'Update Menu' : 'Create Menu'}
        </Button>
      </div>
    </form>
  )
}

interface SortableMenuItemProps {
  item: MenuItem
  onUpdate: (updates: Partial<MenuItem>) => void
  onDelete: () => void
  isFirst?: boolean
  isLast?: boolean
}

function SortableMenuItem({ item, onUpdate, onDelete, isFirst, isLast }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border rounded-lg p-4 space-y-3 ${isDragging ? 'opacity-50 bg-gray-100' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex-1">
          <Input
            value={item.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Menu label"
            className="font-medium"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? '↑' : '↓'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-3 pl-7">
          <div>
            <Label>URL</Label>
            <Input
              value={item.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              placeholder="/path-or-url"
            />
          </div>
          
          <div>
            <Label>Target</Label>
            <Select value={item.target} onValueChange={(value: any) => onUpdate({ target: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">Same tab</SelectItem>
                <SelectItem value="_blank">New tab</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}