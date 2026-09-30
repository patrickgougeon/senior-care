import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateDevice } from "@/lib/device-auth";
import { notifyFall } from "@/lib/notifications";
import { EVENT_TYPES, SEVERITIES, DEFAULT_SEVERITY, DEFAULT_MESSAGE, type EventType, type Severity } from "@/lib/events";

// Endpoint chamado pela ponte (fall-detection/bridge), que roda no notebook, lê o
// CSI enviado pelo ESP32 receptor pela USB, detecta a queda e envia aqui o evento
// já interpretado — não os dados brutos do dispositivo.
//
// Autenticação: Authorization: Bearer <apiKey do dispositivo>
// Corpo esperado (JSON):
//   {
//     "type": "fall_detected" | "normal" | "low_battery" | "device_offline",
//     "severity": "high" | "medium" | "low",   // opcional, tem padrão por tipo
//     "message": "texto customizado",           // opcional, tem padrão por tipo
//     "confidence": 0.93,                       // opcional, 0 a 1
//     "details": { "peakRatio": 6.1 },          // opcional, objeto JSON com métricas do detector
//     "batteryLevel": 82,                       // opcional, 0 a 100
//     "timestamp": "2026-09-26T12:00:00Z"       // opcional, default = agora
//   }
export async function POST(request: Request) {
  const device = await authenticateDevice(request.headers.get("authorization"));
  if (!device) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { type, severity, message, confidence, batteryLevel, timestamp, details } = (body ?? {}) as Record<string, unknown>;

  if (typeof type !== "string" || !EVENT_TYPES.includes(type as EventType)) {
    return NextResponse.json(
      { error: `Campo "type" é obrigatório e deve ser um de: ${EVENT_TYPES.join(", ")}.` },
      { status: 400 }
    );
  }
  const eventType = type as EventType;

  let resolvedSeverity: Severity = DEFAULT_SEVERITY[eventType];
  if (severity !== undefined) {
    if (typeof severity !== "string" || !SEVERITIES.includes(severity as Severity)) {
      return NextResponse.json(
        { error: `Campo "severity" deve ser um de: ${SEVERITIES.join(", ")}.` },
        { status: 400 }
      );
    }
    resolvedSeverity = severity as Severity;
  }

  const resolvedMessage =
    typeof message === "string" && message.trim() ? message.trim() : DEFAULT_MESSAGE[eventType];

  let confidenceValue: number | null = null;
  if (confidence !== undefined) {
    if (typeof confidence !== "number" || confidence < 0 || confidence > 1) {
      return NextResponse.json({ error: 'Campo "confidence" deve ser um número entre 0 e 1.' }, { status: 400 });
    }
    confidenceValue = confidence;
  }

  let batteryValue: number | undefined;
  if (batteryLevel !== undefined) {
    if (typeof batteryLevel !== "number" || batteryLevel < 0 || batteryLevel > 100) {
      return NextResponse.json({ error: 'Campo "batteryLevel" deve ser um número entre 0 e 100.' }, { status: 400 });
    }
    batteryValue = batteryLevel;
  }

  let detailsJson: string | null = null;
  if (details !== undefined && details !== null) {
    if (typeof details !== "object" || Array.isArray(details)) {
      return NextResponse.json({ error: 'Campo "details" deve ser um objeto JSON.' }, { status: 400 });
    }
    detailsJson = JSON.stringify(details);
    if (detailsJson.length > 2000) {
      return NextResponse.json({ error: 'Campo "details" muito grande (máx. 2000 caracteres).' }, { status: 400 });
    }
  }

  let occurredAt = new Date();
  if (timestamp !== undefined) {
    if (typeof timestamp !== "string") {
      return NextResponse.json({ error: 'Campo "timestamp" deve ser uma data ISO 8601.' }, { status: 400 });
    }
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'Campo "timestamp" inválido.' }, { status: 400 });
    }
    occurredAt = parsed;
  }

  const event = await prisma.event.create({
    data: {
      deviceId: device.id,
      type: eventType,
      severity: resolvedSeverity,
      message: resolvedMessage,
      confidence: confidenceValue,
      details: detailsJson,
      occurredAt,
    },
  });

  await prisma.device.update({
    where: { id: device.id },
    data: {
      connected: eventType !== "device_offline",
      lastSeenAt: new Date(),
      ...(batteryValue !== undefined ? { batteryLevel: batteryValue } : {}),
    },
  });

  // O alerta aparece no dashboard (que atualiza sozinho). Notificação externa
  // (Telegram) é opcional e não bloqueia a resposta — ver lib/notifications.ts.
  if (eventType === "fall_detected") {
    void notifyFall(device.userId, resolvedMessage);
  }

  return NextResponse.json(
    {
      id: event.id,
      type: event.type,
      severity: event.severity,
      message: event.message,
      occurredAt: event.occurredAt,
    },
    { status: 201 }
  );
}
