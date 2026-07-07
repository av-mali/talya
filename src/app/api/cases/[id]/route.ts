import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedCase(caseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const found = await prisma.case.findFirst({
    where: { id: caseId, client: { userId } },
  });
  return found ? userId : null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const found = await prisma.case.findUnique({
    where: { id: params.id },
    include: {
      client: true,
      events: { orderBy: { dueDate: "asc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      timeEntries: { orderBy: { date: "desc" } },
    },
  });
  return NextResponse.json({ case: found });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const { title, status, agreedFee } = await req.json();
  const data: any = {};
  if (title !== undefined) data.title = title;
  if (status !== undefined) data.status = status;
  if (agreedFee !== undefined) {
    data.agreedFee = agreedFee === null || agreedFee === "" ? null : parseFloat(String(agreedFee).replace(/[^\d.]/g, ""));
  }

  const updated = await prisma.case.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ case: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  await prisma.case.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
