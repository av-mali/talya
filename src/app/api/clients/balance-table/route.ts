import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace, shouldRestrictToOwnItems } from "@/lib/workspace";

// Her müvekkil için toplam anlaşılan ücret, toplam tahsil edilen ve
// kalan bakiyeyi tek satırda özetler (Attornaid'deki "Müvekkil Bakiye
// Tablosu" / "Müvekkil Borç Pivotu" karşılığı). Bekleyen Alacaklar'la
// AYNI çift-sayım engelini kullanır: bir dosya bir Ücret Sözleşmesi'ne
// bağlıysa, tutar dosyadan değil sözleşmeden gelir.
export async function GET() {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const restricted = await shouldRestrictToOwnItems(ws.userId);

  const clients = await prisma.client.findMany({
    where: { workspaceId: ws.workspaceId, archived: false, isAday: false },
    include: {
      cases: {
        where: restricted ? { assignedToId: ws.userId } : {},
        include: { invoices: true, feeAgreements: true },
      },
      feeAgreements: { where: { caseId: null }, include: { payments: true } }, // dosyaya bağlı olmayan sözleşmeler
    },
  });

  const rows = clients
    .map((c) => {
      let anlasilan = 0;
      let tahsil = 0;

      c.cases.forEach((cs) => {
        const linkedAgreement = cs.feeAgreements[0]; // bu dosya bir sözleşmeye bağlıysa
        if (linkedAgreement) {
          anlasilan += linkedAgreement.sabitUcret || 0;
        } else {
          anlasilan += cs.agreedFee || 0;
        }
        tahsil += cs.invoices.reduce((s, i) => s + i.amount, 0);
      });

      // Hiçbir dosyaya bağlı olmayan (genel) sözleşmeler
      c.feeAgreements.forEach((a) => {
        anlasilan += a.sabitUcret || 0;
        tahsil += a.payments.filter((p) => p.odendiMi).reduce((s, p) => s + p.tutar, 0);
      });

      return {
        clientId: c.id,
        clientName: c.name,
        anlasilan,
        tahsil,
        bakiye: anlasilan - tahsil,
      };
    })
    .filter((r) => r.anlasilan > 0) // hiç ücret girilmemiş müvekkili listede boş göstermeye gerek yok
    .sort((a, b) => b.bakiye - a.bakiye);

  return NextResponse.json({ rows });
}
