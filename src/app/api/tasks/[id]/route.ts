import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

async function requireOwnedTask(taskId: string) {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const task = await prisma.task.findFirst({ where: { id: taskId, workspaceId: ws.workspaceId } });
  return task ? ws : null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedTask(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya görev bulunamadı." }, { status: 401 });

  const { done } = await req.json();
  const task = await prisma.task.update({ where: { id: params.id }, data: { done: !!done } });
  return NextResponse.json({ task });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedTask(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya görev bulunamadı." }, { status: 401 });

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
