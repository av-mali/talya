import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Talep sahibi, onaylanan tevkil FİİLEN yerine getirildikten sonra
// talebi "tamamlandı" olarak kapatır — bir daha işlem görmez, geçmişte
// kalır.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep || talep.requesterId !== userId) {
    return NextResponse.json({ error: "Yetkisiz veya talep bulunamadı." }, { status: 401 });
  }
  if (talep.durum !== "onaylandi") {
    return NextResponse.json({ error: "Sadece onaylanmış bir talep tamamlandı olarak kapatılabilir." }, { status: 400 });
  }

  await prisma.tevkilTalebi.update({ where: { id: params.id }, data: { durum: "tamamlandi" } });
  return NextResponse.json({ ok: true });
}
