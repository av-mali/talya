import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının (ister talep sahibi, ister vazgeçen taraf olarak)
// karıştığı, İPTAL EDİLMİŞ başvurular — geçmiş kaydı olarak.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const basvurular = await prisma.tevkilBasvuru.findMany({
    where: {
      durum: "iptal_edildi",
      OR: [{ applicantId: userId }, { talep: { requesterId: userId } }],
    },
    include: {
      applicant: { select: { id: true, name: true } },
      talep: { include: { requester: { select: { id: true, name: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ basvurular });
}
