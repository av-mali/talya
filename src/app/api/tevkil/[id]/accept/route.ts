import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bir tevkil talebini kabul eder. Birden fazla kişi aynı anda kabul
// etmeye çalışırsa, sadece İLK isteği başarılı olur (durum="acik"
// koşuluyla güncelleme yapılır — updateMany'nin etkilenen satır sayısı
// 0 ise, talep zaten başkası tarafından kapatılmış demektir).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  if (talep.requesterId === userId) {
    return NextResponse.json({ error: "Kendi talebinizi kabul edemezsiniz." }, { status: 400 });
  }

  const result = await prisma.tevkilTalebi.updateMany({
    where: { id: params.id, durum: "acik" },
    data: { durum: "kapali", acceptedById: userId, acceptedAt: new Date() },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Bu talep az önce başka bir avukat tarafından kabul edildi." }, { status: 409 });
  }

  const updated = await prisma.tevkilTalebi.findUnique({
    where: { id: params.id },
    include: { requester: { select: { id: true, name: true, phone: true, email: true } } },
  });

  return NextResponse.json({ talep: updated });
}
