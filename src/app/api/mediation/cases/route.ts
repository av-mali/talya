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
  const mediationCase = await prisma.mediationCase.create({
    data: {
      userId,
      dosyaNo: body.dosyaNo || null,
      basvurucuAd: body.basvurucuAd || null,
      basvurucuAdres: body.basvurucuAdres || null,
      basvurucuVekilAd: body.basvurucuVekilAd || null,
      basvurucuBaroSicil: body.basvurucuBaroSicil || null,
      basvurucuTelefon: body.basvurucuTelefon || null,
      karsiTarafAd: body.karsiTarafAd || null,
      karsiTarafAdres: body.karsiTarafAdres || null,
      karsiTarafVergiMersis: body.karsiTarafVergiMersis || null,
      karsiTarafYetkiliAd: body.karsiTarafYetkiliAd || null,
      karsiTarafVekilAd: body.karsiTarafVekilAd || null,
      karsiTarafTelefon: body.karsiTarafTelefon || null,
      uyusmazlikKonusu: body.uyusmazlikKonusu || null,
      basvuruTarihi: body.basvuruTarihi || null,
      gorevlendirmeTarihi: body.gorevlendirmeTarihi || null,
    },
  });
  return NextResponse.json({ case: mediationCase });
}
