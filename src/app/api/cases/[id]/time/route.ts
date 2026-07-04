import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireOwnedCase(caseId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;
  const found = await prisma.case.findFirst({ where: { id: caseId, client: { userId } } });
  return found ? userId : null;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedCase(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya dosya bulunamadı." }, { status: 401 });

  const { hours, hourlyRate, description, date } = await req.json();
  const hoursNum = parseFloat(String(hours).replace(",", "."));
  if (!hoursNum || hoursNum <= 0) {
    return NextResponse.json({ error: "Geçerli bir süre girin." }, { status: 400 });
  }

  const entry = await prisma.timeEntry.create({
    data: {
      hours: hoursNum,
      hourlyRate: hourlyRate ? parseFloat(String(hourlyRate).replace(/[^\d.]/g, "")) : null,
      description,
      date: date ? new Date(date) : new Date(),
      caseId: params.id,
    },
  });
  return NextResponse.json({ entry });
}
