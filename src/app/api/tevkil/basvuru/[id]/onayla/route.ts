import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Talep sahibi, başvuranlardan BİRİNİ onaylar. Onaylanan başvuru
// "onaylandi" olur, DİĞER tüm başvurular otomatik "reddedildi" olur,
// talep "onaylandi" durumuna geçer.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const basvuru = await prisma.tevkilBasvuru.findUnique({
    where: { id: params.id },
    include: { talep: true },
  });
  if (!basvuru) return NextResponse.json({ error: "Başvuru bulunamadı." }, { status: 404 });
  if (basvuru.talep.requesterId !== userId) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (basvuru.talep.durum !== "acik") {
    return NextResponse.json({ error: "Bu talep zaten onaylanmış." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.tevkilBasvuru.update({ where: { id: params.id }, data: { durum: "onaylandi" } }),
    prisma.tevkilBasvuru.updateMany({
      where: { talepId: basvuru.talepId, id: { not: params.id }, durum: "bekliyor" },
      data: { durum: "reddedildi" },
    }),
    prisma.tevkilTalebi.update({
      where: { id: basvuru.talepId },
      data: { durum: "onaylandi", acceptedById: basvuru.applicantId, acceptedAt: new Date() },
    }),
  ]);

  const updatedTalep = await prisma.tevkilTalebi.findUnique({
    where: { id: basvuru.talepId },
    include: { acceptedBy: { select: { id: true, name: true, phone: true, email: true } } },
  });

  return NextResponse.json({ talep: updatedTalep });
}
