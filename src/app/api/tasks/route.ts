import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess, shouldRestrictToOwnItems } from "@/lib/workspace";

export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gorevler"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const tasks = await prisma.task.findMany({
    where: {
      workspaceId: ws.workspaceId,
      ...(restricted ? { assignedToId: ws.userId } : {}),
    },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gorevler"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const { title, dueDate, assignedToId } = await req.json();
  if (!title || !title.trim()) {
    return NextResponse.json({ error: "Görev başlığı gerekli." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: ws.userId,
      workspaceId: ws.workspaceId,
      assignedToId: assignedToId || null,
    },
  });
  return NextResponse.json({ task });
}
