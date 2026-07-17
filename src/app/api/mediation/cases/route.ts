import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/workspace";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "arabuluculuk"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const cases = await prisma.mediationCase.findMany({
    where: { userId },
    include: { karsiTaraflar: { orderBy: { sira: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ cases });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "arabuluculuk"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const body = await req.json();
  const karsiTaraflar = Array.isArray(body.karsiTaraflar) ? body.karsiTaraflar : [];

  const mediationCase = await prisma.mediationCase.create({
    data: {
      userId,
      dosyaNo: body.dosyaNo || null,
      basvurucuAd: body.basvurucuAd || null,
      basvurucuAdres: body.basvurucuAdres || null,
      basvurucuVekilAd: body.basvurucuVekilAd || null,
      basvurucuBaroSicil: body.basvurucuBaroSicil || null,
      basvurucuTelefon: body.basvurucuTelefon || null,
      uyusmazlikKonusu: body.uyusmazlikKonusu || null,
      basvuruTarihi: body.basvuruTarihi || null,
      gorevlendirmeTarihi: body.gorevlendirmeTarihi || null,
      karsiTaraflar: {
        create: karsiTaraflar.map((p: any, i: number) => ({
          ad: p.ad || null,
          adres: p.adres || null,
          vergiMersis: p.vergiMersis || null,
          yetkiliAd: p.yetkiliAd || null,
          vekilAd: p.vekilAd || null,
          telefon: p.telefon || null,
          sira: i,
        })),
      },
    },
    include: { karsiTaraflar: { orderBy: { sira: "asc" } } },
  });
  return NextResponse.json({ case: mediationCase });
}
