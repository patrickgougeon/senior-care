// O campo Device.connected só muda quando algo chega da ponte. Se a ponte for
// desligada (ou o notebook dormir), ele ficaria "Conectado" para sempre — então o
// dashboard considera o dispositivo online apenas se houve sinal recente.
export const ONLINE_WINDOW_MS = 15_000;

export function isDeviceOnline(device: { connected: boolean; lastSeenAt: Date | null }, now = Date.now()) {
  return device.connected && !!device.lastSeenAt && now - device.lastSeenAt.getTime() <= ONLINE_WINDOW_MS;
}
