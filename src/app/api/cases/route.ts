import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// ?assignedToId=X ile, o kişiye atanmış tüm dosyaları (büro içinde) listeler.
// Ekip Yönetimi'nde bir üyenin adına tıklayınca kullanılır.
export async function GET(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const assignedToId = searchParams.get("assignedToId");
  if (!assignedToId) return NextResponse.json({ error: "assignedToId gerekli." }, { status: 400 });

  const cases = await prisma.case.findMany({
    where: { assignedToId, client: { workspaceId: ws.workspaceId } },
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cases });
}
