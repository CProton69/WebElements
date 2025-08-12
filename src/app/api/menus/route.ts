import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/menus - Get all menus
export async function GET() {
  try {
    const menus = await db.menu.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ menus })
  } catch (error) {
    console.error('Error fetching menus:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menus' },
      { status: 500 }
    )
  }
}

// POST /api/menus - Create a new menu
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, location, items = '[]', style, isActive = true } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Menu name is required' },
        { status: 400 }
      )
    }

    // Validate items is valid JSON
    try {
      JSON.parse(items)
    } catch (e) {
      return NextResponse.json(
        { error: 'Menu items must be valid JSON' },
        { status: 400 }
      )
    }

    const menu = await db.menu.create({
      data: {
        name,
        location,
        items,
        style,
        isActive
      }
    })

    return NextResponse.json(menu, { status: 201 })
  } catch (error) {
    console.error('Error creating menu:', error)
    return NextResponse.json(
      { error: 'Failed to create menu' },
      { status: 500 }
    )
  }
}