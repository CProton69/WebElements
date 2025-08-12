'use client'

import { useState, useEffect, useCallback } from 'react'
import { Upload, X, Search, Filter, Download, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'audio' | 'document'
  size: number
  width?: number
  height?: number
  alt?: string
  caption?: string
  description?: string
  uploadedAt: Date
  tags: string[]
}

interface MediaLibraryProps {
  onSelect: (media: MediaItem) => void
  onClose: () => void
  isOpen: boolean
}

export function MediaLibrary({ onSelect, onClose, isOpen }: MediaLibraryProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Load media from localStorage (in real app, this would be from a database)
  useEffect(() => {
    const savedMedia = localStorage.getItem('media-library')
    if (savedMedia) {
      try {
        const parsed = JSON.parse(savedMedia)
        setMediaItems(parsed.map((item: any) => ({
          ...item,
          uploadedAt: new Date(item.uploadedAt)
        })))
      } catch (error) {
        console.error('Error loading media:', error)
      }
    }
  }, [])

  const saveMedia = useCallback((items: MediaItem[]) => {
    try {
      localStorage.setItem('media-library', JSON.stringify(items))
      setMediaItems(items)
      console.log('Media library saved successfully')
    } catch (error) {
      console.error('Error saving media library:', error)
      alert('Error saving media library. Please check the console for details.')
    }
  }, [])

  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesType = filterType === 'all' || item.type === filterType
    
    return matchesSearch && matchesType
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'date':
      default:
        return b.uploadedAt.getTime() - a.uploadedAt.getTime()
    }
  })

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setIsUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        setUploadProgress(progress)
        await new Promise(resolve => setTimeout(resolve, 50))
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        
        // Determine file type
        let type: MediaItem['type'] = 'document'
        if (file.type.startsWith('image/')) {
          type = 'image'
        } else if (file.type.startsWith('video/')) {
          type = 'video'
        } else if (file.type.startsWith('audio/')) {
          type = 'audio'
        }

        // Get image dimensions for images
        let width, height
        if (type === 'image') {
          const img = new Image()
          img.onload = () => {
            width = img.width
            height = img.height
            
            const newMedia: MediaItem = {
              id: `media-${Date.now()}-${i}`,
              name: file.name,
              url,
              type,
              size: file.size,
              width,
              height,
              alt: file.name.split('.')[0],
              caption: '',
              description: '',
              uploadedAt: new Date(),
              tags: []
            }
            
            saveMedia([...mediaItems, newMedia])
          }
          img.src = url
        } else {
          const newMedia: MediaItem = {
            id: `media-${Date.now()}-${i}`,
            name: file.name,
            url,
            type,
            size: file.size,
            alt: file.name.split('.')[0],
            caption: '',
            description: '',
            uploadedAt: new Date(),
            tags: []
          }
          
          saveMedia([...mediaItems, newMedia])
        }
      }
      reader.readAsDataURL(file)
    }

    setUploading(false)
    setIsUploading(false)
    setUploadProgress(0)
    
    // Reset file input
    event.target.value = ''
  }

  const handleDeleteMedia = (id: string) => {
    const updatedMedia = mediaItems.filter(item => item.id !== id)
    saveMedia(updatedMedia)
    if (selectedMedia?.id === id) {
      setSelectedMedia(null)
    }
  }

  const handleUpdateMedia = (updates: Partial<MediaItem>) => {
    if (!selectedMedia) return
    
    const updatedMedia = mediaItems.map(item => 
      item.id === selectedMedia.id ? { ...item, ...updates } : item
    )
    saveMedia(updatedMedia)
    setSelectedMedia({ ...selectedMedia, ...updates })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Media Library</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Import from URL
                  const url = prompt('Enter media URL:')
                  if (url) {
                    const newMedia: MediaItem = {
                      id: `media-${Date.now()}`,
                      name: url.split('/').pop() || 'Imported Media',
                      url,
                      type: 'image',
                      size: 0,
                      alt: '',
                      caption: '',
                      description: '',
                      uploadedAt: new Date(),
                      tags: []
                    }
                    saveMedia([...mediaItems, newMedia])
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Import URL
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - Media Grid */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b space-y-4">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Upload Area */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Label
                    htmlFor="media-upload"
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 bg-[#92003b] text-white rounded-lg cursor-pointer hover:bg-[#b8004a] transition-colors",
                      uploading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? `Uploading... ${uploadProgress}%` : 'Upload Files'}</span>
                  </Label>
                  <input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  
                  {uploading && (
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#92003b] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  {filteredMedia.length} items
                </div>
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-auto p-4">
              {filteredMedia.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">No media found</p>
                    <p className="text-sm text-gray-400">Upload some media to get started</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredMedia.map(item => (
                    <Card
                      key={item.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedMedia?.id === item.id && "ring-2 ring-[#92003b]"
                      )}
                      onClick={() => setSelectedMedia(item)}
                    >
                      <CardContent className="p-0">
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          {item.type === 'image' ? (
                            <img
                              src={item.url}
                              alt={item.alt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <span className="text-2xl">
                                    {item.type === 'video' ? '🎥' : 
                                     item.type === 'audio' ? '🎵' : '📄'}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate px-2">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-8 h-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteMedia(item.id)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-2">
                          <p className="text-sm font-medium truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(item.size)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Media Details */}
          {selectedMedia && (
            <div className="w-80 border-l p-4 overflow-auto">
              <div className="space-y-4">
                {/* Preview */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Preview</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    {selectedMedia.type === 'image' ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.alt}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-3xl">
                              {selectedMedia.type === 'video' ? '🎥' : 
                               selectedMedia.type === 'audio' ? '🎵' : '📄'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {selectedMedia.type.charAt(0).toUpperCase() + selectedMedia.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      onSelect(selectedMedia)
                      onClose()
                    }}
                  >
                    Select
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = selectedMedia.url
                      link.download = selectedMedia.name
                      link.click()
                    }}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">File Name</Label>
                    <Input
                      value={selectedMedia.name}
                      onChange={(e) => handleUpdateMedia({ name: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Alt Text</Label>
                    <Input
                      value={selectedMedia.alt || ''}
                      onChange={(e) => handleUpdateMedia({ alt: e.target.value })}
                      className="mt-1"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Caption</Label>
                    <Input
                      value={selectedMedia.caption || ''}
                      onChange={(e) => handleUpdateMedia({ caption: e.target.value })}
                      className="mt-1"
                      placeholder="Add a caption"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      value={selectedMedia.description || ''}
                      onChange={(e) => handleUpdateMedia({ description: e.target.value })}
                      className="mt-1"
                      rows={3}
                      placeholder="Add a description"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Tags</Label>
                    <Input
                      value={selectedMedia.tags.join(', ')}
                      onChange={(e) => handleUpdateMedia({ 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      className="mt-1"
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  {/* File Info */}
                  <div className="text-sm text-gray-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>{selectedMedia.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(selectedMedia.size)}</span>
                    </div>
                    {selectedMedia.width && selectedMedia.height && (
                      <div className="flex justify-between">
                        <span>Dimensions:</span>
                        <span>{selectedMedia.width} × {selectedMedia.height}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{formatDate(selectedMedia.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}