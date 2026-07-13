import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const item = await prisma.savedItem.findFirst({ where: { id: params.id, userId } });
  if (!item) return NextResponse.json({ error: "Kayıt bulunamadı." }, { status: 404 });

  await prisma.savedItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
