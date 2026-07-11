import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const note = await prisma.note.findFirst({ where: { id: params.id, workspaceId: ws.workspaceId } });
  if (!note) return NextResponse.json({ error: "Not bulunamadı." }, { status: 404 });

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
