import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await prisma.contract.findFirst({ where: { id: params.id, userId } });
  if (!found) return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });

  await prisma.contract.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
