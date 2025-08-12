import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET() {
  const landings = await prisma.landingPage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(landings);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title: string = body.title ?? "Untitled Landing";
    const campaign: string | undefined = body.campaign;

    let content: string;
    if (typeof body.content === "string") {
      content = body.content;
    } else {
      content = JSON.stringify(body.content ?? []);
    }

    const created = await prisma.landingPage.create({
      data: { title, campaign, content },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create landing page" },
      { status: 500 }
    );
  }
}
