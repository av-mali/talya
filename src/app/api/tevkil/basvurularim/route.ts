import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının BAŞVURUCU olarak yer aldığı tüm başvurular — bekleyen,
// onaylanan (talep sahibinin iletişim bilgisi burada açılır) ya da
// reddedilen.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const basvurular = await prisma.tevkilBasvuru.findMany({
    where: { applicantId: userId, durum: { in: ["bekliyor", "onaylandi", "reddedildi"] } },
    include: {
      talep: {
        include: { requester: { select: { id: true, name: true, phone: true, email: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ basvurular });
}
