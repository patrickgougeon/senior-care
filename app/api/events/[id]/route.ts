import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Marca um evento como resolvido (cuidador já verificou a situação).
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const event = await prisma.event.findFirst({
    where: { id: params.id, device: { userId: session.user.id } },
  });
  if (!event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  let resolved = true;
  try {
    const body = await request.json();
    if (typeof body?.resolved === "boolean") resolved = body.resolved;
  } catch {
    // sem corpo = resolver
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: { resolved, resolvedAt: resolved ? new Date() : null },
  });

  return NextResponse.json({ id: updated.id, resolved: updated.resolved });
}
