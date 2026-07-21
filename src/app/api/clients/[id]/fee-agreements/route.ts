import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedClient } from "@/lib/workspace";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const agreements = await prisma.feeAgreement.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ agreements });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedClient(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya müvekkil bulunamadı." }, { status: 401 });

  const body = await req.json();
  const agreement = await prisma.feeAgreement.create({
    data: {
      clientId: params.id,
      konu: body.konu || null,
      sabitUcret: body.sabitUcret != null ? parseFloat(body.sabitUcret) : null,
      yuzdeVarMi: !!body.yuzdeVarMi,
      yuzdeOrani: body.yuzdeOrani != null && body.yuzdeOrani !== "" ? parseFloat(body.yuzdeOrani) : null,
      odemeSekli: body.odemeSekli === "taksit" ? "taksit" : "pesin",
      pesinTarihi: body.pesinTarihi ? new Date(body.pesinTarihi) : null,
      taksitler: Array.isArray(body.taksitler) ? body.taksitler : undefined,
      harcMasrafDahil: body.harcMasrafDahil !== undefined ? !!body.harcMasrafDahil : true,
      yetkiYeri: body.yetkiYeri || null,
      sozlesmeTarihi: body.sozlesmeTarihi ? new Date(body.sozlesmeTarihi) : new Date(),
    },
  });
  return NextResponse.json({ agreement });
}
