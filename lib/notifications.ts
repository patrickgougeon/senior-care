import { prisma } from "./prisma";

// Notificação externa opcional. Sem TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID no .env
// nada é enviado — o alerta continua aparecendo no dashboard normalmente.
// Nunca lança: uma falha aqui não pode impedir o registro da queda.
export async function notifyFall(userId: string, message: string) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, contacts: { select: { name: true, phone: true } } },
    });
    const contacts = user?.contacts.map((c) => `${c.name} (${c.phone})`).join(", ");
    const text =
      `🚨 SeniorCare — ${message}\n` +
      (user ? `Conta: ${user.name}\n` : "") +
      (contacts ? `Contatos de emergência: ${contacts}` : "");

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`[notifications] Telegram respondeu ${res.status}`);
  } catch (err) {
    console.error("[notifications] falha ao notificar:", err);
  }
}
