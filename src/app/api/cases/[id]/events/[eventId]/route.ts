import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; eventId: string } }
) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const found = await prisma.case.findFirst({ where: { id: params.id, client: { workspaceId: ws.workspaceId } } });
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const result = await prisma.clientEvent.deleteMany({ where: { id: params.eventId, caseId: params.id } });
  if (result.count === 0) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
