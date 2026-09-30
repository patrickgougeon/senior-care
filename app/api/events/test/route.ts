import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyFall } from "@/lib/notifications";

// Botão "Testar alerta" do dashboard: cria uma queda SIMULADA (claramente marcada
// como teste) para validar a tela/som/notificações sem depender do hardware.
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const device = await prisma.device.findFirst({ where: { userId: session.user.id } });
  if (!device) {
    return NextResponse.json({ error: "Cadastre um dispositivo antes de testar." }, { status: 409 });
  }

  const message = "[TESTE] Queda simulada pelo painel — nenhuma queda real foi detectada.";
  const event = await prisma.event.create({
    data: {
      deviceId: device.id,
      type: "fall_detected",
      severity: "high",
      message,
      details: JSON.stringify({ simulated: true, source: "dashboard" }),
    },
  });

  void notifyFall(session.user.id, message);

  return NextResponse.json({ id: event.id }, { status: 201 });
}
