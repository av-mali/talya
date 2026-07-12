import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  if (!(session.user as any).isAdmin) return null;
  return (session.user as any).id as string;
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });

  if (adminId === params.id) {
    return NextResponse.json({ error: "Kendi hesabınızı buradan silemezsiniz." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id }, select: { workspaceId: true } });

  await prisma.user.delete({ where: { id: params.id } });

  // Silinen kullanıcı bir büronun SON üyesiyse, artık kimsesiz kalan o
  // büro da otomatik silinir — Admin panelinde "hayalet büro" birikmesin.
  if (target?.workspaceId) {
    const remaining = await prisma.user.count({ where: { workspaceId: target.workspaceId } });
    if (remaining === 0) {
      await prisma.workspace.delete({ where: { id: target.workspaceId } });
    }
  }

  return NextResponse.json({ ok: true });
}
