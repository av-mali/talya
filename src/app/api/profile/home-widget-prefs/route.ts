import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 4 ek widget — hepsi varsayılan olarak AÇIK (kullanıcı isterse kapatır).
const DEFAULT_PREFS = {
  bekleyenAlacaklar: true,
  hizliErisim: true,
  bugun: true,
  sonMuvekkilAktivitesi: true,
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { homeWidgetPrefs: true } });
  const prefs = { ...DEFAULT_PREFS, ...((user?.homeWidgetPrefs as any) || {}) };
  return NextResponse.json({ prefs });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { prefs } = await req.json();
  if (!prefs || typeof prefs !== "object") {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { homeWidgetPrefs: prefs } });
  return NextResponse.json({ ok: true });
}
