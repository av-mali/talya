import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LandingPage from "./marketing-page";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect("/dashboard");
  }
  // Giriş yapmamış ziyaretçi — halka açık tanıtım/pazarlama sayfasını gösteriyoruz.
  return <LandingPage />;
}
