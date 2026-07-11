import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Oturum açmış kullanıcının hem kendi ID'sini hem de bağlı olduğu
// büronun (workspace) ID'sini döndürür. Müvekkil/dosya gibi paylaşılan
// veriler artık kullanıcıya değil, büroya bağlı — bu yüzden neredeyse
// her uç nokta bu ikisine de ihtiyaç duyuyor.
export async function requireWorkspace(): Promise<{ userId: string; workspaceId: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { workspaceId: true } });
  if (!user?.workspaceId) return null;

  return { userId, workspaceId: user.workspaceId };
}

// Belirtilen müvekkilin, oturum açan kullanıcının BÜROSUNA ait olup
// olmadığını doğrular — çoğu iç içe uç nokta (dosyalar, faturalar,
// tarihler) bunu kullanır.
export async function requireOwnedClient(clientId: string): Promise<{ userId: string; workspaceId: string } | null> {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const client = await prisma.client.findFirst({ where: { id: clientId, workspaceId: ws.workspaceId } });
  return client ? ws : null;
}

// Belirtilen dosyanın (Case), oturum açan kullanıcının BÜROSUNA ait bir
// müvekkile bağlı olup olmadığını doğrular.
export async function requireOwnedCase(caseId: string): Promise<{ userId: string; workspaceId: string } | null> {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const found = await prisma.case.findFirst({ where: { id: caseId, client: { workspaceId: ws.workspaceId } } });
  return found ? ws : null;
}
