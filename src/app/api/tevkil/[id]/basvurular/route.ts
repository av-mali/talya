import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bir tevkil talebine yapılan TÜM başvuruları listeler — SADECE o
// talebin sahibi görebilir.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep || talep.requesterId !== userId) {
    return NextResponse.json({ error: "Yetkisiz veya talep bulunamadı." }, { status: 401 });
  }

  const basvurular = await prisma.tevkilBasvuru.findMany({
    where: { talepId: params.id, durum: { not: "iptal_edildi" } },
    include: { applicant: { select: { id: true, name: true, phone: true, email: true, baro: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ basvurular });
}
