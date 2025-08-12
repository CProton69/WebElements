// app/api/pages/[id]/route.ts
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

async function getUniqueSlug(candidateBase: string, currentId?: string) {
  const base = slugify(candidateBase);
  let candidate = base;
  let i = 2;
  // loop until unique (excluding the current record)
  while (true) {
    const existing = await prisma.page.findFirst({
      where: {
        slug: candidate,
        NOT: currentId ? { id: currentId } : undefined,
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${i}`;
    i++;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const page = await prisma.page.findUnique({ where: { id: params.id } });
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const existing = await prisma.page.findUnique({ where: { id: params.id } });
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    let slug = existing.slug;
    if (typeof body.slug === "string" && body.slug.trim()) {
      // Make sure slug is unique even on edit
      slug = await getUniqueSlug(body.slug, params.id);
    } else if (
      typeof body.title === "string" &&
      body.title.trim() &&
      !body.slug
    ) {
      // Allow regenerating slug from title if you want that behavior:
      // comment this out if you only want to change slug when provided explicitly
      slug = await getUniqueSlug(body.title, params.id);
    }

    const updated = await prisma.page.update({
      where: { id: params.id },
      data: {
        title: typeof body.title === "string" ? body.title : undefined,
        slug,
        status: typeof body.status === "string" ? body.status : undefined,
        visibility:
          typeof body.visibility === "string" ? body.visibility : undefined,
        excerpt: typeof body.excerpt === "string" ? body.excerpt : undefined,
        metaTitle:
          typeof body.metaTitle === "string" ? body.metaTitle : undefined,
        metaDescription:
          typeof body.metaDescription === "string"
            ? body.metaDescription
            : undefined,
        password: typeof body.password === "string" ? body.password : undefined,
        template: typeof body.template === "string" ? body.template : undefined,
        headerMenu:
          typeof body.headerMenu === "string" ? body.headerMenu : undefined,
        footerMenu:
          typeof body.footerMenu === "string" ? body.footerMenu : undefined,
        // If you also want to let PATCH update content:
        content:
          typeof body.content === "string"
            ? body.content
            : body.content !== undefined
            ? JSON.stringify(body.content)
            : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update page" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.page.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete page" },
      { status: 500 }
    );
  }
}
