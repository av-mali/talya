import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Bu uç nokta yeni kullanıcı kaydı içindir.
// Tarayıcıdan gelen şifreyi asla olduğu gibi saklamayız; önce hash'leriz.
// Yeni kayıtlar "onay bekliyor" durumunda oluşturulur — yönetici
// panelinden onaylanana kadar giriş yapamazlar.
export async function POST(req: Request) {
  try {
    const { email, password, name, phone, baro, sicilNo } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta ve en az 6 karakterli şifre girin." },
        { status: 400 }
      );
    }
    if (!phone || !baro || !sicilNo) {
      return NextResponse.json(
        { error: "Telefon, baro ve sicil numarası gerekli." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu e-posta ile zaten bir hesap var." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone, baro, sicilNo, approved: false },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
