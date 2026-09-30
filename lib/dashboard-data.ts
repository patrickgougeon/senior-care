import { prisma } from "./prisma";
import { isDeviceOnline } from "./device-status";

export interface DeviceDTO {
  id: string;
  name: string;
  connected: boolean;
  lastSeenAt: string | null;
  batteryLevel: number | null;
  detectorState: string | null;
  activityLevel: number | null;
  rssi: number | null;
}

export interface EventDTO {
  id: string;
  type: string;
  severity: string;
  message: string;
  confidence: number | null;
  details: Record<string, unknown> | null;
  occurredAt: string;
  resolved: boolean;
}

export interface DashboardSnapshot {
  device: DeviceDTO | null;
  events: EventDTO[];
  // Quedas ainda não resolvidas (mais recente primeiro) — alimentam o alerta vermelho.
  pendingFalls: EventDTO[];
  serverTime: string;
}

function parseDetails(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function getDashboardSnapshot(userId: string): Promise<DashboardSnapshot> {
  const device = await prisma.device.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });

  if (!device) {
    return { device: null, events: [], pendingFalls: [], serverTime: new Date().toISOString() };
  }

  const [events, pending] = await Promise.all([
    prisma.event.findMany({ where: { deviceId: device.id }, orderBy: { occurredAt: "desc" }, take: 10 }),
    prisma.event.findMany({
      where: { deviceId: device.id, type: "fall_detected", resolved: false },
      orderBy: { occurredAt: "desc" },
      take: 20,
    }),
  ]);

  const toDto = (e: (typeof events)[number]): EventDTO => ({
    id: e.id,
    type: e.type,
    severity: e.severity,
    message: e.message,
    confidence: e.confidence,
    details: parseDetails(e.details),
    occurredAt: e.occurredAt.toISOString(),
    resolved: e.resolved,
  });

  const online = isDeviceOnline(device);

  return {
    device: {
      id: device.id,
      name: device.name,
      connected: online,
      lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
      batteryLevel: device.batteryLevel,
      // Sem sinal recente, a telemetria antiga não deve parecer atual.
      detectorState: online ? device.detectorState : null,
      activityLevel: online ? device.activityLevel : null,
      rssi: online ? device.rssi : null,
    },
    events: events.map(toDto),
    pendingFalls: pending.map(toDto),
    serverTime: new Date().toISOString(),
  };
}
