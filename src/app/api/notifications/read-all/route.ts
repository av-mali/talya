import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const { ids } = await req.json();
  if (!Array.isArray(ids) || !ids.length) return NextResponse.json({ ok: true });

  await Promise.all(
    ids.map((id: string) =>
      prisma.notificationRead.upsert({
        where: { userId_notifId: { userId, notifId: id } },
        update: {},
        create: { userId, notifId: id },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
