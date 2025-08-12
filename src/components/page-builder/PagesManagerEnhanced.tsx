'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
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
  MoreHorizontal,
  Search,
  Filter,
  Copy,
  Download,
  Upload,
  Settings,
  LayoutTemplate,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Maximize2,
  Grid,
  List
} from 'lucide-react'
import { format } from 'date-fns'
import { WYSIWYGEditor } from '@/components/ui/wysiwyg-editor'
import { realtimeManager } from '@/lib/realtime'
import { validatePage, formatValidationErrors, generateSlug, isValidSlug } from '@/lib/validation'
import { cn } from '@/lib/utils'

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
  featuredImage?: string
  author?: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
  viewCount?: number
  seoScore?: number
  readingTime?: number
  tags?: string[]
  category?: string
}

interface PagesManagerEnhancedProps {
  onOpen?: () => void
  onClose?: () => void
  onPageSelect?: (page: PageData) => void
}

const statusOptions = [
  { value: 'all', label: 'All Status', icon: <FileText className="w-4 h-4" /> },
  { value: 'published', label: 'Published', icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { value: 'draft', label: 'Draft', icon: <Clock className="w-4 h-4 text-gray-500" /> }
]

const visibilityOptions = [
  { value: 'all', label: 'All Visibility' },
  { value: 'public', label: 'Public', icon: <Globe className="w-4 h-4" /> },
  { value: 'private', label: 'Private', icon: <Lock className="w-4 h-4" /> },
  { value: 'password_protected', label: 'Password Protected', icon: <Key className="w-4 h-4" /> }
]

const sortOptions = [
  { value: 'updated-desc', label: 'Recently Updated' },
  { value: 'updated-asc', label: 'Least Recently Updated' },
  { value: 'created-desc', label: 'Recently Created' },
  { value: 'created-asc', label: 'Oldest' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'views-desc', label: 'Most Viewed' }
]

export function PagesManagerEnhanced({ onOpen, onClose, onPageSelect }: PagesManagerEnhancedProps) {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<PageData | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [pageToDelete, setPageToDelete] = useState<PageData | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated-desc')
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])

  useEffect(() => {
    fetchPages()
    fetchTemplates()
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

    window.addEventListener('realtime-update', handleRealtimeUpdate as EventListener)

    return () => {
      unsubscribe()
      window.removeEventListener('realtime-update', handleRealtimeUpdate as EventListener)
    }
  }, [])

  const fetchPages = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pages')
      if (response.ok) {
        const data = await response.json()
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
      toast.error('Failed to fetch pages')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleCreatePage = () => {
    setEditingPage(null)
    setShowEditor(true)
  }

  const handleCreateFromTemplate = () => {
    setShowTemplates(true)
  }

  const handleEditPage = (page: PageData) => {
    setEditingPage(page)
    setShowEditor(true)
  }

  const handleDuplicatePage = async (page: PageData) => {
    try {
      const duplicatedPage = {
        ...page,
        title: `${page.title} (Copy)`,
        slug: `${page.slug}-copy`,
        status: 'draft' as const
      }
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(duplicatedPage)
      })
      
      if (response.ok) {
        const savedPage = await response.json()
        realtimeManager.broadcastPageUpdate('create', savedPage)
        await fetchPages()
        toast.success('Page duplicated successfully')
      } else {
        throw new Error('Failed to duplicate page')
      }
    } catch (error) {
      console.error('Error duplicating page:', error)
      toast.error('Failed to duplicate page')
    }
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
      
      realtimeManager.broadcastPageUpdate('delete', page)
      await fetchPages()
      setPageToDelete(null)
      toast.success('Page deleted successfully')
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Failed to delete page')
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPages.length === 0) return

    try {
      switch (bulkAction) {
        case 'delete':
          for (const pageId of selectedPages) {
            await fetch(`/api/pages/${pageId}`, { method: 'DELETE' })
          }
          toast.success(`${selectedPages.length} pages deleted`)
          break
        case 'publish':
          for (const pageId of selectedPages) {
            await fetch(`/api/pages/${pageId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'published' })
            })
          }
          toast.success(`${selectedPages.length} pages published`)
          break
        case 'draft':
          for (const pageId of selectedPages) {
            await fetch(`/api/pages/${pageId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'draft' })
            })
          }
          toast.success(`${selectedPages.length} pages set to draft`)
          break
      }
      
      setSelectedPages([])
      setBulkAction('')
      await fetchPages()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
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
      
      if (editingPage) {
        realtimeManager.broadcastPageUpdate('update', savedPage)
      } else {
        realtimeManager.broadcastPageUpdate('create', savedPage)
      }
      
      if (pageData.headerMenu || pageData.footerMenu) {
        realtimeManager.broadcastPageMenuUpdate(savedPage)
      }
      
      await fetchPages()
      setShowEditor(false)
      setEditingPage(null)
      toast.success(`Page ${editingPage ? 'updated' : 'created'} successfully`)
    } catch (error) {
      console.error('Error saving page:', error)
      toast.error('Failed to save page')
    }
  }

  const handleTemplateSelect = async (template: any) => {
    try {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: template.name,
          slug: generateSlug(template.name),
          content: JSON.stringify(template.content),
          template: template.id,
          status: 'draft'
        })
      })
      
      if (response.ok) {
        const savedPage = await response.json()
        realtimeManager.broadcastPageUpdate('create', savedPage)
        await fetchPages()
        setShowTemplates(false)
        toast.success('Page created from template successfully')
      }
    } catch (error) {
      console.error('Error creating page from template:', error)
      toast.error('Failed to create page from template')
    }
  }

  const handleExportPage = async (page: PageData) => {
    try {
      const exportData = {
        title: page.title,
        content: page.content,
        excerpt: page.excerpt,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        template: page.template,
        tags: page.tags,
        category: page.category,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${page.slug}-export.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Page exported successfully')
    } catch (error) {
      console.error('Error exporting page:', error)
      toast.error('Failed to export page')
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

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Filter and sort pages
  const filteredAndSortedPages = pages
    .filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           page.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || page.status === statusFilter
      const matchesVisibility = visibilityFilter === 'all' || page.visibility === visibilityFilter
      
      return matchesSearch && matchesStatus && matchesVisibility
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated-desc':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'updated-asc':
          return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        case 'created-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'created-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        case 'views-desc':
          return (b.viewCount || 0) - (a.viewCount || 0)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#92003b]" />
        <span className="ml-2 text-lg font-medium">Loading pages...</span>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCreateFromTemplate}>
            <LayoutTemplate className="w-4 h-4 mr-2" />
            From Template
          </Button>
          <Button onClick={handleCreatePage} className="bg-[#92003b] hover:bg-[#b8004a]">
            <Plus className="w-4 h-4 mr-2" />
            Add New Page
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPages.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Bulk actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="publish">Publish</SelectItem>
                    <SelectItem value="draft">Set to Draft</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="bg-[#92003b] hover:bg-[#b8004a]"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPages([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pages List */}
      {filteredAndSortedPages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || visibilityFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first page to get started'
              }
            </p>
            <Button onClick={handleCreatePage} className="bg-[#92003b] hover:bg-[#b8004a]">
              <Plus className="w-4 h-4 mr-2" />
              Create Page
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Pages ({filteredAndSortedPages.length})
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="select-all"
                  checked={selectedPages.length === filteredAndSortedPages.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPages(filteredAndSortedPages.map(p => p.id))
                    } else {
                      setSelectedPages([])
                    }
                  }}
                />
                <Label htmlFor="select-all" className="text-sm">Select All</Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedPages.length === filteredAndSortedPages.length && filteredAndSortedPages.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPages(filteredAndSortedPages.map(p => p.id))
                        } else {
                          setSelectedPages([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>SEO Score</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages(prev => [...prev, page.id])
                          } else {
                            setSelectedPages(prev => prev.filter(id => id !== page.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="font-medium">{page.title}</div>
                          {page.category && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {page.category}
                            </Badge>
                          )}
                          {page.tags && page.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {page.tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {page.tags.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{page.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {page.featuredImage && (
                          <img
                            src={page.featuredImage}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                      </div>
                    </TableCell>
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
                      {page.seoScore && (
                        <div className={cn("font-medium", getSeoScoreColor(page.seoScore))}>
                          {page.seoScore}/100
                        </div>
                      )}
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
                          onClick={() => onPageSelect?.(page)}
                          className="h-8 w-8 p-0"
                          title="Edit in Builder"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/${page.slug}`, '_blank')}
                          className="h-8 w-8 p-0"
                          title="View Page"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicatePage(page)}
                          className="h-8 w-8 p-0"
                          title="Duplicate Page"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExportPage(page)}
                          className="h-8 w-8 p-0"
                          title="Export Page"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              title="Delete Page"
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
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPages.map((page) => (
            <Card key={page.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedPages.includes(page.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPages(prev => [...prev, page.id])
                          } else {
                            setSelectedPages(prev => prev.filter(id => id !== page.id))
                          }
                        }}
                      />
                      <h3 className="font-medium text-sm truncate">{page.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(page.status)}
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        {getVisibilityIcon(page.visibility)}
                        <span className="capitalize">
                          {page.visibility.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    {page.seoScore && (
                      <div className={cn("text-xs font-medium", getSeoScoreColor(page.seoScore))}>
                        SEO: {page.seoScore}/100
                      </div>
                    )}
                  </div>
                  {page.featuredImage && (
                    <img
                      src={page.featuredImage}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(page.updatedAt), 'MMM d, yyyy')}
                    </div>
                    {page.viewCount && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {page.viewCount} views
                      </div>
                    )}
                  </div>
                  
                  {page.excerpt && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {page.excerpt}
                    </p>
                  )}
                  
                  {page.tags && page.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {page.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {page.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{page.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => onPageSelect?.(page)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => window.open(`/${page.slug}`, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleDuplicatePage(page)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-red-600 hover:text-red-700"
                      onClick={() => setPageToDelete(page)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Page Editor Modal */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Edit Page' : 'Create New Page'}
            </DialogTitle>
          </DialogHeader>
          <PageEditorEnhanced
            page={editingPage}
            onSave={handleSavePage}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Template Selection Modal */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <LayoutTemplate className="w-16 h-16 text-gray-400" />
                  </div>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <p className="text-xs text-gray-600">{template.description}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button size="sm" className="w-full">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pageToDelete} onOpenChange={() => setPageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.title}"? This action cannot be undone.
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
  )
}

interface PageEditorEnhancedProps {
  page?: PageData | null
  onSave: (pageData: Partial<PageData>) => void
  onCancel: () => void
}

function PageEditorEnhanced({ page, onSave, onCancel }: PageEditorEnhancedProps) {
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
    footerMenu: page?.footerMenu || 'none',
    featuredImage: page?.featuredImage || '',
    author: page?.author || '',
    category: page?.category || '',
    tags: page?.tags?.join(', ') || ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [menus, setMenus] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('content')
  const [seoScore, setSeoScore] = useState<number | null>(null)

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

  useEffect(() => {
    // Calculate SEO score
    if (formData.title && formData.metaDescription && formData.content) {
      let score = 0
      
      // Title length (20-60 characters)
      if (formData.title.length >= 20 && formData.title.length <= 60) score += 25
      
      // Meta description length (120-160 characters)
      if (formData.metaDescription.length >= 120 && formData.metaDescription.length <= 160) score += 25
      
      // Content length (at least 300 words)
      const wordCount = formData.content.split(/\s+/).length
      if (wordCount >= 300) score += 25
      
      // Keywords in content
      const keywords = formData.title.toLowerCase().split(' ')
      const contentLower = formData.content.toLowerCase()
      const keywordCount = keywords.filter(keyword => 
        keyword.length > 3 && contentLower.includes(keyword)
      ).length
      if (keywordCount >= 2) score += 25
      
      setSeoScore(score)
    } else {
      setSeoScore(null)
    }
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validatePage(formData)
    
    if (!validation.isValid) {
      const formattedErrors = formatValidationErrors(validation.errors)
      setErrors(formattedErrors)
      return
    }

    const saveData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    }

    onSave(saveData)
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !page ? generateSlug(title) : prev.slug,
      metaTitle: !page ? title : prev.metaTitle
    }))
    
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
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
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              placeholder="Brief description of the page content"
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <WYSIWYGEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO title (optional, defaults to page title)"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.metaTitle?.length || 0}/60 characters
              </p>
            </div>

            <div>
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={3}
                placeholder="SEO description for search engines"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.metaDescription?.length || 0}/160 characters
              </p>
            </div>
          </div>

          {seoScore !== null && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SEO Score</h4>
                    <p className="text-sm text-gray-600">Based on title, meta description, and content</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${
                      seoScore >= 80 ? 'text-green-600' :
                      seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {seoScore}/100
                    </div>
                    <div className="text-sm text-gray-600">
                      {seoScore >= 80 ? 'Excellent' :
                       seoScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-sm text-gray-500 mt-1">Comma-separated tags for better organization</p>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Page category"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'draft' | 'published' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility">Visibility</Label>
              <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value as 'public' | 'private' | 'password_protected' }))}>
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
          </div>

          {formData.visibility === 'password_protected' && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headerMenu">Header Menu</Label>
              <Select value={formData.headerMenu} onValueChange={(value) => setFormData(prev => ({ ...prev, headerMenu: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {menus.map(menu => (
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {menus.map(menu => (
                    <SelectItem key={menu.id} value={menu.id}>
                      {menu.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Default Template</SelectItem>
                <SelectItem value="landing-page">Landing Page</SelectItem>
                <SelectItem value="full-width">Full Width</SelectItem>
                <SelectItem value="sidebar">With Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div>
            <Label htmlFor="featuredImage">Featured Image</Label>
            <Input
              id="featuredImage"
              value={formData.featuredImage}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              placeholder="Image URL"
            />
          </div>

          <div>
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              placeholder="Author name"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
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