import { NextRequest, NextResponse } from 'next/server'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface MediaItem {
  id: string
  name: string
  type: 'image' | 'video' | 'document'
  url: string
  size: number
  createdAt: string
}

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    
    if (!existsSync(uploadsDir)) {
      return NextResponse.json({ media: [] })
    }

    const files = await readdir(uploadsDir)
    const mediaItems: MediaItem[] = []

    for (const file of files) {
      const filePath = join(uploadsDir, file)
      const stats = await readFile(filePath).then(() => {
        // In a real implementation, you'd get file stats
        return { size: 0 }
      }).catch(() => ({ size: 0 }))

      // Parse filename to get original info
      const parts = file.split('-')
      if (parts.length >= 2) {
        const timestamp = parts[0]
        const randomId = parts[1].split('.')[0]
        const extension = parts[1].split('.')[1]

        // Determine file type
        let fileType: 'image' | 'video' | 'document' = 'document'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension.toLowerCase())) {
          fileType = 'image'
        } else if (['mp4', 'mov', 'avi'].includes(extension.toLowerCase())) {
          fileType = 'video'
        }

        mediaItems.push({
          id: `${timestamp}-${randomId}`,
          name: file,
          type: fileType,
          url: `/uploads/${file}`,
          size: stats.size,
          createdAt: new Date(parseInt(timestamp)).toISOString()
        })
      }
    }

    // Sort by creation date (newest first)
    mediaItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ media: mediaItems })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}