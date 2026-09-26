"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Wifi, WifiOff, Battery, Copy, Check, Trash2 } from "lucide-react";

interface DeviceDTO {
  id: string;
  name: string;
  connected: boolean;
  lastSeenAt: string | null;
  batteryLevel: number | null;
}

function formatLastSeen(iso: string | null) {
  if (!iso) return "Nunca";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `${mins} min atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}

export function DeviceStatus({ device }: { device: DeviceDTO | null }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setError("");
    setCreating(true);
    const res = await fetch("/api/devices", { method: "POST" });
    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao cadastrar dispositivo.");
      return;
    }

    const data = await res.json();
    setNewApiKey(data.apiKey);
  }

  async function handleRemove() {
    if (!device) return;
    if (!confirm(`Remover "${device.name}"? Isso também apaga o histórico de eventos.`)) return;

    setRemoving(true);
    await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
    setRemoving(false);
    router.refresh();
  }

  function handleCopy() {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDone() {
    setNewApiKey(null);
    router.refresh();
  }

  // Chave de API gerada — mostrada uma única vez.
  if (newApiKey) {
    return (
      <div className="card">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Dispositivo cadastrado!</h2>
        <p className="mb-4 text-sm text-gray-500">
          Copie esta chave e configure no serviço que envia os eventos processados. Ela não será
          mostrada novamente.
        </p>
        <div className="flex items-center gap-2 rounded-xl bg-gray-900 p-3">
          <code className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-teal-300">
            {newApiKey}
          </code>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg p-2 text-gray-300 hover:bg-white/10 hover:text-white"
            aria-label="Copiar"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <button onClick={handleDone} className="btn-primary mt-4 text-sm py-2 px-5">
          Já copiei, entendi
        </button>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="card">
        <h2 className="mb-1 text-lg font-bold text-gray-900">Status do Dispositivo</h2>
        <p className="mb-4 text-sm text-gray-500">Nenhum dispositivo cadastrado ainda.</p>
        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </p>
        )}
        <button onClick={handleCreate} disabled={creating} className="btn-primary text-sm py-2 px-5">
          {creating ? "Cadastrando…" : "Cadastrar dispositivo"}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Status do Dispositivo</h2>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-100 hover:text-red-600"
          aria-label="Remover dispositivo"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            device.connected ? "bg-teal-100" : "bg-gray-100"
          }`}
        >
          {device.connected ? (
            <Wifi className="h-7 w-7 text-teal-600" />
          ) : (
            <WifiOff className="h-7 w-7 text-gray-400" />
          )}
        </div>

        <div>
          <p className={`font-semibold ${device.connected ? "text-teal-700" : "text-gray-500"}`}>
            {device.name}
          </p>
          <p className="text-sm text-gray-500">
            {device.connected ? "Conectado" : "Offline"} — última atividade{" "}
            {formatLastSeen(device.lastSeenAt)}
          </p>
          {device.batteryLevel !== null && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Battery className="h-4 w-4" />
              Bateria: {device.batteryLevel}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
