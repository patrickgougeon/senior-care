import crypto from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDeviceCredentials } from "@/lib/device-auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const existing = await prisma.device.findFirst({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json(
      { error: "Você já possui um dispositivo cadastrado. Remova-o antes de cadastrar outro." },
      { status: 409 }
    );
  }

  let name = "Dispositivo SeniorCare";
  try {
    const body = await request.json();
    if (typeof body?.name === "string" && body.name.trim()) name = body.name.trim();
  } catch {
    // corpo vazio é aceitável — usa o nome padrão
  }

  const id = crypto.randomUUID();
  const { apiKey, apiKeyHash } = generateDeviceCredentials(id);

  const device = await prisma.device.create({
    data: { id, name, userId: session.user.id, apiKeyHash },
  });

  return NextResponse.json(
    {
      device: {
        id: device.id,
        name: device.name,
        connected: device.connected,
        lastSeenAt: device.lastSeenAt,
        batteryLevel: device.batteryLevel,
      },
      // Só é exibida agora — não fica recuperável depois (só o hash é guardado).
      apiKey,
    },
    { status: 201 }
  );
}
