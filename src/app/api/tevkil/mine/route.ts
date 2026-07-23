import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının KENDİ oluşturduğu talepler — kabul edilmişse, kabul eden
// kişinin iletişim bilgisi (telefon/e-posta) burada görünür.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const talepler = await prisma.tevkilTalebi.findMany({
    where: { requesterId: userId },
    include: { acceptedBy: { select: { id: true, name: true, phone: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ talepler });
}
