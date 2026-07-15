import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPortalToken, PORTAL_COOKIE_NAME } from "@/lib/portalAuth";

export async function GET() {
  const token = cookies().get(PORTAL_COOKIE_NAME)?.value;
  const clientId = verifyPortalToken(token);
  if (!clientId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      cases: {
        include: {
          events: { orderBy: { dueDate: "asc" }, where: { dueDate: { gte: new Date() } }, take: 3 },
          invoices: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!client) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const cases = client.cases.map((c) => {
    const invoicedTotal = c.invoices.reduce((s, i) => s + i.amount, 0);
    return {
      id: c.id,
      title: c.title,
      status: c.status,
      agreedFee: c.agreedFee,
      invoicedTotal,
      remaining: c.agreedFee ? Math.max(0, c.agreedFee - invoicedTotal) : null,
      upcomingEvents: c.events.map((e) => ({ type: e.type, title: e.title, dueDate: e.dueDate })),
    };
  });

  return NextResponse.json({ clientName: client.name, cases });
}
