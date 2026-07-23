import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const [talepSayisi, kabulSayisi] = await Promise.all([
    prisma.tevkilTalebi.count({ where: { requesterId: userId } }),
    prisma.tevkilBasvuru.count({ where: { applicantId: userId, durum: "onaylandi" } }),
  ]);

  return NextResponse.json({ talepSayisi, kabulSayisi });
}
