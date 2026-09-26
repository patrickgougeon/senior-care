import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// TODO: Integrate with a real email provider (e.g., Resend, SendGrid, Nodemailer).
// Currently generates the reset token and logs it — no email is sent.
// Steps to wire up:
//   1. Add SMTP_* env vars (see .env.example)
//   2. Install a mail library (e.g., `npm install resend`)
//   3. Replace the console.log below with a real sendMail() call

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email é obrigatório." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Always return 200 to avoid email enumeration
    if (!user) {
      return NextResponse.json({ message: "Se o email estiver cadastrado, você receberá um link em breve." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expiresAt },
    });

    // TODO: Send email with link: `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV] Password reset token for ${email}: ${token}`);
    }

    return NextResponse.json({
      message: "Se o email estiver cadastrado, você receberá um link em breve.",
    });
  } catch {
    return NextResponse.json({ error: "Erro interno. Tente novamente." }, { status: 500 });
  }
}
