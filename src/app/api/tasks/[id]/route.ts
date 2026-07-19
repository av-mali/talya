import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

async function requireOwnedTask(taskId: string) {
  const ws = await requireWorkspace();
  if (!ws) return null;
  if (!(await hasToolAccess(ws.userId, "gorevler"))) return null;
  const task = await prisma.task.findFirst({ where: { id: taskId, workspaceId: ws.workspaceId } });
  return task ? ws : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedTask(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya görev bulunamadı." }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.title !== undefined) {
    data.title = body.title;
  }
  if (body.dueDate !== undefined) {
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  }
  if (body.status !== undefined) {
    data.status = body.status;
    data.done = body.status === "tamamlandi"; // geri uyum için done alanı da senkron tutulur
  } else if (body.done !== undefined) {
    data.done = !!body.done;
    data.status = body.done ? "tamamlandi" : "yapilacak";
  }
  if (body.assignedToId !== undefined) {
    data.assignedToId = body.assignedToId || null;
  }

  const task = await prisma.task.update({ where: { id: params.id }, data });
  return NextResponse.json({ task });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedTask(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya görev bulunamadı." }, { status: 401 });

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
