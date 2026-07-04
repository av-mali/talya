import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedTask(taskId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  return task ? userId : null;
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
