// Cria uma conta de demonstração com um dispositivo já cadastrado e imprime a
// apiKey que a ponte (fall-detection/bridge) precisa. Uso: npm run db:seed
//
// Pode ser rodado várias vezes: se o dispositivo de demo já existir, uma NOVA
// apiKey é gerada para ele (a antiga deixa de valer).
//
// A apiKey segue o formato de lib/device-auth.ts: "<deviceId>.<secret>", com
// apenas o SHA-256 do secret guardado no banco.
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@seniorcare.local";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo12345";

async function main() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { password },
    create: { name: "Conta Demo", email: DEMO_EMAIL, password },
  });

  const secret = crypto.randomBytes(24).toString("hex");
  const apiKeyHash = crypto.createHash("sha256").update(secret).digest("hex");

  let device = await prisma.device.findFirst({ where: { userId: user.id } });
  if (device) {
    await prisma.device.update({ where: { id: device.id }, data: { apiKeyHash } });
  } else {
    const id = crypto.randomUUID();
    device = await prisma.device.create({
      data: { id, name: "Par ESP32 (demo)", userId: user.id, apiKeyHash },
    });
  }

  const contacts = await prisma.emergencyContact.count({ where: { userId: user.id } });
  if (contacts === 0) {
    await prisma.emergencyContact.create({
      data: { name: "Contato Demo", phone: "(11) 90000-0000", userId: user.id },
    });
  }

  console.log("\n=== SeniorCare — conta de demonstração ===");
  console.log(`Login:  ${DEMO_EMAIL}`);
  console.log(`Senha:  ${DEMO_PASSWORD}`);
  console.log("\napiKey do dispositivo (cole no .env da ponte como SENIORCARE_API_KEY):");
  console.log(`${device.id}.${secret}\n`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
