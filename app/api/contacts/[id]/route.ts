import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedContact(id: string, userId: string) {
  return prisma.emergencyContact.findFirst({ where: { id, userId } });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const contact = await getOwnedContact(params.id, session.user.id);
  if (!contact) {
    return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  }

  try {
    const { name, phone, email } = await request.json();

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 });
    }

    const updated = await prisma.emergencyContact.update({
      where: { id: params.id },
      data: { name: name.trim(), phone: phone.trim(), email: email?.trim() || null },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar contato." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const contact = await getOwnedContact(params.id, session.user.id);
  if (!contact) {
    return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  }

  await prisma.emergencyContact.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
