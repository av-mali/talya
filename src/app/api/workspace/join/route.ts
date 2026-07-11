import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;
  const userEmail = session.user.email as string;

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Davet kodu gerekli." }, { status: 400 });

  const invite = await prisma.workspaceInvite.findUnique({
    where: { token },
    include: { workspace: { include: { members: { select: { id: true } } } } },
  });
  if (!invite) return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Bu davet bağlantısı zaten kullanılmış." }, { status: 400 });

  if (invite.workspace.members.length >= invite.workspace.memberLimit) {
    return NextResponse.json({ error: "Bu büro üye limitine ulaşmış." }, { status: 400 });
  }

  // Kullanıcıyı yeni büroya taşı (kendi tek kişilik bürosundan ayrılır).
  await prisma.user.update({
    where: { id: userId },
    data: { workspaceId: invite.workspaceId, workspaceRole: "member" },
  });

  await prisma.workspaceInvite.update({
    where: { id: invite.id },
    data: { usedAt: new Date(), usedByEmail: userEmail },
  });

  return NextResponse.json({ ok: true, workspaceName: invite.workspace.name });
}
