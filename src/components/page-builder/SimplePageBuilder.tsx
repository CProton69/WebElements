'use client'

import { useState } from 'react'

export interface PageElement {
  id: string
  type: 'section' | 'column' | 'widget'
  widgetType?: string
  children: PageElement[]
  content: any
  styles: any
  props: any
}

export function SimplePageBuilder() {
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null)
  const [pageElements, setPageElements] = useState<PageElement[]>([])

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-white border-b">
        <h1 className="text-2xl font-bold">Simple Page Builder</h1>
        <p className="text-gray-600">Selected: {selectedElement?.id || 'None'}</p>
      </div>
      <div className="flex-1 p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 h-full">
          <p className="text-gray-500">Page Elements: {pageElements.length}</p>
        </div>
      </div>
    </div>
  )
}