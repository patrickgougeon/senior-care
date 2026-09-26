import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateDevice } from "@/lib/device-auth";
import { EVENT_TYPES, SEVERITIES, DEFAULT_SEVERITY, DEFAULT_MESSAGE, type EventType, type Severity } from "@/lib/events";

// Endpoint chamado pelo serviço externo que processa o sinal Wi-Fi (CSI) entre
// os dois ESP32 — ele envia aqui o evento já interpretado (ex.: queda detectada),
// não os dados brutos do dispositivo.
//
// Autenticação: Authorization: Bearer <apiKey do dispositivo>
// Corpo esperado (JSON):
//   {
//     "type": "fall_detected" | "normal" | "low_battery" | "device_offline",
//     "severity": "high" | "medium" | "low",   // opcional, tem padrão por tipo
//     "message": "texto customizado",           // opcional, tem padrão por tipo
//     "confidence": 0.93,                       // opcional, 0 a 1
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

  const { type, severity, message, confidence, batteryLevel, timestamp } = (body ?? {}) as Record<string, unknown>;

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

  // MVP: o alerta fica disponível no dashboard. Notificação automática dos
  // contatos de emergência (SMS/e-mail) ainda não está implementada.

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
