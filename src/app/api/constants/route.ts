import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Hesaplama araçlarının kullandığı güncel sabitler. Herhangi bir giriş
// yapmış kullanıcı okuyabilir (sadece admin değiştirebilir).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  let constants = await prisma.legalConstants.findUnique({ where: { id: "singleton" } });
  if (!constants) {
    constants = await prisma.legalConstants.create({ data: { id: "singleton" } });
  }

  return NextResponse.json({ constants });
}
