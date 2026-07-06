import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Eklentinin gönderdiği, henüz onaylanmamış (pending) içe aktarım
// kayıtlarını listeler — Büro Yönetimi'ndeki "Bekleyen Aktarımlar"
// ekranı bunu kullanır.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const batches = await prisma.importBatch.findMany({
    where: { userId, status: "pending" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ batches });
}
