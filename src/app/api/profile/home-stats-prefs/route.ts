import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SELECTED = 2;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { homeStatsPrefs: true } });
  const prefs = (user?.homeStatsPrefs as string[] | null) || ["gelirgider", "muvekkil", "dosya"];
  return NextResponse.json({ selected: prefs });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { selected } = await req.json();
  if (!Array.isArray(selected) || selected.length > MAX_SELECTED) {
    return NextResponse.json({ error: `En fazla ${MAX_SELECTED} istatistik seçebilirsiniz.` }, { status: 400 });
  }

  await prisma.user.update({ where: { id: userId }, data: { homeStatsPrefs: selected } });
  return NextResponse.json({ ok: true });
}
