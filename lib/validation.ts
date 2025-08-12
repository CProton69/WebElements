// Validation utilities for pages and menus

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Page validation
export function validatePage(pageData: any): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!pageData.title || !pageData.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' })
  }

  if (!pageData.slug || !pageData.slug.trim()) {
    errors.push({ field: 'slug', message: 'Slug is required' })
  } else {
    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugRegex.test(pageData.slug)) {
      errors.push({ 
        field: 'slug', 
        message: 'Slug must contain only lowercase letters, numbers, and hyphens' 
      })
    }
  }

  if (!pageData.content || !pageData.content.trim()) {
    errors.push({ field: 'content', message: 'Content is required' })
  }

  // Password validation for password-protected pages
  if (pageData.visibility === 'password_protected') {
    if (!pageData.password || !pageData.password.trim()) {
      errors.push({ 
        field: 'password', 
        message: 'Password is required for password protected pages' 
      })
    } else if (pageData.password.length < 6) {
      errors.push({ 
        field: 'password', 
        message: 'Password must be at least 6 characters long' 
      })
    }
  }

  // URL validation for external links in content
  if (pageData.content && typeof pageData.content === 'string') {
    const urlRegex = /https?:\/\/[^\s<"]+/g
    const urls = pageData.content.match(urlRegex)
    if (urls) {
      urls.forEach((url: string, index: number) => {
        try {
          new URL(url)
        } catch {
          errors.push({ 
            field: 'content', 
            message: `Invalid URL found at position ${index + 1}: ${url}` 
          })
        }
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Menu validation
export function validateMenu(menuData: any): ValidationResult {
  const errors: ValidationError[] = []

  // Required fields
  if (!menuData.name || !menuData.name.trim()) {
    errors.push({ field: 'name', message: 'Menu name is required' })
  }

  // Validate menu items JSON
  if (menuData.items) {
    try {
      const items = JSON.parse(menuData.items)
      
      // Validate menu items structure
      const validateMenuItem = (item: any, path: string = ''): void => {
        if (!item.id || !item.label || !item.url) {
          errors.push({ 
            field: 'items', 
            message: `Menu item at ${path} is missing required fields (id, label, or url)` 
          })
        }

        // Validate URL format
        if (item.url && !item.url.startsWith('#') && !item.url.startsWith('/')) {
          try {
            new URL(item.url)
          } catch {
            errors.push({ 
              field: 'items', 
              message: `Invalid URL for menu item "${item.label}" at ${path}` 
            })
          }
        }

        // Validate children recursively
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach((child: any, index: number) => {
            validateMenuItem(child, `${path}[${index}].children`)
          })
        }
      }

      if (Array.isArray(items)) {
        items.forEach((item, index) => {
          validateMenuItem(item, `[${index}]`)
        })
      }
    } catch (e) {
      errors.push({ field: 'items', message: 'Menu items must be valid JSON' })
    }
  }

  // Validate style JSON if provided
  if (menuData.style) {
    try {
      JSON.parse(menuData.style)
    } catch (e) {
      errors.push({ field: 'style', message: 'Menu style must be valid JSON' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utility to format validation errors for display
export function formatValidationErrors(errors: ValidationError[]): Record<string, string> {
  const formattedErrors: Record<string, string> = {}
  
  errors.forEach(error => {
    if (!formattedErrors[error.field]) {
      formattedErrors[error.field] = error.message
    } else {
      // If multiple errors for the same field, concatenate them
      formattedErrors[error.field] += `, ${error.message}`
    }
  })

  return formattedErrors
}

// Slug generation and validation
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Email validation (for contact forms, etc.)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}