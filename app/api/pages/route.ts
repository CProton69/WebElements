import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(input: string): string {
  const base = (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "page";
}

async function getUniqueSlug(baseTitle: string) {
  const base = slugify(baseTitle);
  let candidate = base;
  let i = 2;

  // Since slug is unique, loop until we find a free one
  // Using findUnique is efficient because slug has a unique index
  while (true) {
    const existing = await prisma.page.findUnique({
      where: { slug: candidate },
    });
    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i++;
  }
}

export async function GET() {
  const pages = await prisma.page.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(pages);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title: string = body.title ?? "Untitled Page";
    const status: string = body.status ?? "draft";
    const visibility: string = body.visibility ?? "public";

    // Ensure content is a string (stringified JSON)
    let content: string;
    if (typeof body.content === "string") {
      content = body.content;
    } else {
      content = JSON.stringify(body.content ?? []);
    }

    // Generate unique slug if not provided
    const slug: string =
      body.slug && typeof body.slug === "string"
        ? await getUniqueSlug(body.slug)
        : await getUniqueSlug(title);

    const created = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        status,
        visibility,
        excerpt: body.excerpt ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
        password: body.password ?? null,
        template: body.template ?? null,
        headerMenu: body.headerMenu ?? null,
        footerMenu: body.footerMenu ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create page" },
      { status: 500 }
    );
  }
}
