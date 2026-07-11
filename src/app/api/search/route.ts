import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";

// Tek bir arama kutusuyla müvekkil, not, görev ve şablon içinde birden
// arama yapar — Büro Yönetimi'ndeki "Global Arama" aracı bunu kullanır.
export async function GET(req: Request) {
  const ws = await requireWorkspace();
  if (!ws) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const ci = { contains: q, mode: "insensitive" as const };

  const [clients, notes, tasks, templates] = await Promise.all([
    prisma.client.findMany({ where: { workspaceId: ws.workspaceId, name: ci }, take: 8 }),
    prisma.note.findMany({ where: { workspaceId: ws.workspaceId, content: ci }, take: 8 }),
    prisma.task.findMany({ where: { workspaceId: ws.workspaceId, title: ci }, take: 8 }),
    prisma.template.findMany({ where: { workspaceId: ws.workspaceId, OR: [{ title: ci }, { content: ci }] }, take: 8 }),
  ]);

  const results = [
    ...clients.map((c) => ({ type: "muvekkil", id: c.id, title: c.name, subtitle: c.phone || c.email || "" })),
    ...notes.map((n) => ({ type: "not", id: n.id, title: n.content.slice(0, 60), subtitle: new Date(n.createdAt).toLocaleDateString("tr-TR") })),
    ...tasks.map((t) => ({ type: "gorev", id: t.id, title: t.title, subtitle: t.done ? "Tamamlandı" : "Açık" })),
    ...templates.map((tp) => ({ type: "sablon", id: tp.id, title: tp.title, subtitle: "Şablon" })),
  ];

  return NextResponse.json({ results });
}
