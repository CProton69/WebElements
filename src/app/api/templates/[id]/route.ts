// app/api/templates/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await prisma.template.update({
      where: { id: params.id },
      data: {
        name: typeof body.name === "string" ? body.name : undefined,
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
      { error: err?.message || "Failed to update template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.template.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to delete template" },
      { status: 500 }
    );
  }
}
