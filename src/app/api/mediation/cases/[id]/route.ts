import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripTcFromName } from "@/lib/mediationTemplates";

function cleanCase(c: any) {
  return {
    ...c,
    basvurucuAd: stripTcFromName(c.basvurucuAd) || c.basvurucuAd,
    karsiTaraflar: (c.karsiTaraflar || []).map((p: any) => ({
      ...p,
      ad: stripTcFromName(p.ad) || p.ad,
    })),
  };
}

async function requireOwnedMediationCase(id: string, userId: string) {
  return prisma.mediationCase.findFirst({ where: { id, userId } });
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await prisma.mediationCase.findFirst({
    where: { id: params.id, userId },
    include: { karsiTaraflar: { orderBy: { sira: "asc" } } },
  });
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });
  return NextResponse.json({ case: cleanCase(found) });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await requireOwnedMediationCase(params.id, userId);
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  const body = await req.json();
  const data: any = {};
  const fields = [
    "dosyaNo", "buroDosyaNo", "basvurucuTip", "basvurucuAd", "basvurucuTC", "basvurucuVergiMersis",
    "basvurucuYetkiliAd", "basvurucuAdres", "basvurucuVekilAd", "basvurucuBaroSicil",
    "basvurucuTelefon", "uyusmazlikKonusu", "uyusmazlikTuru", "basvuruTarihi", "gorevlendirmeTarihi",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f] || null;
  }
  if (data.basvurucuTip !== undefined) data.basvurucuTip = data.basvurucuTip === "tuzel" ? "tuzel" : "sahis";
  if (data.basvurucuAd) data.basvurucuAd = stripTcFromName(data.basvurucuAd);

  // İlk Oturum / Son Tutanak tarihleri — belge oluşturmadan BAĞIMSIZ
  // olarak, doğrudan buradan da girilip silinebilir.
  if (body.durum !== undefined) data.durum = body.durum === "kapali" ? "kapali" : "acik";
  if (body.ilkOturumTarihi !== undefined) {
    data.ilkOturumTarihi = body.ilkOturumTarihi ? new Date(body.ilkOturumTarihi) : null;
  }
  if (body.sonTutanakTarihi !== undefined) {
    data.sonTutanakTarihi = body.sonTutanakTarihi ? new Date(body.sonTutanakTarihi) : null;
  }
  if (body.sonTutanakSonucu !== undefined) {
    data.sonTutanakSonucu = body.sonTutanakSonucu || null;
  }

  // Karşı taraf listesi gönderildiyse, eskilerini silip yenilerini yaz
  // (basit ve güvenilir bir "tamamını değiştir" yaklaşımı).
  if (Array.isArray(body.karsiTaraflar)) {
    await prisma.mediationParty.deleteMany({ where: { caseId: params.id } });
    data.karsiTaraflar = {
      create: body.karsiTaraflar.map((p: any, i: number) => ({
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
    };
  }

  const updated = await prisma.mediationCase.update({
    where: { id: params.id },
    data,
    include: { karsiTaraflar: { orderBy: { sira: "asc" } } },
  });
  return NextResponse.json({ case: cleanCase(updated) });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const found = await requireOwnedMediationCase(params.id, userId);
  if (!found) return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 404 });

  await prisma.mediationCase.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
