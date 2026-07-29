import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TARIFF, type MediationFeeTariffData } from "@/lib/feeTariff";

// Admin panelindeki "Arabuluculuk Ücret Tarifesi" kartının okuma/yazma
// uç noktası. GET tam veriyi (birinci+ikinci kısım, tüm taban ücretler)
// döndürür — /api/tarife (herkese açık, sadece okuma) ile aynı veriyi
// okur ama bu uç nokta admin-only, çünkü admin sayfası ham veriyi
// düzenlenebilir tablo olarak gösterir.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  let row = await prisma.mediationFeeTariff.findUnique({ where: { id: "singleton" } });
  if (!row) {
    row = await prisma.mediationFeeTariff.create({
      data: { id: "singleton", yil: DEFAULT_TARIFF.yil, data: DEFAULT_TARIFF as any },
    });
  }

  return NextResponse.json({ yil: row.yil, data: row.data, updatedAt: row.updatedAt });
}

// PUT: admin, tarifeyi kaydeder. Kaydedilen an itibarıyla /api/tarife'yi
// okuyan HER YER (Ücret Hesaplama aracı dahil) yeni değerleri kullanır —
// ekstra bir "yayınla" adımı ya da kod değişikliği gerekmez.
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const body = await req.json();
  const data: MediationFeeTariffData = body?.data;
  if (!data || !Array.isArray(data.birinciKisim) || !Array.isArray(data.ikinciKisim)) {
    return NextResponse.json({ error: "Geçersiz tarife verisi." }, { status: 400 });
  }

  const yil = parseInt(String(data.yil || body.yil || new Date().getFullYear()), 10);

  const row = await prisma.mediationFeeTariff.upsert({
    where: { id: "singleton" },
    update: { yil, data: data as any },
    create: { id: "singleton", yil, data: data as any },
  });

  return NextResponse.json({ yil: row.yil, data: row.data, updatedAt: row.updatedAt });
}
