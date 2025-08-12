'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
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
  Sparkles,
  Heart,
  Share2,
  Copy,
  Maximize2,
  Settings,
  FolderOpen,
  Tag,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  Check,
  Crown,
  Layers,
  Palette,
  Smartphone,
  Tablet,
  Monitor,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  viewCount: number
  tags: string[]
  content: any // JSON content structure
  author?: string
  createdAt?: string
  updatedAt?: string
  compatibility?: {
    mobile: boolean
    tablet: boolean
    desktop: boolean
  }
  features?: string[]
  colorScheme?: string[]
  industry?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime?: string
  lastUpdated?: string
  isFavorite?: boolean
  isInstalled?: boolean
}

interface TemplateManagerEnhancedProps {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (template: Template) => void
  onSaveTemplate?: (template: Template) => void
}

const categories = [
  { value: 'all', label: 'All Templates', icon: <Layout className="w-4 h-4" /> },
  { value: 'business', label: 'Business', icon: <Award className="w-4 h-4" /> },
  { value: 'portfolio', label: 'Portfolio', icon: <Palette className="w-4 h-4" /> },
  { value: 'landing', label: 'Landing Page', icon: <Zap className="w-4 h-4" /> },
  { value: 'blog', label: 'Blog', icon: <Layers className="w-4 h-4" /> },
  { value: 'ecommerce', label: 'E-commerce', icon: <Crown className="w-4 h-4" /> },
  { value: 'agency', label: 'Agency', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'personal', label: 'Personal', icon: <Heart className="w-4 h-4" /> }
]

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'downloads', label: 'Most Downloaded' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' }
]

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
  { value: 'installed', label: 'Installed' },
  { value: 'favorites', label: 'Favorites' }
]

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-500' }
]

const enhancedMockTemplates: Template[] = [
  {
    id: '1',
    name: 'Modern Business Pro',
    description: 'Clean and professional business website template with advanced features',
    category: 'business',
    thumbnail: '/templates/business-thumb.jpg',
    preview: '/templates/business-preview.jpg',
    isPremium: true,
    rating: 4.8,
    downloadCount: 1250,
    viewCount: 5432,
    tags: ['business', 'professional', 'clean', 'corporate'],
    author: 'WebElements Team',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    compatibility: { mobile: true, tablet: true, desktop: true },
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Customizable'],
    colorScheme: ['#92003b', '#ffffff', '#f8f9fa'],
    industry: ['Technology', 'Consulting', 'Finance'],
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    lastUpdated: '2 days ago',
    isFavorite: false,
    isInstalled: false,
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
    description: 'Showcase your creative work with style and elegance',
    category: 'portfolio',
    thumbnail: '/templates/portfolio-thumb.jpg',
    preview: '/templates/portfolio-preview.jpg',
    isPremium: false,
    rating: 4.9,
    downloadCount: 890,
    viewCount: 3210,
    tags: ['portfolio', 'creative', 'gallery', 'minimal'],
    author: 'Design Studio',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    compatibility: { mobile: true, tablet: true, desktop: true },
    features: ['Gallery Layout', 'Project Showcase', 'Contact Form', 'Blog Integration'],
    colorScheme: ['#2c3e50', '#ecf0f1', '#3498db'],
    industry: ['Design', 'Photography', 'Art'],
    difficulty: 'intermediate',
    estimatedTime: '10 minutes',
    lastUpdated: '1 week ago',
    isFavorite: true,
    isInstalled: true,
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
    description: 'High-converting landing page template with marketing focus',
    category: 'landing',
    thumbnail: '/templates/landing-thumb.jpg',
    preview: '/templates/landing-preview.jpg',
    isPremium: true,
    rating: 4.7,
    downloadCount: 2100,
    viewCount: 8765,
    tags: ['landing', 'conversion', 'marketing', 'sales'],
    author: 'Marketing Experts',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-22',
    compatibility: { mobile: true, tablet: true, desktop: true },
    features: ['Conversion Optimized', 'A/B Testing Ready', 'Lead Capture', 'Analytics'],
    colorScheme: ['#e74c3c', '#ffffff', '#34495e'],
    industry: ['SaaS', 'Marketing', 'Startup'],
    difficulty: 'advanced',
    estimatedTime: '15 minutes',
    lastUpdated: '3 days ago',
    isFavorite: false,
    isInstalled: false,
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
  },
  {
    id: '4',
    name: 'E-commerce Store',
    description: 'Complete online store template with product showcase',
    category: 'ecommerce',
    thumbnail: '/templates/ecommerce-thumb.jpg',
    preview: '/templates/ecommerce-preview.jpg',
    isPremium: true,
    rating: 4.6,
    downloadCount: 3200,
    viewCount: 12000,
    tags: ['ecommerce', 'store', 'shopping', 'products'],
    author: 'Commerce Team',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-25',
    compatibility: { mobile: true, tablet: true, desktop: true },
    features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Inventory Management'],
    colorScheme: ['#27ae60', '#ffffff', '#2c3e50'],
    industry: ['Retail', 'Fashion', 'Electronics'],
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    lastUpdated: '1 day ago',
    isFavorite: true,
    isInstalled: false,
    content: {
      sections: [
        {
          type: 'hero',
          title: 'Welcome to Our Store',
          subtitle: 'Discover amazing products'
        },
        {
          type: 'products',
          title: 'Featured Products',
          items: ['Product 1', 'Product 2', 'Product 3']
        }
      ]
    }
  }
]

export function TemplateManagerEnhanced({ 
  isOpen, 
  onClose, 
  onSelectTemplate,
  onSaveTemplate 
}: TemplateManagerEnhancedProps) {
  const [templates, setTemplates] = useState<Template[]>(enhancedMockTemplates)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  const [sortBy, setSortBy] = useState('popular')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')

  // Get unique tags and industries from templates
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet).sort()
  }, [templates])

  const allIndustries = useMemo(() => {
    const industrySet = new Set<string>()
    templates.forEach(template => {
      template.industry?.forEach(industry => industrySet.add(industry))
    })
    return Array.from(industrySet).sort()
  }, [templates])

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      // Search filter
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           template.author?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      
      // Premium/Free filter
      const matchesFilter = selectedFilter === 'all' || 
                           (selectedFilter === 'free' && !template.isPremium) ||
                           (selectedFilter === 'premium' && template.isPremium) ||
                           (selectedFilter === 'installed' && template.isInstalled) ||
                           (selectedFilter === 'favorites' && template.isFavorite)
      
      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.every(tag => template.tags.includes(tag))
      
      // Industry filter
      const matchesIndustry = selectedIndustry === 'all' || 
                             template.industry?.includes(selectedIndustry)
      
      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === 'all' || 
                               template.difficulty === selectedDifficulty
      
      return matchesSearch && matchesCategory && matchesFilter && matchesTags && matchesIndustry && matchesDifficulty
    })

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.viewCount - a.viewCount
        case 'newest':
          return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        case 'rating':
          return b.rating - a.rating
        case 'downloads':
          return b.downloadCount - a.downloadCount
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })

    return filtered
  }, [templates, searchTerm, selectedCategory, selectedFilter, sortBy, selectedTags, selectedIndustry, selectedDifficulty])

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
      // For now, we'll use the enhanced mock templates
      setTemplates(enhancedMockTemplates)
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
      await new Promise(resolve => setTimeout(resolve, 1500))
      
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
    setPreviewTemplate(template)
  }

  const handleDownloadTemplate = async (template: Template) => {
    try {
      // Simulate download
      const exportData = {
        template: template.name,
        content: template.content,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`Template "${template.name}" downloaded successfully`)
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Failed to download template')
    }
  }

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    )
    
    const template = templates.find(t => t.id === templateId)
    if (template) {
      toast.success(template.isFavorite ? 'Removed from favorites' : 'Added to favorites')
    }
  }

  const handleShareTemplate = (template: Template) => {
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Template link copied to clipboard')
    }
  }

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(JSON.stringify(template.content, null, 2))
    toast.success('Template content copied to clipboard')
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const TemplateCard = ({ template }: { template: Template }) => {
    const difficulty = difficultyLevels.find(d => d.value === template.difficulty)
    
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group relative overflow-hidden",
          selectedTemplate?.id === template.id ? 'ring-2 ring-[#92003b]' : ''
        )}
        onClick={() => setSelectedTemplate(template)}
      >
        <CardHeader className="pb-3">
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              <Layout className="w-16 h-16 text-gray-400" />
              {template.isPremium && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <div className="flex gap-1">
                  {template.compatibility?.mobile && (
                    <Smartphone className="w-4 h-4 text-gray-600" />
                  )}
                  {template.compatibility?.tablet && (
                    <Tablet className="w-4 h-4 text-gray-600" />
                  )}
                  {template.compatibility?.desktop && (
                    <Monitor className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-1">
                  {template.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{template.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{template.downloadCount} downloads</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleFavorite(template.id)
                }}
              >
                <Heart className={cn("w-4 h-4", template.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400")} />
              </Button>
            </div>
          </div>
          
          <CardDescription className="text-sm line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {template.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Difficulty and Category */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {difficulty && (
                  <Badge className={cn("text-xs", difficulty.color)}>
                    {difficulty.label}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{template.estimatedTime}</span>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
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
                className="text-xs"
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
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownloadTemplate(template)
                }}
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareTemplate(template)
                }}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TemplateListItem = ({ template }: { template: Template }) => {
    const difficulty = difficultyLevels.find(d => d.value === template.difficulty)
    
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          selectedTemplate?.id === template.id ? 'ring-2 ring-[#92003b]' : ''
        )}
        onClick={() => setSelectedTemplate(template)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-32 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <Layout className="w-8 h-8 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-lg">{template.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{template.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{template.downloadCount} downloads</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{template.viewCount} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.isPremium && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {difficulty && (
                    <Badge className={cn("text-xs", difficulty.color)}>
                      {difficulty.label}
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{template.estimatedTime}</span>
                  </div>
                  {template.author && (
                    <span className="text-xs text-gray-500">by {template.author}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
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
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
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
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        {category.icon}
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

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

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2">Industry</Label>
                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                      <SelectTrigger>
                        <SelectValue placeholder="All industries" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All industries</SelectItem>
                        {allIndustries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2">Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All levels</SelectItem>
                        {difficultyLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", level.color)} />
                              {level.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2">Tags</Label>
                    <div className="flex flex-wrap gap-1">
                      {allTags.slice(0, 8).map(tag => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="text-xs cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Active Filters */}
            {(selectedTags.length > 0 || selectedIndustry !== 'all' || selectedDifficulty !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {selectedIndustry !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => setSelectedIndustry('all')}
                  >
                    {selectedIndustry} ×
                  </Badge>
                )}
                {selectedDifficulty !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-pointer"
                    onClick={() => setSelectedDifficulty('all')}
                  >
                    {difficultyLevels.find(d => d.value === selectedDifficulty)?.label} ×
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    setSelectedTags([])
                    setSelectedIndustry('all')
                    setSelectedDifficulty('all')
                  }}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Templates Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#92003b]" />
                <span className="ml-2 text-lg font-medium">Loading templates...</span>
              </div>
            ) : filteredAndSortedTemplates.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredAndSortedTemplates.map((template) => (
                  viewMode === 'grid' ? (
                    <TemplateCard key={template.id} template={template} />
                  ) : (
                    <TemplateListItem key={template.id} template={template} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layout className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="w-6 h-6 text-[#92003b]" />
                  {previewTemplate.name}
                </div>
                <div className="flex items-center gap-2">
                  {previewTemplate.isPremium && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{previewTemplate.rating}</span>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Preview Area */}
              <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Layout className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Template Preview</h3>
                  <p className="text-gray-500">Preview of "{previewTemplate.name}" template</p>
                </div>
              </div>
              
              {/* Template Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Description</h4>
                  <p className="text-sm text-gray-600">{previewTemplate.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {previewTemplate.features?.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <Badge variant="secondary">{previewTemplate.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <Badge className={
                        difficultyLevels.find(d => d.value === previewTemplate.difficulty)?.color || 'bg-gray-500'
                      }>
                        {difficultyLevels.find(d => d.value === previewTemplate.difficulty)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span>{previewTemplate.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Author:</span>
                      <span>{previewTemplate.author || 'WebElements Team'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Compatibility</h4>
                  <div className="flex items-center gap-4 text-sm">
                    {previewTemplate.compatibility?.mobile && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-4 h-4 text-green-500" />
                        <span>Mobile</span>
                      </div>
                    )}
                    {previewTemplate.compatibility?.tablet && (
                      <div className="flex items-center gap-1">
                        <Tablet className="w-4 h-4 text-green-500" />
                        <span>Tablet</span>
                      </div>
                    )}
                    {previewTemplate.compatibility?.desktop && (
                      <div className="flex items-center gap-1">
                        <Monitor className="w-4 h-4 text-green-500" />
                        <span>Desktop</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <h4 className="font-medium mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                  Close
                </Button>
                <Button variant="outline" onClick={() => handleDownloadTemplate(previewTemplate)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button 
                  onClick={() => {
                    handleUseTemplate(previewTemplate)
                    setPreviewTemplate(null)
                  }}
                  className="bg-[#92003b] hover:bg-[#b8004a]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}