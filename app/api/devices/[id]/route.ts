import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const device = await prisma.device.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!device) {
    return NextResponse.json({ error: "Dispositivo não encontrado." }, { status: 404 });
  }

  await prisma.device.delete({ where: { id: params.id } });
  return new NextResponse(null, { status: 204 });
}
