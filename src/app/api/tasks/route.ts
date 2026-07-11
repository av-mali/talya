import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { workspaceId: ws.workspaceId },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { title, dueDate } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Görev başlığı gerekli." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { title: title.trim(), dueDate: dueDate ? new Date(dueDate) : null, userId: ws.userId, workspaceId: ws.workspaceId },
  });
  return NextResponse.json({ task });
}
