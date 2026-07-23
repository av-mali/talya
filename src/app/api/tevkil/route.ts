import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tevkil Menüsü — BÜRO SINIRI YOK, sistemdeki tüm açık talepler herkese
// görünür (kendi taleplerin hariç, onlar "Taleplerim" sekmesinde).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talepler = await prisma.tevkilTalebi.findMany({
    where: { durum: "acik", requesterId: { not: userId } },
    include: {
      requester: { select: { id: true, name: true } },
      basvurular: { where: { applicantId: userId, durum: { in: ["bekliyor", "onaylandi"] } }, select: { id: true, durum: true } },
    },
    orderBy: [{ tarih: "asc" }, { createdAt: "desc" }],
  });

  // Kullanıcının bu talebe zaten başvurup başvurmadığını (frontend'de
  // "Başvur" yerine "Başvuruldu" göstermek için) ekliyoruz.
  const withFlag = talepler.map((t) => ({
    ...t,
    benimBasvurum: t.basvurular[0] || null,
    basvurular: undefined,
  }));

  return NextResponse.json({ talepler: withFlag });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  if (!body.sehir && !body.mahkeme) {
    return NextResponse.json({ error: "Şehir/Mahkeme bilgisi gerekli." }, { status: 400 });
  }

  const talep = await prisma.tevkilTalebi.create({
    data: {
      requesterId: userId,
      sehir: body.sehir || null,
      mahkeme: body.mahkeme || null,
      tarih: body.tarih ? new Date(body.tarih) : null,
      durusmaTuru: body.durusmaTuru || null,
      ucretTeklifi: body.ucretTeklifi || null,
      aciklama: body.aciklama || null,
      telefon: body.telefon || null,
    },
  });
  return NextResponse.json({ talep });
}
