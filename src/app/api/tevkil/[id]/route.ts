import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talep = await prisma.tevkilTalebi.findUnique({ where: { id: params.id } });
  if (!talep || talep.requesterId !== userId) {
    return NextResponse.json({ error: "Yetkisiz veya talep bulunamadı." }, { status: 401 });
  }

  // Talep zaten bir meslektaş tarafından ONAYLANMIŞSA silmeye izin verme —
  // aksi halde onaylayan kişi tarafında hâlâ görünen (acceptedById dolu)
  // bir kabul kaydı, karşılığındaki talep kaydı silinince "yetim" kalır ve
  // onaylayan taraf için tutarsız/karışık bir görünüme yol açar. Önce
  // onayın geri alınması (durum tekrar "acik" olması) gerekiyor.
  if (talep.durum === "onaylandi") {
    return NextResponse.json(
      { error: "Bu talep bir meslektaş tarafından onaylanmış — silmeden önce onayın geri alınması gerekiyor." },
      { status: 409 }
    );
  }

  await prisma.tevkilTalebi.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
