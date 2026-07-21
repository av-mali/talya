import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreement } from "@/lib/workspace";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  const body = await req.json();
  const data: any = {};
  if (body.konu !== undefined) data.konu = body.konu || null;
  if (body.sabitUcret !== undefined) data.sabitUcret = body.sabitUcret != null ? parseFloat(body.sabitUcret) : null;
  if (body.yuzdeVarMi !== undefined) data.yuzdeVarMi = !!body.yuzdeVarMi;
  if (body.yuzdeOrani !== undefined) data.yuzdeOrani = body.yuzdeOrani != null && body.yuzdeOrani !== "" ? parseFloat(body.yuzdeOrani) : null;
  if (body.odemeSekli !== undefined) data.odemeSekli = body.odemeSekli === "taksit" ? "taksit" : "pesin";
  if (body.pesinTarihi !== undefined) data.pesinTarihi = body.pesinTarihi ? new Date(body.pesinTarihi) : null;
  if (body.taksitler !== undefined) data.taksitler = body.taksitler;
  if (body.yetkiYeri !== undefined) data.yetkiYeri = body.yetkiYeri || null;
  if (body.sozlesmeTarihi !== undefined) data.sozlesmeTarihi = body.sozlesmeTarihi ? new Date(body.sozlesmeTarihi) : new Date();

  const agreement = await prisma.feeAgreement.update({ where: { id: params.id }, data });
  return NextResponse.json({ agreement });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  await prisma.feeAgreement.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
