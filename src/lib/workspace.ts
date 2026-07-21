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

// Belirtilen ücret sözleşmesinin, oturum açan kullanıcının BÜROSUNA ait
// bir müvekkile bağlı olup olmadığını doğrular.
export async function requireOwnedFeeAgreement(agreementId: string): Promise<{ userId: string; workspaceId: string } | null> {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const found = await prisma.feeAgreement.findFirst({ where: { id: agreementId, client: { workspaceId: ws.workspaceId } } });
  return found ? ws : null;
}

// Belirtilen ödeme kaydının, oturum açan kullanıcının BÜROSUNA ait bir
// ücret sözleşmesine bağlı olup olmadığını doğrular.
export async function requireOwnedFeeAgreementPayment(paymentId: string): Promise<{ userId: string; workspaceId: string } | null> {
  const ws = await requireWorkspace();
  if (!ws) return null;
  const found = await prisma.feeAgreementPayment.findFirst({
    where: { id: paymentId, agreement: { client: { workspaceId: ws.workspaceId } } },
  });
  return found ? ws : null;
}

// Bir üyenin belirli bir aracı kullanmaya yetkisi var mı? (Büro yöneticisi
// kapatmışsa false döner.) Yönetici hesapları her zaman her şeyi kullanabilir.
export async function hasToolAccess(userId: string, toolKey: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceRole: true, blockedTools: true },
  });
  if (!user) return false;
  if (user.workspaceRole === "admin") return true;
  const blocked = (user.blockedTools as string[] | null) || [];
  return !blocked.includes(toolKey);
}

// AI özelliklerini (sohbet, Dosya Analizi, Dilekçe Sihirbazı vb.) kullanma
// yetkisi var mı? Yönetici hesapları her zaman kullanabilir.
export async function hasAiAccess(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceRole: true, aiEnabled: true },
  });
  if (!user) return false;
  if (user.workspaceRole === "admin") return true;
  return user.aiEnabled !== false;
}

// Bu kullanıcı, sadece KENDİNE ATANMIŞ dosya/görevleri mi görmeli?
// Yönetici hesapları bu kısıtlamadan her zaman muaftır (her şeyi görür).
export async function shouldRestrictToOwnItems(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { workspaceRole: true, restrictToOwnItems: true },
  });
  if (!user) return false;
  if (user.workspaceRole === "admin") return false;
  return !!user.restrictToOwnItems;
}

// Bir büronun kaç üyesi var? Atama/kısıtlama arayüzlerini sadece
// birden fazla kullanıcılı bürolarda göstermek için kullanılır.
export async function getWorkspaceMemberCount(workspaceId: string): Promise<number> {
  return prisma.user.count({ where: { workspaceId } });
}
