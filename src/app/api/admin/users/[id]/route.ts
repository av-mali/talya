import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

  try {
    await prisma.user.delete({ where: { id: params.id } });
  } catch (err) {
    // P2003: yabancı anahtar kısıtlaması — bu kullanıcı tevkil talebi/başvurusu
    // gibi başka kayıtlarda (Restrict ilişkili) referans alınıyorsa silme
    // ham bir 500 yerine anlaşılır bir hata mesajıyla reddedilir.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: "Bu kullanıcı başka kayıtlarda (ör. tevkil geçmişi) referans alındığı için silinemiyor." },
        { status: 409 }
      );
    }
    throw err;
  }

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
