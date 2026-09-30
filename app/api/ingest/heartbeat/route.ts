import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateDevice } from "@/lib/device-auth";

// "Estou vivo" da ponte (~1x por segundo). Não cria evento — só atualiza o
// status do dispositivo (conectado / última atividade / telemetria do detector),
// para o dashboard mostrar o sistema online sem poluir o histórico.
//
// Autenticação: Authorization: Bearer <apiKey do dispositivo>
// Corpo (JSON, tudo opcional):
//   { "state": "monitoring", "activity": 0.031, "rssi": -52, "batteryLevel": 80 }
export async function POST(request: Request) {
  const device = await authenticateDevice(request.headers.get("authorization"));
  if (!device) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    const parsed = await request.json();
    if (parsed && typeof parsed === "object") body = parsed as Record<string, unknown>;
  } catch {
    // corpo vazio é aceitável — só marca o dispositivo como vivo
  }

  const { state, activity, rssi, batteryLevel } = body;
  const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

  await prisma.device.update({
    where: { id: device.id },
    data: {
      connected: true,
      lastSeenAt: new Date(),
      ...(typeof state === "string" ? { detectorState: state.slice(0, 32) } : {}),
      ...(finite(activity) ? { activityLevel: activity } : {}),
      ...(finite(rssi) ? { rssi: Math.round(rssi) } : {}),
      ...(finite(batteryLevel) && batteryLevel >= 0 && batteryLevel <= 100
        ? { batteryLevel: Math.round(batteryLevel) }
        : {}),
    },
  });

  return NextResponse.json({ ok: true, serverTime: new Date().toISOString() });
}
