import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/workspace";
import { stripTcFromName } from "@/lib/mediationTemplates";

// Eski kayıtlarda ismin başına karışmış TC no varsa, gösterirken temizler
// (veritabanını değiştirmeden) — yeni kayıtlarda zaten kaydederken temizleniyor.
function cleanCase(c: any) {
  return {
    ...c,
    basvurucuAd: stripTcFromName(c.basvurucuAd) || c.basvurucuAd,
    karsiTaraflar: (c.karsiTaraflar || []).map((p: any) => ({
      ...p,
      ad: stripTcFromName(p.ad) || p.ad,
    })),
    ekBasvurucular: (c.ekBasvurucular || []).map((p: any) => ({
      ...p,
      ad: stripTcFromName(p.ad) || p.ad,
    })),
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "arabuluculuk"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const cases = await prisma.mediationCase.findMany({
    where: { userId },
    include: {
      karsiTaraflar: { orderBy: { sira: "asc" } },
      ekBasvurucular: { orderBy: { sira: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ cases: cases.map(cleanCase) });
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
  // "Başvurucu 1" HER ZAMAN düz basvurucu* alanlarında kalır — bu dizi
  // SADECE "Başvurucu 2, 3, ..." için (bkz. mediationTemplates.ts'teki
  // basvurucularList() ve şemadaki MediationApplicant açıklaması).
  const ekBasvurucular = Array.isArray(body.ekBasvurucular) ? body.ekBasvurucular : [];

  const mediationCase = await prisma.mediationCase.create({
    data: {
      userId,
      dosyaNo: body.dosyaNo || null,
      buroDosyaNo: body.buroDosyaNo || null,
      basvurucuTip: body.basvurucuTip === "tuzel" ? "tuzel" : "sahis",
      basvurucuAd: stripTcFromName(body.basvurucuAd) || null,
      basvurucuTC: body.basvurucuTC || null,
      basvurucuVergiMersis: body.basvurucuVergiMersis || null,
      basvurucuYetkiliAd: body.basvurucuYetkiliAd || null,
      basvurucuAdres: body.basvurucuAdres || null,
      basvurucuVekilAd: body.basvurucuVekilAd || null,
      basvurucuBaroSicil: body.basvurucuBaroSicil || null,
      basvurucuTelefon: body.basvurucuTelefon || null,
      uyusmazlikKonusu: body.uyusmazlikKonusu || null,
      uyusmazlikTuru: body.uyusmazlikTuru || null,
      basvuruTarihi: body.basvuruTarihi || null,
      gorevlendirmeTarihi: body.gorevlendirmeTarihi || null,
      karsiTaraflar: {
        create: karsiTaraflar.map((p: any, i: number) => ({
          tip: p.tip === "tuzel" ? "tuzel" : "sahis",
          ad: stripTcFromName(p.ad) || null,
          tcKimlik: p.tcKimlik || null,
          adres: p.adres || null,
          vergiMersis: p.vergiMersis || null,
          yetkiliAd: p.yetkiliAd || null,
          vekilAd: p.vekilAd || null,
          vekilBaroSicil: p.vekilBaroSicil || null,
          telefon: p.telefon || null,
          sira: i,
        })),
      },
      ekBasvurucular: {
        create: ekBasvurucular.map((p: any, i: number) => ({
          tip: p.tip === "tuzel" ? "tuzel" : "sahis",
          ad: stripTcFromName(p.ad) || null,
          tcKimlik: p.tcKimlik || null,
          adres: p.adres || null,
          vergiMersis: p.vergiMersis || null,
          yetkiliAd: p.yetkiliAd || null,
          vekilAd: p.vekilAd || null,
          vekilBaroSicil: p.vekilBaroSicil || null,
          telefon: p.telefon || null,
          sira: i,
        })),
      },
    },
    include: { karsiTaraflar: { orderBy: { sira: "asc" } }, ekBasvurucular: { orderBy: { sira: "asc" } } },
  });
  return NextResponse.json({ case: mediationCase });
}
