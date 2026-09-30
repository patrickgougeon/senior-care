"use client";

import { AlertTriangle, CheckCircle, BatteryLow, WifiOff } from "lucide-react";
import type { EventType } from "@/lib/events";
import type { EventDTO } from "@/lib/dashboard-data";
import { formatFallDetails } from "./FallAlertBanner";

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 10) return "agora mesmo";
  if (secs < 60) return `${secs} s atrás`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

const eventConfig: Record<EventType, { icon: React.ElementType; color: string; bg: string }> = {
  fall_detected: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  low_battery: { icon: BatteryLow, color: "text-orange-600", bg: "bg-orange-100" },
  device_offline: { icon: WifiOff, color: "text-gray-500", bg: "bg-gray-100" },
  normal: { icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-100" },
};

export function EventFeed({
  events,
  onResolve,
}: {
  events: EventDTO[];
  onResolve?: (id: string) => Promise<void>;
}) {
  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Últimos Eventos</h2>
      </div>

      {events.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          Nenhum evento registrado ainda. Assim que o dispositivo enviar dados, eles aparecerão aqui.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => {
            const cfg = eventConfig[event.type as EventType] ?? eventConfig.normal;
            const Icon = cfg.icon;
            const isPendingFall = event.type === "fall_detected" && !event.resolved;
            const details = event.type === "fall_detected" ? formatFallDetails(event.details) : null;
            return (
              <li
                key={event.id}
                className={`flex items-start gap-3 rounded-xl p-4 ${
                  event.severity === "high" && !event.resolved
                    ? "bg-red-50 ring-1 ring-red-200"
                    : "bg-gray-50"
                }`}
              >
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                  <Icon className={`h-5 w-5 ${cfg.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{event.message}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {formatRelativeTime(event.occurredAt)}
                    {details && ` · ${details}`}
                    {event.confidence !== null && ` · índice ${Math.round(event.confidence * 100)}%`}
                  </p>
                </div>
                {isPendingFall && onResolve && (
                  <button
                    onClick={() => onResolve(event.id)}
                    className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
                  >
                    Resolver
                  </button>
                )}
                {event.resolved && (
                  <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">
                    Resolvido
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
