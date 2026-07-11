import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const templates = await prisma.template.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { title, content } = await req.json();
  if (!title || !title.trim() || !content || !content.trim()) {
    return NextResponse.json({ error: "Başlık ve içerik gerekli." }, { status: 400 });
  }

  const template = await prisma.template.create({
    data: { title: title.trim(), content: content.trim(), userId: ws.userId, workspaceId: ws.workspaceId },
  });
  return NextResponse.json({ template });
}
