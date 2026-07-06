import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Mevcut anahtarı (varsa) döndürür. Eklentiye yapıştırılacak anahtar budur.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { syncToken: true } });
  return NextResponse.json({ syncToken: user?.syncToken || null });
}

// Yeni bir anahtar üretir (varsa eskisini geçersiz kılar — eski anahtarla
// eklenti artık senkronize olamaz, güvenlik için "yenile" özelliği budur).
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const token = "tly_" + crypto.randomBytes(24).toString("hex");
  await prisma.user.update({ where: { id: userId }, data: { syncToken: token } });

  return NextResponse.json({ syncToken: token });
}
