'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  FileText, 
  Globe, 
  Lock, 
  Key, 
  LayoutTemplate,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { WYSIWYGEditor } from '@/components/ui/wysiwyg-editor'
import { validatePage, formatValidationErrors, generateSlug, isValidSlug } from '@/lib/validation'
import { realtimeManager } from '@/lib/realtime'

interface PageCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onPageCreated: (page: any) => void
  templates?: Array<{
    id: string
    name: string
    description: string
    elements: any[]
  }>
}

interface Template {
  id: string
  name: string
  description: string
  elements: any[]
}

const defaultTemplates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Page',
    description: 'Start with a clean slate',
    elements: []
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Perfect for marketing and product pages',
    elements: [
      {
        id: 'hero-section',
        type: 'section',
        children: [
          {
            id: 'hero-column',
            type: 'column',
            children: [
              {
                id: 'hero-heading',
                type: 'widget',
                widgetType: 'heading',
                children: [],
                content: { text: 'Welcome to Your Website' },
                styles: { fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' },
                props: {}
              },
              {
                id: 'hero-subheading',
                type: 'widget',
                widgetType: 'heading',
                children: [],
                content: { text: 'Create something amazing today' },
                styles: { fontSize: '24px', fontWeight: 'normal', textAlign: 'center', marginBottom: '30px' },
                props: {}
              },
              {
                id: 'hero-button',
                type: 'widget',
                widgetType: 'button',
                children: [],
                content: { text: 'Get Started', url: '#', openInNewTab: false },
                styles: { 
                  backgroundColor: '#92003b', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '8px',
                  display: 'inline-block',
                  textAlign: 'center'
                },
                props: {}
              }
            ],
            content: {},
            styles: { padding: '80px 20px', textAlign: 'center' },
            props: { width: 12 }
          }
        ],
        content: {},
        styles: { 
          backgroundColor: '#f8f9fa',
          padding: '60px 0px'
        },
        props: {}
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog Post',
    description: 'Perfect for articles and blog posts',
    elements: [
      {
        id: 'blog-header',
        type: 'section',
        children: [
          {
            id: 'blog-column',
            type: 'column',
            children: [
              {
                id: 'blog-title',
                type: 'widget',
                widgetType: 'heading',
                children: [],
                content: { text: 'Blog Post Title' },
                styles: { fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' },
                props: {}
              },
              {
                id: 'blog-meta',
                type: 'widget',
                widgetType: 'text',
                children: [],
                content: { text: 'By Author Name • January 1, 2024 • 5 min read' },
                styles: { fontSize: '14px', color: '#6b7280', marginBottom: '24px' },
                props: {}
              }
            ],
            content: {},
            styles: { padding: '40px 20px' },
            props: { width: 12 }
          }
        ],
        content: {},
        styles: { borderBottom: '1px solid #e5e7eb' },
        props: {}
      },
      {
        id: 'blog-content',
        type: 'section',
        children: [
          {
            id: 'content-column',
            type: 'column',
            children: [
              {
                id: 'blog-text',
                type: 'widget',
                widgetType: 'text',
                children: [],
                content: { text: 'Start writing your blog post content here. This is a great place to share your thoughts, ideas, and expertise with your audience.' },
                styles: { fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' },
                props: {}
              }
            ],
            content: {},
            styles: { padding: '40px 20px' },
            props: { width: 12 }
          }
        ],
        content: {},
        styles: {},
        props: {}
      }
    ]
  }
]

export function PageCreationModal({ isOpen, onClose, onPageCreated, templates = defaultTemplates }: PageCreationModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    visibility: 'public' as 'public' | 'private' | 'password_protected',
    password: '',
    template: '',
    status: 'draft' as 'draft' | 'published',
    headerMenu: '',
    footerMenu: '',
    selectedTemplate: 'blank'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [creationStep, setCreationStep] = useState<'details' | 'template' | 'content'>('details')
  const [availableTemplates] = useState<Template[]>(templates)
  const [showPreview, setShowPreview] = useState(false)
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

  const handleCreatePage = async () => {
    setIsCreating(true)
    
    try {
      // Validate form data
      const validation = validatePage(formData)
      
      if (!validation.isValid) {
        const formattedErrors = formatValidationErrors(validation.errors)
        setErrors(formattedErrors)
        setIsCreating(false)
        return
      }

      // Create the page
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create page')
      }

      const createdPage = await response.json()
      
      // Broadcast real-time update
      realtimeManager.broadcastPageUpdate('create', createdPage)

      // Get template elements
      const selectedTemplate = availableTemplates.find(t => t.id === formData.selectedTemplate)
      const templateElements = selectedTemplate ? selectedTemplate.elements : []

      // Call the callback with the created page and template elements
      onPageCreated({
        page: createdPage,
        elements: templateElements
      })

      // Reset form and close modal
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        metaTitle: '',
        metaDescription: '',
        visibility: 'public',
        password: '',
        template: '',
        status: 'draft',
        headerMenu: '',
        footerMenu: '',
        selectedTemplate: 'blank'
      })
      setErrors({})
      setCreationStep('details')
      setIsCreating(false)
      onClose()

    } catch (error) {
      console.error('Error creating page:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create page'
      setErrors({ general: errorMessage })
      setIsCreating(false)
    }
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
    
    // Clear slug error if it exists
    if (errors.slug) {
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

  const nextStep = () => {
    if (creationStep === 'details') {
      // Validate required fields before proceeding
      const requiredErrors: Record<string, string> = {}
      if (!formData.title.trim()) requiredErrors.title = 'Title is required'
      if (!formData.slug.trim()) requiredErrors.slug = 'Slug is required'
      
      if (Object.keys(requiredErrors).length > 0) {
        setErrors(requiredErrors)
        return
      }
      
      setErrors({})
      setCreationStep('template')
    } else if (creationStep === 'template') {
      setCreationStep('content')
    }
  }

  const previousStep = () => {
    if (creationStep === 'content') {
      setCreationStep('template')
    } else if (creationStep === 'template') {
      setCreationStep('details')
    }
  }

  const getTemplatePreview = (templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId)
    return template ? template.elements : []
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Page
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[
            { id: 'details', label: 'Page Details', icon: FileText },
            { id: 'template', label: 'Choose Template', icon: LayoutTemplate },
            { id: 'content', label: 'Review & Create', icon: CheckCircle }
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                creationStep === step.id 
                  ? 'border-[#92003b] bg-[#92003b] text-white' 
                  : creationStep === 'content' || (creationStep === 'template' && step.id === 'details')
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {creationStep === step.id ? (
                  <step.icon className="w-4 h-4" />
                ) : creationStep === 'content' || (creationStep === 'template' && step.id === 'details') ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                creationStep === step.id ? 'text-[#92003b]' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < 2 && (
                <div className="ml-4 w-16 h-0.5 bg-gray-300"></div>
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{errors.general}</span>
            </div>
          </div>
        )}

        {/* Step 1: Page Details */}
        {creationStep === 'details' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={errors.title ? 'border-red-500' : ''}
                    placeholder="Enter page title"
                  />
                  {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="slug">Page Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className={errors.slug ? 'border-red-500' : ''}
                    placeholder="page-url"
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
            </div>

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
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="headerMenu">Header Menu</Label>
                  <Select value={formData.headerMenu} onValueChange={(value) => setFormData(prev => ({ ...prev, headerMenu: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select header menu..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No header menu</SelectItem>
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
                      <SelectItem value="">No footer menu</SelectItem>
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
          </div>
        )}

        {/* Step 2: Template Selection */}
        {creationStep === 'template' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Choose a Template</h3>
              <p className="text-sm text-gray-600 mb-6">Select a template to get started with a pre-designed layout</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {availableTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.selectedTemplate === template.id 
                        ? 'ring-2 ring-[#92003b] border-[#92003b]' 
                        : 'border-gray-200'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, selectedTemplate: template.id }))}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={formData.selectedTemplate === template.id ? "default" : "secondary"}>
                          {formData.selectedTemplate === template.id ? 'Selected' : 'Select'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowPreview(true)
                          }}
                        >
                          Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {creationStep === 'content' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Review Your Page</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Page Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Title:</span>
                        <p className="text-gray-900">{formData.title}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Slug:</span>
                        <p className="text-gray-900">/{formData.slug}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <Badge className={formData.status === 'published' ? 'bg-green-500' : 'bg-gray-500'}>
                          {formData.status}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Visibility:</span>
                        <p className="text-gray-900 capitalize">{formData.visibility.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Template</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4" />
                      <span className="font-medium">
                        {availableTemplates.find(t => t.id === formData.selectedTemplate)?.name || 'Blank Page'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {availableTemplates.find(t => t.id === formData.selectedTemplate)?.description || 'Start with a clean slate'}
                    </p>
                  </CardContent>
                </Card>

                {(formData.headerMenu || formData.footerMenu) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Menu Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        {formData.headerMenu && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Header Menu:</span>
                            <p className="text-gray-900">{menus.find(m => m.id === formData.headerMenu)?.name || 'None'}</p>
                          </div>
                        )}
                        {formData.footerMenu && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">Footer Menu:</span>
                            <p className="text-gray-900">{menus.find(m => m.id === formData.footerMenu)?.name || 'None'}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {creationStep !== 'details' && (
              <Button variant="outline" onClick={previousStep}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {creationStep === 'content' ? (
              <Button 
                onClick={handleCreatePage} 
                disabled={isCreating}
                className="bg-[#92003b] hover:bg-[#b8004a]"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Page
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep} className="bg-[#92003b] hover:bg-[#b8004a]">
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}