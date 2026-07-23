import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, phone: true, baro: true, sicilNo: true,
      arabuluculukBurosu: true, arabulucuSicilNo: true, arabulucuUets: true, arabulucuAdres: true,
      officeAddress: true, tevkilAlmaAcik: true,
      isAdmin: true, createdAt: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const body = await req.json();
  const { name, phone, baro, sicilNo, arabuluculukBurosu, arabulucuSicilNo, arabulucuUets, arabulucuAdres, officeAddress } = body;
  const data: any = { name, phone, baro, sicilNo, arabuluculukBurosu, arabulucuSicilNo, arabulucuUets, arabulucuAdres, officeAddress };
  if (body.tevkilAlmaAcik !== undefined) data.tevkilAlmaAcik = !!body.tevkilAlmaAcik;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true, email: true, name: true, phone: true, baro: true, sicilNo: true,
      arabuluculukBurosu: true, arabulucuSicilNo: true, arabulucuUets: true, arabulucuAdres: true,
      officeAddress: true, tevkilAlmaAcik: true,
    },
  });

  return NextResponse.json({ user });
}
