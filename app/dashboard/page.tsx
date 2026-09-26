import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DeviceStatus } from "@/components/dashboard/DeviceStatus";
import { EventFeed } from "@/components/dashboard/EventFeed";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Visão Geral" };

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const device = await prisma.device.findFirst({ where: { userId }, orderBy: { createdAt: "asc" } });
  const events = device
    ? await prisma.event.findMany({
        where: { deviceId: device.id },
        orderBy: { occurredAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">
          Olá, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-base text-gray-500">
          Aqui está o resumo do monitoramento do seu familiar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DeviceStatus
          device={
            device && {
              id: device.id,
              name: device.name,
              connected: device.connected,
              lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
              batteryLevel: device.batteryLevel,
            }
          }
        />
        <EventFeed
          events={events.map((e) => ({
            id: e.id,
            type: e.type,
            severity: e.severity,
            message: e.message,
            occurredAt: e.occurredAt.toISOString(),
            resolved: e.resolved,
          }))}
        />
      </div>
    </div>
  );
}
