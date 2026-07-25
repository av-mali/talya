import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Ana sayfadaki "Günlük Özet" kutusu — sadece elimizde zaten olan veriyi
// toplayıp özetler (yeni bir altyapı gerektirmez).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);
  const sevenDaysLater = new Date(todayStart.getTime() + 7 * 86400000);

  const [bugunDurusma, yaklasanOdeme, uyapHareket, gecikenGorev] = await Promise.all([
    prisma.clientEvent.count({
      where: {
        dueDate: { gte: todayStart, lt: todayEnd },
        case: { client: { workspaceId: ws.workspaceId }, ...(restricted ? { assignedToId: ws.userId } : {}) },
      },
    }),
    prisma.feeAgreementPayment.count({
      where: {
        odendiMi: false,
        vadeTarihi: { gte: todayStart, lte: sevenDaysLater },
        agreement: { client: { workspaceId: ws.workspaceId } },
      },
    }),
    prisma.importBatch.count({ where: { userId, status: "pending" } }),
    prisma.task.count({
      where: {
        workspaceId: ws.workspaceId,
        done: false,
        dueDate: { lt: now },
        ...(restricted ? { assignedToId: ws.userId } : {}),
      },
    }),
  ]);

  return NextResponse.json({ bugunDurusma, yaklasanOdeme, uyapHareket, gecikenGorev });
}
