import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasToolAccess } from "@/lib/workspace";
import { DEFAULT_TARIFF, calculateMediationFee, type FeeCalcInput } from "@/lib/feeTariff";

// Arabuluculuk modülündeki BAĞIMSIZ "Ücret Hesaplama" aracı — herhangi bir
// dosyaya/tutanağa bağlı değildir, sadece tahmini arabuluculuk ücretini
// hesaplar. Her zaman admin panelinden en son kaydedilen tarifeyi kullanır.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;
  if (!(await hasToolAccess(userId, "ucrethesapla"))) {
    return NextResponse.json({ error: "Bu araca erişim yetkiniz yok." }, { status: 403 });
  }

  const input = (await req.json()) as FeeCalcInput;
  if (!input || (input.sonuc !== "anlasildi" && input.sonuc !== "anlasilamadi")) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  let row = await prisma.mediationFeeTariff.findUnique({ where: { id: "singleton" } });
  const tariffData = (row?.data as any) || DEFAULT_TARIFF;

  try {
    const result = calculateMediationFee(tariffData, input);
    return NextResponse.json({ result, tarifeYili: row?.yil || tariffData.yil || DEFAULT_TARIFF.yil });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Hesaplanamadı." }, { status: 500 });
  }
}
