import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Davet linkine tıklayan kişi giriş yapmamış bile olabilir — bu yüzden
// bu uç nokta oturum gerektirmez, sadece "hangi büroya davet edildin"
// bilgisini gösterir.
export async function GET(req: Request, { params }: { params: { token: string } }) {
  const invite = await prisma.workspaceInvite.findUnique({
    where: { token: params.token },
    include: { workspace: { select: { name: true } } },
  });

  if (!invite) return NextResponse.json({ error: "Davet bulunamadı." }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Bu davet bağlantısı zaten kullanılmış." }, { status: 400 });

  return NextResponse.json({ workspaceName: invite.workspace.name });
}
