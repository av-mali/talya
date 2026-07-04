import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  }

  const { kidemTavani, faizOrani, kiraTufeOrani } = await req.json();

  const constants = await prisma.legalConstants.upsert({
    where: { id: "singleton" },
    update: {
      kidemTavani: parseFloat(kidemTavani),
      faizOrani: parseFloat(faizOrani),
      kiraTufeOrani: parseFloat(kiraTufeOrani),
    },
    create: {
      id: "singleton",
      kidemTavani: parseFloat(kidemTavani),
      faizOrani: parseFloat(faizOrani),
      kiraTufeOrani: parseFloat(kiraTufeOrani),
    },
  });

  return NextResponse.json({ constants });
}
