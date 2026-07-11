import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, hasToolAccess } from "@/lib/workspace";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  if (!(await hasToolAccess(ws.userId, "gelirgider"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const tx = await prisma.transaction.findFirst({ where: { id: params.id, workspaceId: ws.workspaceId } });
  if (!tx) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  await prisma.transaction.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
