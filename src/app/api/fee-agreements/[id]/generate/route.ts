import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireOwnedFeeAgreement } from "@/lib/workspace";
import { generateDocx } from "@/lib/docExport";
import { buildFeeSentence, buildFeeAgreementDocx } from "@/lib/feeAgreementTemplates";
import { stripMarkup } from "@/lib/richTextMarkup";

function safeFilePart(s: string): string {
  return (s || "Belge").replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 80);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const userId = (session.user as any).id as string;

  const ok = await requireOwnedFeeAgreement(params.id);
  if (!ok) return NextResponse.json({ error: "Yetkisiz veya sözleşme bulunamadı." }, { status: 401 });

  const agreement = await prisma.feeAgreement.findUnique({
    where: { id: params.id },
    include: { client: true },
  });
  if (!agreement) return NextResponse.json({ error: "Sözleşme bulunamadı." }, { status: 404 });

  const avukat = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, officeAddress: true, baro: true, sicilNo: true },
  });
  if (!avukat) return NextResponse.json({ error: "Profil bulunamadı." }, { status: 404 });

  const feeSentence = buildFeeSentence(
    agreement.sabitUcret,
    agreement.yuzdeVarMi,
    agreement.yuzdeOrani,
    agreement.odemeSekli === "taksit" ? "taksit" : "pesin",
    agreement.pesinTarihi ? new Date(agreement.pesinTarihi).toLocaleDateString("tr-TR") : null,
    (agreement.taksitler as any) || null
  );

  const finalText = buildFeeAgreementDocx(
    avukat,
    agreement.client,
    agreement.konu || "",
    feeSentence,
    new Date(agreement.sozlesmeTarihi).toLocaleDateString("tr-TR"),
    agreement.yetkiYeri || ""
  );

  const docxBuffer = await generateDocx(finalText);
  const fileName = `${safeFilePart(agreement.client.name)} - Avukatlık Ücret Sözleşmesi.docx`;

  return NextResponse.json({
    text: stripMarkup(finalText),
    docxBase64: docxBuffer.toString("base64"),
    fileName,
  });
}
