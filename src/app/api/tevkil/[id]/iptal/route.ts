import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ONAYLANAN kişi vazgeçerse: kendi başvurusu "iptal_edildi" olur, talep
// tekrar "acik" durumuna döner (yeniden başvuru alabilir hale gelir),
// talep sahibine bildirim gider.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  if (talep.durum !== "onaylandi" || talep.acceptedById !== userId) {
    return NextResponse.json({ error: "Bu talebi iptal etme yetkiniz yok." }, { status: 401 });
  }

  const basvuru = await prisma.tevkilBasvuru.findFirst({
    where: { talepId: params.id, applicantId: userId, durum: "onaylandi" },
  });

  await prisma.$transaction([
    ...(basvuru ? [prisma.tevkilBasvuru.update({ where: { id: basvuru.id }, data: { durum: "iptal_edildi" } })] : []),
    prisma.tevkilTalebi.update({
      where: { id: params.id },
      data: { durum: "acik", acceptedById: null, acceptedAt: null },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
