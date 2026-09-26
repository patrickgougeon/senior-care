export type EventType = "fall_detected" | "normal" | "low_battery" | "device_offline";
export type Severity = "high" | "medium" | "low";

export const EVENT_TYPES: EventType[] = ["fall_detected", "normal", "low_battery", "device_offline"];
export const SEVERITIES: Severity[] = ["high", "medium", "low"];

export const DEFAULT_SEVERITY: Record<EventType, Severity> = {
  fall_detected: "high",
  low_battery: "medium",
  device_offline: "medium",
  normal: "low",
};

export const DEFAULT_MESSAGE: Record<EventType, string> = {
  fall_detected: "Queda detectada — verifique o dashboard.",
  low_battery: "Bateria do dispositivo abaixo de 20%.",
  device_offline: "Dispositivo perdeu conexão.",
  normal: "Monitoramento ativo — nenhuma anormalidade detectada.",
};
