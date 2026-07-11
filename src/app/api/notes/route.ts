import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { content } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Not boş olamaz." }, { status: 400 });
  }

  const note = await prisma.note.create({ data: { content: content.trim(), userId: ws.userId, workspaceId: ws.workspaceId } });
  return NextResponse.json({ note });
}
