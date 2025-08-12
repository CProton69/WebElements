'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  X, 
  Search, 
  Layout, 
  Eye, 
  Download,
  Star,
  Filter,
  Grid,
  List,
  Loader2,
  Plus,
  Sparkles
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  preview: string
  isPremium: boolean
  rating: number
  downloadCount: number
  tags: string[]
  content: any // JSON content structure
}

interface TemplateManagerProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Business',
    description: 'Clean and professional business website template',
    category: 'business',
    thumbnail: '/templates/business-thumb.jpg',
    preview: '/templates/business-preview.jpg',
    isPremium: false,
    rating: 4.8,
    downloadCount: 1250,
    tags: ['business', 'professional', 'clean'],
    content: {
      sections: [
        {
          type: 'hero',
          title: 'Welcome to Our Business',
          subtitle: 'Professional solutions for your needs'
        },
        {
          type: 'features',
          title: 'Our Features',
          features: ['Feature 1', 'Feature 2', 'Feature 3']
        }
      ]
    }
  },
  {
    id: '2',
    name: 'Creative Portfolio',
    description: 'Showcase your creative work with style',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-thumb.jpg',
    preview: '/templates/portfolio-preview.jpg',
    isPremium: true,
    rating: 4.9,
    downloadCount: 890,
    tags: ['portfolio', 'creative', 'gallery'],
    content: {
      sections: [
        {
          type: 'hero',
          title: 'Creative Portfolio',
          subtitle: 'Showcasing amazing work'
        },
        {
          type: 'gallery',
          title: 'My Work',
          items: ['Project 1', 'Project 2', 'Project 3']
        }
      ]
    }
  },
  {
    id: '3',
    name: 'Landing Page Pro',
    description: 'High-converting landing page template',
    category: 'landing',
    thumbnail: '/templates/landing-thumb.jpg',
    preview: '/templates/landing-preview.jpg',
    isPremium: true,
    rating: 4.7,
    downloadCount: 2100,
    tags: ['landing', 'conversion', 'marketing'],
    content: {
      sections: [
        {
          type: 'hero',
          title: 'Get Started Today',
          subtitle: 'Transform your business with our solution'
        },
        {
          type: 'cta',
          title: 'Ready to Begin?',
          button: 'Get Started'
        }
      ]
    }
  }
]

const categories = ['all', 'business', 'portfolio', 'landing', 'blog', 'ecommerce']

export function TemplateManager({ isOpen, onClose, onSelectTemplate }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState(false)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Load templates when component opens
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    setLoading(true)
    try {
      // In a real implementation, you would fetch from an API
      // For now, we'll use the mock templates
      setTemplates(mockTemplates)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = async (template: Template) => {
    setApplyingTemplate(true)
    try {
      // Simulate template application
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSelectTemplate(template)
      toast.success(`Template "${template.name}" applied successfully!`)
      onClose()
    } catch (error) {
      console.error('Error applying template:', error)
      toast.error('Failed to apply template')
    } finally {
      setApplyingTemplate(false)
    }
  }

  const handlePreviewTemplate = (template: Template) => {
    // In a real implementation, this would open a preview modal
    toast.info(`Previewing "${template.name}"`)
    console.log('Preview template:', template)
  }

  const handleDownloadTemplate = (template: Template) => {
    // In a real implementation, this would download the template
    toast.info(`Downloading "${template.name}"`)
    console.log('Download template:', template)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Layout className="w-6 h-6 text-[#92003b]" />
              Template Library
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            Choose from professionally designed templates to jumpstart your project
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#92003b]" />
              <span className="ml-2 text-lg font-medium">Loading templates...</span>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }>
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-[#92003b]' : ''
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        <Layout className="w-16 h-16 text-gray-400" />
                      </div>
                      {template.isPremium && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                          <Star className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {template.name}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{template.rating}</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{template.downloadCount} downloads</span>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUseTemplate(template)
                          }}
                          disabled={applyingTemplate}
                        >
                          {applyingTemplate && selectedTemplate?.id === template.id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Use Template
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePreviewTemplate(template)
                          }}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadTemplate(template)
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}