// prisma/seed-demo.js
//
// Bu script, "Kayıt Olmadan Demo'yu Gör" butonunun bağlandığı sabit demo
// hesabını ve zengin örnek verisini oluşturur. TEK SEFERLİK çalıştırılır:
//
//   DATABASE_URL="..." node prisma/seed-demo.js
//
// Script "idempotent"tir — yani birden fazla kez çalıştırılırsa hata
// vermez, var olan demo hesabını bulup verisini SIFIRLAYIP yeniden
// oluşturur (demo verisi kirlenirse tekrar çalıştırıp temizleyebilirsin).

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@talyahukuk.com";
const DEMO_PASSWORD = "talya-demo-2026";

function gunSonra(n) {
  return new Date(Date.now() + n * 86400000);
}
function gunOnce(n) {
  return new Date(Date.now() - n * 86400000);
}

async function main() {
  console.log("Demo verisi oluşturuluyor…");

  // ── 1) Var olan demo hesabını temizle (varsa) ──
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing?.workspaceId) {
    await prisma.workspace.delete({ where: { id: existing.workspaceId } }).catch(() => {});
  }
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } }).catch(() => {});
  }

  // ── 2) Workspace + demo kullanıcı ──
  const workspace = await prisma.workspace.create({
    data: { name: "Demo Hukuk Bürosu" },
  });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      passwordHash,
      name: "Demo Avukat",
      phone: "0555 000 00 00",
      baro: "Antalya",
      sicilNo: "12345",
      approved: true,
      isDemo: true,
      workspaceId: workspace.id,
    },
  });

  // ── 3) Müvekkiller (aktif, aday, arşiv karışık) ──
  const muvekkilVerisi = [
    { name: "Ahmet Yılmaz", phone: "0532 111 22 33", email: "ahmet@example.com", tcMersis: "12345678901" },
    { name: "Zeynep Kaya", phone: "0533 222 33 44", email: "zeynep@example.com", tcMersis: "23456789012" },
    { name: "Mediaworks Reklam A.Ş.", phone: "0212 333 44 55", email: "info@mediaworks.com", tcMersis: "3456789012" },
    { name: "Can Demir", phone: "0534 444 55 66", email: "can@example.com", tcMersis: "45678901234" },
    { name: "Ege Lojistik Ltd. Şti.", phone: "0242 555 66 77", email: "info@egelojistik.com", tcMersis: "5678901234" },
    { name: "Elif Şahin", phone: "0535 666 77 88", email: "elif@example.com", tcMersis: "67890123456" },
    { name: "Murat Öztürk", phone: "0536 777 88 99", email: "murat@example.com", tcMersis: "78901234567" },
    { name: "Antalya İnşaat A.Ş.", phone: "0242 888 99 00", email: "info@antalyainsaat.com", tcMersis: "8901234567" },
  ];
  const muvekkiller = [];
  for (let i = 0; i < muvekkilVerisi.length; i++) {
    const archived = i === 7; // son biri arşivde
    const isAday = i === 5 || i === 6; // son 2'den önceki 2'si aday
    const c = await prisma.client.create({
      data: { ...muvekkilVerisi[i], workspaceId: workspace.id, archived, isAday },
    });
    muvekkiller.push(c);
  }

  // ── 4) Dosyalar + Yaklaşan Süreler + Ücret Sözleşmesi + Fatura ──
  const davaBasliklari = [
    { title: "Kıdem ve İhbar Tazminatı Davası", tur: "durusma", fee: 25000 },
    { title: "Boşanma Davası", tur: "durusma", fee: 18000 },
    { title: "Ticari Alacak Davası", tur: "durusma", fee: 40000 },
    { title: "Kira Tespit ve Tahliye Davası", tur: "durusma", fee: 15000 },
    { title: "İş Kazası Tazminat Davası", tur: "durusma", fee: 32000 },
    { title: "Miras Paylaşımı Davası", tur: "gorusme", fee: 22000 },
  ];

  for (let i = 0; i < davaBasliklari.length; i++) {
    const d = davaBasliklari[i];
    const client = muvekkiller[i % 6]; // ilk 6 aktif müvekkile dağıt
    const status = i === 5 ? "kapali" : "acik";

    const kase = await prisma.case.create({
      data: {
        title: d.title,
        caseNumber: `2026/${1000 + i}`,
        status,
        agreedFee: d.fee,
        clientId: client.id,
        assignedToId: user.id,
      },
    });

    // Yaklaşan süre (açık dosyalarda)
    if (status === "acik") {
      await prisma.clientEvent.create({
        data: {
          type: d.tur,
          title: d.title.includes("Boşanma") ? "Ön İnceleme Duruşması" : "Duruşma",
          dueDate: gunSonra(3 + i * 7),
          caseId: kase.id,
        },
      });
    }

    // Ücret sözleşmesi + kısmen ödenmiş taksitler (Fatura & Tahsilat + Gelir-Gider'de görünsün)
    const agreement = await prisma.feeAgreement.create({
      data: {
        konu: d.title,
        sabitUcret: d.fee,
        odemeSekli: "taksit",
        yetkiYeri: "Antalya",
        clientId: client.id,
        caseId: kase.id,
      },
    });

    const taksitSayisi = 2;
    for (let t = 0; t < taksitSayisi; t++) {
      const odendiMi = t === 0; // ilk taksit ödenmiş, ikincisi bekliyor
      const payment = await prisma.feeAgreementPayment.create({
        data: {
          tutar: d.fee / taksitSayisi,
          vadeTarihi: t === 0 ? gunOnce(15) : gunSonra(10 + i * 3),
          odendiMi,
          odemeTarihi: odendiMi ? gunOnce(15) : null,
          agreementId: agreement.id,
        },
      });

      if (odendiMi) {
        const invoice = await prisma.invoice.create({
          data: { amount: payment.tutar, note: `${d.title} — 1. Taksit`, caseId: kase.id, feeAgreementPaymentId: payment.id },
        });
        await prisma.transaction.create({
          data: {
            type: "gelir",
            amount: payment.tutar,
            description: `${client.name} — ${d.title} (1. Taksit)`,
            date: gunOnce(15),
            userId: user.id,
            workspaceId: workspace.id,
            sourceInvoiceId: invoice.id,
          },
        });
      }
    }
  }

  // ── 5) Genel gelir-gider hareketleri (büro masrafları vb.) ──
  const gelirGiderVerisi = [
    { type: "gider", amount: 8500, description: "Ofis Kirası", gun: 20 },
    { type: "gider", amount: 3200, description: "Sekreterlik Maaşı", gun: 18 },
    { type: "gider", amount: 950, description: "Kırtasiye ve Büro Malzemesi", gun: 10 },
    { type: "gelir", amount: 12000, description: "Sözleşme Danışmanlığı — Ege Lojistik", gun: 8 },
    { type: "gelir", amount: 6500, description: "İhtarname Düzenleme Ücreti", gun: 5 },
    { type: "gider", amount: 1800, description: "Yazılım Abonelikleri", gun: 3 },
  ];
  for (const g of gelirGiderVerisi) {
    await prisma.transaction.create({
      data: {
        type: g.type,
        amount: g.amount,
        description: g.description,
        date: gunOnce(g.gun),
        userId: user.id,
        workspaceId: workspace.id,
      },
    });
  }

  // ── 6) Görevler (kanban'ın 3 sütununda da veri olsun) ──
  const gorevVerisi = [
    { title: "Yılmaz dosyası için tanık listesi hazırla", status: "yapilacak", gun: 2 },
    { title: "Kira tespit davası dilekçesini gözden geçir", status: "yapilacak", gun: 5 },
    { title: "Miras dosyasında veraset ilamını incele", status: "devam", gun: 1 },
    { title: "Ticari alacak davasında bilirkişi raporuna itiraz yaz", status: "devam", gun: -1 }, // gecikmiş
    { title: "Boşanma davası duruşma tutanağını arşivle", status: "tamamlandi", gun: -4 },
    { title: "İş kazası dosyasında SGK yazışması gönder", status: "tamamlandi", gun: -7 },
  ];
  for (const g of gorevVerisi) {
    await prisma.task.create({
      data: {
        title: g.title,
        status: g.status,
        done: g.status === "tamamlandi",
        dueDate: gunSonra(g.gun),
        userId: user.id,
        assignedToId: user.id,
        workspaceId: workspace.id,
      },
    });
  }

  // ── 7) Notlar ──
  await prisma.note.create({
    data: { content: "Zeynep Kaya ile Perşembe günü telefon görüşmesi yapılacak — boşanma davasına dair yeni belge geldi mi sorulacak.", userId: user.id, workspaceId: workspace.id },
  });
  await prisma.note.create({
    data: { content: "Antalya İnşaat A.Ş. dosyasında keşif tarihi netleşince takvime eklenecek.", userId: user.id, workspaceId: workspace.id },
  });

  console.log("✅ Demo verisi başarıyla oluşturuldu.");
  console.log(`   E-posta: ${DEMO_EMAIL}`);
  console.log(`   Şifre:   ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("Demo verisi oluşturulurken hata:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
