import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Ana sayfadaki "Hızlı Erişim" kutusunda hangi araçların (hangi modülden)
// gösterileceği — kullanıcı Üyelik & Hesap'tan istediği gibi değiştirebilir.
const DEFAULT_PREFS = {
  hizliErisimTools: [
    { mod: "buro", id: "muvekkilyonetimi" },
    { mod: "belge", id: "wizard" },
    { mod: "buro", id: "gorevler" },
  ],
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { homeWidgetPrefs: true } });
  const stored = (user?.homeWidgetPrefs as any) || {};
  const prefs = {
    hizliErisimTools: Array.isArray(stored.hizliErisimTools) ? stored.hizliErisimTools : DEFAULT_PREFS.hizliErisimTools,
  };
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
