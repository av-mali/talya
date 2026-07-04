import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bu istatistikler sadece Talya'nın kendi ticari verisidir (kaç müşteri
// kayıtlı, ne kadar aktif kullanım var). Müvekkil sayısı, fatura tutarı
// gibi avukatlara özel/mahrem veriler burada YER ALMAZ.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const [userCount, messageCount] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
  ]);

  return NextResponse.json({ userCount, messageCount });
}
