import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const contacts = await prisma.emergencyContact.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, phone: true, email: true },
  });

  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { name, phone, email } = await request.json();

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar contato." }, { status: 500 });
  }
}
