import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TARIFF } from "@/lib/feeTariff";

// Arabuluculuk Ücret Hesaplama aracının kullandığı güncel tarife.
// Herhangi bir giriş yapmış kullanıcı okuyabilir (sadece admin değiştirebilir
// — bkz. /api/admin/tarife). Admin panelden bir güncelleme yapıldığı an bu
// uç nokta yeni değerleri döndürür, ekstra bir dağıtım/yayınlama adımı yok.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  let row = await prisma.mediationFeeTariff.findUnique({ where: { id: "singleton" } });
  if (!row) {
    row = await prisma.mediationFeeTariff.create({
      data: { id: "singleton", yil: DEFAULT_TARIFF.yil, data: DEFAULT_TARIFF as any },
    });
  }

  return NextResponse.json({ yil: row.yil, data: row.data });
}
