'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { 
  X, 
  Target, 
  Sparkles, 
  Users, 
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Download,
  Loader2
} from 'lucide-react'

interface LandingPageData {
  title: string
  subtitle: string
  description: string
  goal: 'leads' | 'sales' | 'signups' | 'downloads'
  industry: string
  targetAudience: string
  keyFeatures: string[]
  callToAction: {
    primary: string
    secondary: string
  }
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  template: string
}

interface LandingPageCreatorProps {
  isOpen: boolean
  onClose: () => void
  onCreateLandingPage: (data: LandingPageData) => void
}

const industries = [
  'technology', 'healthcare', 'finance', 'education', 'real-estate',
  'restaurant', 'retail', 'consulting', 'manufacturing', 'other'
]

const goals = [
  { value: 'leads', label: 'Generate Leads', icon: <Users className="w-4 h-4" /> },
  { value: 'sales', label: 'Drive Sales', icon: <TrendingUp className="w-4 h-4" /> },
  { value: 'signups', label: 'Get Signups', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'downloads', label: 'Increase Downloads', icon: <Download className="w-4 h-4" /> }
]

const templates = [
  { id: 'minimal', name: 'Minimal & Clean', description: 'Clean design focused on conversion' },
  { id: 'modern', name: 'Modern & Bold', description: 'Contemporary design with striking visuals' },
  { id: 'professional', name: 'Professional & Trustworthy', description: 'Corporate style for established businesses' },
  { id: 'creative', name: 'Creative & Unique', description: 'Stand out with innovative design' }
]

export function LandingPageCreator({ isOpen, onClose, onCreateLandingPage }: LandingPageCreatorProps) {
  const [formData, setFormData] = useState<LandingPageData>({
    title: '',
    subtitle: '',
    description: '',
    goal: 'leads',
    industry: '',
    targetAudience: '',
    keyFeatures: [''],
    callToAction: {
      primary: '',
      secondary: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      address: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ['']
    },
    template: 'minimal'
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4
  const [isCreating, setIsCreating] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof LandingPageData] as any,
        [field]: value
      }
    }))
  }

  const addKeyFeature = () => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, '']
    }))
  }

  const updateKeyFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.map((feature, i) => i === index ? value : feature)
    }))
  }

  const removeKeyFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index)
    }))
  }

  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: [...prev.seo.keywords, '']
      }
    }))
  }

  const updateKeyword = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.map((keyword, i) => i === index ? value : keyword)
      }
    }))
  }

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index)
      }
    }))
  }

  const handleSubmit = async () => {
    setIsCreating(true)
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        toast.error('Title is required')
        return
      }
      
      if (!formData.industry) {
        toast.error('Industry is required')
        return
      }
      
      // Filter out empty features and keywords
      const cleanedData = {
        ...formData,
        keyFeatures: formData.keyFeatures.filter(feature => feature.trim() !== ''),
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords.filter(keyword => keyword.trim() !== '')
        }
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      onCreateLandingPage(cleanedData)
      toast.success('Landing page created successfully!')
      onClose()
    } catch (error) {
      console.error('Error creating landing page:', error)
      toast.error('Failed to create landing page')
    } finally {
      setIsCreating(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="title">Landing Page Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Transform Your Business Today"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="e.g., The ultimate solution for modern businesses"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of your landing page purpose"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Goal & Target Audience</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Primary Goal *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {goals.map(goal => (
                      <Card
                        key={goal.value}
                        className={`cursor-pointer transition-all ${
                          formData.goal === goal.value 
                            ? 'ring-2 ring-[#92003b] bg-[#92003b]/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('goal', goal.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            {goal.icon}
                            <span className="font-medium">{goal.label}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>
                          {industry.charAt(0).toUpperCase() + industry.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    placeholder="Describe your target audience (e.g., Small business owners aged 25-45)"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Content & Features</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Key Features</Label>
                  <div className="space-y-2 mt-2">
                    {formData.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateKeyFeature(index, e.target.value)}
                          placeholder={`Feature ${index + 1}`}
                        />
                        {formData.keyFeatures.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeKeyFeature(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyFeature}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryCTA">Primary Call-to-Action</Label>
                    <Input
                      id="primaryCTA"
                      value={formData.callToAction.primary}
                      onChange={(e) => handleNestedChange('callToAction', 'primary', e.target.value)}
                      placeholder="e.g., Get Started"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryCTA">Secondary Call-to-Action</Label>
                    <Input
                      id="secondaryCTA"
                      value={formData.callToAction.secondary}
                      onChange={(e) => handleNestedChange('callToAction', 'secondary', e.target.value)}
                      placeholder="e.g., Learn More"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Template & Final Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Choose Template</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {templates.map(template => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          formData.template === template.id 
                            ? 'ring-2 ring-[#92003b] bg-[#92003b]/5' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => handleInputChange('template', template.id)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>SEO Keywords</Label>
                  <div className="space-y-2 mt-2">
                    {formData.seo.keywords.map((keyword, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={keyword}
                          onChange={(e) => updateKeyword(index, e.target.value)}
                          placeholder={`Keyword ${index + 1}`}
                        />
                        {formData.seo.keywords.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeKeyword(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addKeyword}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Keyword
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6 text-[#92003b]" />
              Create Landing Page
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
            Create a high-converting landing page tailored to your business needs
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">
              {currentStep === 1 && 'Basic Info'}
              {currentStep === 2 && 'Goal & Audience'}
              {currentStep === 3 && 'Content & Features'}
              {currentStep === 4 && 'Template & Details'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#92003b] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} className="bg-[#92003b] hover:bg-[#b8004a]">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-[#92003b] hover:bg-[#b8004a]" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Landing Page'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}