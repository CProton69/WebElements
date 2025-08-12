import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name: string = body.name ?? "Untitled Template";
    let content: string;
    if (typeof body.content === "string") {
      content = body.content;
    } else {
      content = JSON.stringify(body.content ?? []);
    }

    const created = await prisma.template.create({
      data: { name, content },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create template" },
      { status: 500 }
    );
  }
}
