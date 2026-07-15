import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const actingUserId = (session.user as any).id as string;

  const actingUser = await prisma.user.findUnique({ where: { id: actingUserId }, select: { workspaceId: true, workspaceRole: true } });
  if (!actingUser?.workspaceId) return NextResponse.json({ error: "Bir büroya bağlı değilsiniz." }, { status: 404 });
  if (actingUser.workspaceRole !== "admin") return NextResponse.json({ error: "Sadece büro yöneticisi yetki ayarlayabilir." }, { status: 403 });

  const target = await prisma.user.findUnique({ where: { id: params.userId }, select: { workspaceId: true } });
  if (!target || target.workspaceId !== actingUser.workspaceId) {
    return NextResponse.json({ error: "Bu kişi büronuzda değil." }, { status: 404 });
  }

  const { blockedTools, aiEnabled, restrictToOwnItems } = await req.json();

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      blockedTools: Array.isArray(blockedTools) ? blockedTools : [],
      aiEnabled: aiEnabled !== false,
      restrictToOwnItems: !!restrictToOwnItems,
    },
  });

  return NextResponse.json({ ok: true, blockedTools: updated.blockedTools, aiEnabled: updated.aiEnabled, restrictToOwnItems: updated.restrictToOwnItems });
}
