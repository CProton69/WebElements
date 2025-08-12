import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/pages - Get all pages

export async function GET() {
  try {
    const pages = await db.page.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

// POST /api/pages - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      visibility = "public",
      password,
      template,
      status = "draft",
      headerMenu,
      footerMenu,
    } = body;

    // Validate required fields
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPage = await db.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        metaTitle,
        metaDescription,
        visibility,
        password,
        template,
        status,
        headerMenu,
        footerMenu,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating page:", error);
    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 }
    );
  }
}
