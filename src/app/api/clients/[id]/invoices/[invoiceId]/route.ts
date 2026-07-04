import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; invoiceId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const client = await prisma.client.findFirst({ where: { id: params.id, userId } });
  if (!client) return NextResponse.json({ error: "Müvekkil bulunamadı." }, { status: 404 });

  await prisma.invoice.delete({ where: { id: params.invoiceId } });
  return NextResponse.json({ ok: true });
}
