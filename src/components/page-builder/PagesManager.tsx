'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Globe, 
  Lock, 
  Key,
  Calendar,
  MoreHorizontal
} from 'lucide-react'
import { format } from 'date-fns'
import { WYSIWYGEditor } from '@/components/ui/wysiwyg-editor'
import { realtimeManager } from '@/lib/realtime'
import { validatePage, formatValidationErrors, generateSlug, isValidSlug } from '@/lib/validation'

interface PageData {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  metaTitle?: string
  metaDescription?: string
  visibility: 'public' | 'private' | 'password_protected'
  password?: string
  template?: string
  status: 'draft' | 'published'
  headerMenu?: string
  footerMenu?: string
  createdAt: string
  updatedAt: string
}

interface PagesManagerProps {
  onOpen?: () => void
  onClose?: () => void
}

export function PagesManager({ onOpen, onClose }: PagesManagerProps) {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<PageData | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  // Set up real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const update = event.detail
      if (update.type === 'page' || update.type === 'page-menu') {
        console.log('Real-time page update received:', update)
        fetchPages()
      }
    }

    const unsubscribe = realtimeManager.subscribe((update) => {
      if (update.type === 'page' || update.type === 'page-menu') {
        console.log('Real-time page update received:', update)
        fetchPages()
      }
    })

    // Also listen for custom events
    window.addEventListener('realtime-update', handleRealtimeUpdate as EventListener)

    return () => {
      unsubscribe()
      window.removeEventListener('realtime-update', handleRealtimeUpdate as EventListener)
    }
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePage = () => {
    setEditingPage(null)
    setShowEditor(true)
  }

  const handleEditPage = (page: PageData) => {
    setEditingPage(page)
    setShowEditor(true)
  }

  const handleDeletePage = async (page: PageData) => {
    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete page')
      }
      
      // Broadcast real-time update
      realtimeManager.broadcastPageUpdate('delete', page)
      
      await fetchPages()
      setPageToDelete(null)
    } catch (error) {
      console.error('Error deleting page:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete page'
      alert(errorMessage)
    }
  }

  const handleSavePage = async (pageData: Partial<PageData>) => {
    try {
      const url = editingPage ? `/api/pages/${editingPage.id}` : '/api/pages'
      const method = editingPage ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pageData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save page')
      }
      
      const savedPage = await response.json()
      
      // Broadcast real-time update
      if (editingPage) {
        realtimeManager.broadcastPageUpdate('update', savedPage)
      } else {
        realtimeManager.broadcastPageUpdate('create', savedPage)
      }
      
      // If menu assignments changed, broadcast page-menu update
      if (pageData.headerMenu || pageData.footerMenu) {
        realtimeManager.broadcastPageMenuUpdate(savedPage)
      }
      
      await fetchPages()
      setShowEditor(false)
      setEditingPage(null)
    } catch (error) {
      console.error('Error saving page:', error)
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to save page'
      alert(errorMessage)
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return <Lock className="w-4 h-4" />
      case 'password_protected':
        return <Key className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge className="bg-green-500">Published</Badge>
    ) : (
      <Badge variant="secondary">Draft</Badge>
    )
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
          <h2 className="text-2xl font-bold">Pages</h2>
          <p className="text-gray-600">Manage your website pages</p>
        </div>
        <Button onClick={handleCreatePage} className="bg-[#92003b] hover:bg-[#b8004a]">
          <Plus className="w-4 h-4 mr-2" />
          Add New Page
        </Button>
      </div>

      {/* Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pages yet</h3>
              <p className="text-gray-500 mb-4">Create your first page to get started</p>
              <Button onClick={handleCreatePage} className="bg-[#92003b] hover:bg-[#b8004a]">
                <Plus className="w-4 h-4 mr-2" />
                Create Page
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell className="text-gray-600">/{page.slug}</TableCell>
                    <TableCell>{getStatusBadge(page.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(page.visibility)}
                        <span className="capitalize text-sm">
                          {page.visibility.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPage(page)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              onClick={() => setPageToDelete(page)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Page</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{page.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => pageToDelete && handleDeletePage(pageToDelete)}
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Page Editor Modal */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </DialogTitle>
          </DialogHeader>
          <PageEditor
            page={editingPage}
            onSave={handleSavePage}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PageEditorProps {
  page?: PageData | null
  onSave: (pageData: Partial<PageData>) => void
  onCancel: () => void
}

function PageEditor({ page, onSave, onCancel }: PageEditorProps) {
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    excerpt: page?.excerpt || '',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    visibility: page?.visibility || 'public' as 'public' | 'private' | 'password_protected',
    password: page?.password || '',
    template: page?.template || '',
    status: page?.status || 'draft' as 'draft' | 'published',
    headerMenu: page?.headerMenu || 'none',
    footerMenu: page?.footerMenu || 'none'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [menus, setMenus] = useState<any[]>([])

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch('/api/menus')
        if (response.ok) {
          const data = await response.json()
          setMenus(data.menus || [])
        }
      } catch (error) {
        console.error('Error fetching menus:', error)
      }
    }
    fetchMenus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate using validation utility
    const validation = validatePage(formData)
    
    if (!validation.isValid) {
      const formattedErrors = formatValidationErrors(validation.errors)
      setErrors(formattedErrors)
      return
    }

    onSave(formData)
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !page ? generateSlug(title) : prev.slug
    }))
    
    // Clear slug error if it exists and we're generating a new slug
    if (!page && errors.slug) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.slug
        return newErrors
      })
    }
  }

  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({ ...prev, slug }))
    
    // Validate slug in real-time
    if (slug && !isValidSlug(slug)) {
      setErrors(prev => ({
        ...prev,
        slug: 'Slug must contain only lowercase letters, numbers, and hyphens'
      }))
    } else if (errors.slug) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.slug
        return newErrors
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className={errors.slug ? 'border-red-500' : ''}
            />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            {!errors.slug && formData.slug && (
              <p className="text-sm text-gray-500">URL: /{formData.slug}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <WYSIWYGEditor
            value={formData.content}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            placeholder="Start writing your page content..."
            className={errors.content ? 'border-red-500' : ''}
          />
          {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
        </div>

        <div>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            rows={3}
            placeholder="Brief description of the page content"
          />
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">SEO Settings</h3>
        
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
            placeholder="SEO title (optional)"
          />
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
            rows={3}
            placeholder="SEO description (optional)"
          />
        </div>
      </div>

      {/* Page Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Page Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={formData.visibility} onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="password_protected">Password Protected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.visibility === 'password_protected' && (
          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
        )}

        <div>
          <Label htmlFor="template">Template</Label>
          <Input
            id="template"
            value={formData.template}
            onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
            placeholder="Template name (optional)"
          />
        </div>

        {/* Menu Assignment */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="headerMenu">Header Menu</Label>
            <Select value={formData.headerMenu} onValueChange={(value) => setFormData(prev => ({ ...prev, headerMenu: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select header menu..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No header menu</SelectItem>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="footerMenu">Footer Menu</Label>
            <Select value={formData.footerMenu} onValueChange={(value) => setFormData(prev => ({ ...prev, footerMenu: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select footer menu..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No footer menu</SelectItem>
                {menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-[#92003b] hover:bg-[#b8004a]">
          {page ? 'Update Page' : 'Create Page'}
        </Button>
      </div>
    </form>
  )
}