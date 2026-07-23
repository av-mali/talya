import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bir tevkil talebine BAŞVURUR (kabul etmez — talep sahibi daha sonra
// başvuranlardan birini onaylayacak). Aynı kişi aynı talebe iki kez
// başvuramaz.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep) return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  if (talep.requesterId === userId) {
    return NextResponse.json({ error: "Kendi talebinize başvuramazsınız." }, { status: 400 });
  }
  if (talep.durum !== "acik") {
    return NextResponse.json({ error: "Bu talep artık açık değil." }, { status: 400 });
  }

  const existing = await prisma.tevkilBasvuru.findFirst({
    where: { talepId: params.id, applicantId: userId, durum: { in: ["bekliyor", "onaylandi"] } },
  });
  if (existing) {
    return NextResponse.json({ error: "Bu talebe zaten başvurdunuz." }, { status: 400 });
  }

  const basvuru = await prisma.tevkilBasvuru.create({
    data: { talepId: params.id, applicantId: userId },
  });
  return NextResponse.json({ basvuru });
}
