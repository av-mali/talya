import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const { memberLimit } = await req.json();
  const limit = parseInt(memberLimit, 10);
  if (!limit || limit < 1) return NextResponse.json({ error: "Geçerli bir limit girin." }, { status: 400 });

  const workspace = await prisma.workspace.update({
    where: { id: params.id },
    data: { memberLimit: limit },
  });
  return NextResponse.json({ workspace });
}
