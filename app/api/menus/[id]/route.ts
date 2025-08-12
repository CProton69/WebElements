import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/menus/[id] - Get a specific menu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const menu = await db.menu.findUnique({
      where: { id: params.id }
    })

    if (!menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

// PUT /api/menus/[id] - Update a menu
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, location, items, style, isActive } = body

    // Check if menu exists
    const existingMenu = await db.menu.findUnique({
      where: { id: params.id }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    // Validate items is valid JSON if provided
    if (items) {
      try {
        JSON.parse(items)
      } catch (e) {
        return NextResponse.json(
          { error: 'Menu items must be valid JSON' },
          { status: 400 }
        )
      }
    }

    const menu = await db.menu.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(items !== undefined && { items }),
        ...(style !== undefined && { style }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error updating menu:', error)
    return NextResponse.json(
      { error: 'Failed to update menu' },
      { status: 500 }
    )
  }
}

// DELETE /api/menus/[id] - Delete a menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if menu exists
    const existingMenu = await db.menu.findUnique({
      where: { id: params.id }
    })

    if (!existingMenu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      )
    }

    await db.menu.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Menu deleted successfully' })
  } catch (error) {
    console.error('Error deleting menu:', error)
    return NextResponse.json(
      { error: 'Failed to delete menu' },
      { status: 500 }
    )
  }
}