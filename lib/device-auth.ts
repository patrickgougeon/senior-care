import crypto from "crypto";
import { prisma } from "./prisma";
import type { Device } from "@prisma/client";

// A chave tem o formato "<deviceId>.<secret>". O deviceId permite localizar o
// registro sem varrer a tabela; só o hash SHA-256 do secret é armazenado.
function hashSecret(secret: string) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

export function generateDeviceCredentials(deviceId: string) {
  const secret = crypto.randomBytes(24).toString("hex");
  return {
    apiKey: `${deviceId}.${secret}`,
    apiKeyHash: hashSecret(secret),
  };
}

export async function authenticateDevice(authHeader: string | null): Promise<Device | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;

  const apiKey = authHeader.slice(7).trim();
  const separatorIndex = apiKey.indexOf(".");
  if (separatorIndex <= 0) return null;

  const deviceId = apiKey.slice(0, separatorIndex);
  const secret = apiKey.slice(separatorIndex + 1);
  if (!secret) return null;

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) return null;

  const provided = Buffer.from(hashSecret(secret));
  const expected = Buffer.from(device.apiKeyHash);
  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return null;
  }

  return device;
}
