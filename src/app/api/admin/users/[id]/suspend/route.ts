import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcıyı SİLMEDEN girişini geçici olarak durdurur/açar (ör. ödeme
// yapılmadığında erişimi kesmek, ödeme gelince tekrar açmak için).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }
  const adminId = (session.user as any).id as string;

  if (adminId === params.id) {
    return NextResponse.json({ error: "Kendi hesabınızı askıya alamazsınız." }, { status: 400 });
  }

  const { suspended } = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { suspended: !!suspended },
  });

  return NextResponse.json({ ok: true, suspended: user.suspended });
}
