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

  const found = await prisma.case.findFirst({ where: { id: params.id, client: { userId } } });
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  await prisma.invoice.delete({ where: { id: params.invoiceId } });
  return NextResponse.json({ ok: true });
}
