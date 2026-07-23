import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep || talep.requesterId !== userId) {
    return NextResponse.json({ error: "Yetkisiz veya talep bulunamadı." }, { status: 401 });
  }

  await prisma.tevkilTalebi.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
