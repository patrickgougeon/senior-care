"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { DashboardSnapshot } from "@/lib/dashboard-data";
import { DeviceStatus } from "./DeviceStatus";
import { EventFeed } from "./EventFeed";
import { FallAlertBanner } from "./FallAlertBanner";

const POLL_INTERVAL_MS = 1500;
const HISTORY_LENGTH = 60;
const ALARM_REPEAT_MS = 3000;
const BASE_TITLE = "Visão Geral | SeniorCare";

// Dashboard com atualização automática: consulta /api/dashboard/snapshot a cada
// ~1,5 s, então uma queda enviada pela ponte aparece sem recarregar a página.
export function LiveDashboard({ initial }: { initial: DashboardSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [history, setHistory] = useState<number[]>([]);
  const [linkOk, setLinkOk] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/snapshot", { cache: "no-store" });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      const data: DashboardSnapshot = await res.json();
      setSnapshot(data);
      setLinkOk(true);
      const level = data.device?.connected ? data.device.activityLevel : null;
      setHistory((prev) => (level === null ? [] : [...prev, level].slice(-HISTORY_LENGTH)));
    } catch {
      setLinkOk(false);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const pendingCount = snapshot.pendingFalls.length;

  // Título da aba chama atenção mesmo com outra aba em primeiro plano.
  useEffect(() => {
    document.title = pendingCount > 0 ? "🚨 QUEDA DETECTADA | SeniorCare" : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [pendingCount]);

  // Alarme sonoro enquanto houver queda sem resolução (precisa ser ativado por um
  // clique — navegadores bloqueiam áudio automático).
  useEffect(() => {
    if (!soundOn || pendingCount === 0) return;
    const beep = () => {
      const ctx = audioRef.current;
      if (!ctx) return;
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = i % 2 === 0 ? 880 : 660;
        gain.gain.value = 0.15;
        osc.connect(gain).connect(ctx.destination);
        const start = ctx.currentTime + i * 0.28;
        osc.start(start);
        osc.stop(start + 0.2);
      }
    };
    beep();
    const id = setInterval(beep, ALARM_REPEAT_MS);
    return () => clearInterval(id);
  }, [soundOn, pendingCount > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleSound() {
    if (!soundOn) {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
    }
    setSoundOn((v) => !v);
  }

  async function handleResolve(id: string) {
    await fetch(`/api/events/${id}`, { method: "PATCH" });
    await refresh();
  }

  return (
    <div>
      <div className="mb-2 flex justify-end gap-3 text-xs">
        {!linkOk && (
          <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
            Sem conexão com o servidor — tentando novamente…
          </span>
        )}
        <button
          onClick={toggleSound}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-medium text-gray-600 shadow-sm transition hover:text-gray-900"
        >
          {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          {soundOn ? "Alarme sonoro ligado" : "Ativar alarme sonoro"}
        </button>
      </div>

      <FallAlertBanner falls={snapshot.pendingFalls} onResolve={handleResolve} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DeviceStatus device={snapshot.device} history={history} onChanged={refresh} />
        <EventFeed events={snapshot.events} onResolve={handleResolve} />
      </div>
    </div>
  );
}
