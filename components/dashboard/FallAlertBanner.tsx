"use client";

import { useState } from "react";
import { Siren, Check } from "lucide-react";
import type { EventDTO } from "@/lib/dashboard-data";

export function formatFallDetails(details: EventDTO["details"]): string | null {
  if (!details) return null;
  const parts: string[] = [];
  if (details.simulated) parts.push("simulado");
  if (typeof details.peakRatio === "number") parts.push(`pico ${details.peakRatio.toFixed(1)}× o ruído base`);
  if (typeof details.stillSeconds === "number") parts.push(`imóvel por ${details.stillSeconds.toFixed(1)} s`);
  return parts.length ? parts.join(" · ") : null;
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function FallAlertBanner({
  falls,
  onResolve,
}: {
  falls: EventDTO[];
  onResolve: (id: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  if (falls.length === 0) return null;

  const latest = falls[0];
  const details = formatFallDetails(latest.details);

  async function handleResolve() {
    setBusy(true);
    try {
      await onResolve(latest.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="alert"
      className="mb-6 animate-pulse rounded-3xl bg-red-600 p-6 text-white shadow-lg ring-4 ring-red-300"
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
          <Siren className="h-9 w-9" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-extrabold tracking-tight">QUEDA DETECTADA</p>
          <p className="mt-1 text-base text-red-50">
            {latest.message} — às {formatClock(latest.occurredAt)}
          </p>
          {details && <p className="mt-0.5 text-sm text-red-100">{details}</p>}
          {falls.length > 1 && (
            <p className="mt-0.5 text-sm font-semibold text-red-100">
              + {falls.length - 1} alerta{falls.length > 2 ? "s" : ""} anterior{falls.length > 2 ? "es" : ""} sem resolução
            </p>
          )}
        </div>
        <button
          onClick={handleResolve}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          <Check className="h-4 w-4" />
          {busy ? "Registrando…" : "Marcar como resolvido"}
        </button>
      </div>
    </div>
  );
}
