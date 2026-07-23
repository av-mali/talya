import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının KENDİ oluşturduğu talepler — açıksa kaç kişi başvurdu,
// onaylandıysa onaylanan kişinin iletişim bilgisi burada görünür.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talepler = await prisma.tevkilTalebi.findMany({
    where: { requesterId: userId },
    include: {
      acceptedBy: { select: { id: true, name: true, phone: true, email: true } },
      basvurular: { where: { durum: "bekliyor" }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withCount = talepler.map((t) => ({ ...t, bekleyenBasvuruSayisi: t.basvurular.length, basvurular: undefined }));
  return NextResponse.json({ talepler: withCount });
}
