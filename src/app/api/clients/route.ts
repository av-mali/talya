import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// Tüm müvekkilleri listele (arama isteğe bağlı: ?q=isim, tablo görünümü: ?full=1, arşiv: ?archived=1)
export async function GET(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const { workspaceId } = ws;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const full = searchParams.get("full") === "1";
  const archived = searchParams.get("archived") === "1";

  if (full) {
    // Tablo/rapor görünümü için: dosya sayısı, toplam faturalanan tutar dahil.
    const clients = await prisma.client.findMany({
      where: { workspaceId, archived, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) },
      orderBy: { name: "asc" },
      include: {
        cases: {
          include: {
            events: { orderBy: { dueDate: "asc" }, where: { dueDate: { gte: new Date() } }, take: 1 },
            invoices: true,
          },
        },
      },
    });

    const rows = clients.map((c) => {
      const allEvents = c.cases.flatMap((cs) => cs.events);
      const nextEvent = allEvents.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
      const totalInvoiced = c.cases.flatMap((cs) => cs.invoices).reduce((s, i) => s + i.amount, 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        tcMersis: c.tcMersis,
        archived: c.archived,
        caseCount: c.cases.length,
        totalInvoiced,
        nextEventDate: nextEvent ? nextEvent.dueDate : null,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ clients: rows });
  }

  const clients = await prisma.client.findMany({
    where: {
      workspaceId,
      archived: false,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { name: "asc" },
    include: {
      cases: {
        include: {
          events: { orderBy: { dueDate: "asc" }, where: { dueDate: { gte: new Date() } }, take: 1 },
        },
      },
    },
  });

  // Her müvekkil için, tüm dosyalarındaki en yakın tarihi tek bir alana indir
  const withNextEvent = clients.map((c) => {
    const upcoming = c.cases
      .flatMap((cs) => cs.events)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return { ...c, events: upcoming.slice(0, 1) };
  });

  return NextResponse.json({ clients: withNextEvent });
}

// Yeni müvekkil oluştur
export async function POST(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { name, phone, email, notes, tcMersis } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "Müvekkil adı gerekli." }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: { name: name.trim(), phone, email, notes, tcMersis, workspaceId: ws.workspaceId },
  });

  return NextResponse.json({ client });
}
