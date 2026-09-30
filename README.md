# SeniorCare — MVP v0.1

Sistema de detecção de quedas para idosos. Cobre a landing page pública, autenticação,
gerenciamento de contatos de emergência, e o dashboard **em tempo real** com status do
dispositivo, alerta de queda (banner + alarme sonoro) e histórico de eventos.

O sensor é um par de ESP32 que lê o CSI do Wi-Fi; o detector roda na "ponte" do repositório
[Fall Detection](https://github.com/Heitor65/Fall_Detection-Sistemas_Embarcados) (`bridge/`),
que envia os eventos para este backend via HTTP.

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação e execução local

```bash
# 1. Instalar dependências
npm install

# 2. Criar o .env (copie .env.example e troque o NEXTAUTH_SECRET)
cp .env.example .env            # Windows: copy .env.example .env

# 3. Gerar o cliente Prisma e criar/atualizar o banco SQLite
npx prisma generate
npx prisma migrate deploy

# 4. (Opcional, recomendado p/ demo) conta demo + dispositivo, e imprime a apiKey
npm run db:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` (se a porta estiver ocupada o Next usa 3001 — nesse caso ajuste
`NEXTAUTH_URL` no `.env`). O seed cria `demo@seniorcare.local` / `demo12345` — **só para uso local**.

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="gere-um-segredo-com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: notificação por Telegram quando uma queda é detectada
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
```

Em produção, troque o `DATABASE_URL` para PostgreSQL e gere um `NEXTAUTH_SECRET` forte.

---

## Estrutura do projeto

```
senior-care/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Páginas de login/cadastro/recuperação
│   ├── api/                    # API routes (auth, contatos, devices, events, dashboard, ingest)
│   ├── dashboard/              # Área logada (protegida)
│   └── page.tsx                # Landing page pública
├── components/
│   ├── dashboard/              # Componentes do painel
│   └── landing/                # Componentes da landing page
├── lib/
│   ├── auth.ts                 # Configuração NextAuth
│   ├── device-auth.ts          # Geração/verificação da apiKey do dispositivo
│   ├── events.ts               # Tipos e defaults dos eventos (fall_detected, etc.)
│   ├── dashboard-data.ts       # Snapshot (dispositivo + eventos) usado pelo dashboard
│   ├── device-status.ts        # Regra de "online" (sinal nos últimos 15 s)
│   ├── notifications.ts        # Notificação opcional por Telegram
│   └── prisma.ts               # Singleton do Prisma Client
├── prisma/
│   ├── schema.prisma           # Schema do banco (SQLite em dev)
│   └── seed.js                 # Conta demo + dispositivo (imprime a apiKey)
├── public/
│   └── videos/                 # Coloque hero-animation.mp4 aqui
├── types/
│   └── next-auth.d.ts          # Extensão de tipos para a sessão
└── middleware.ts               # Proteção de rotas /dashboard/*
```

---

## Como o dispositivo se conecta ao backend

O hardware é um par de módulos ESP32 que detecta quedas pela perturbação do sinal Wi-Fi
entre eles (CSI). Este backend **não fala diretamente com o ESP32**: o ESP32 receptor manda o
CSI por USB para o notebook, onde a **ponte** (`Fall_Detection-Sistemas_Embarcados/bridge`) roda o
detector e chama esta API com o evento já interpretado.

```
ESP32 TX ~~Wi-Fi~~ ESP32 RX --USB--> ponte (Node) --HTTP--> SeniorCare (/api/ingest/*) --> dashboard
```

1. Crie a apiKey: `npm run db:seed` (imprime a chave) **ou** no dashboard clique em "Cadastrar
   dispositivo" — a chave é mostrada **uma única vez** (só o hash SHA-256 fica salvo, ver
   `lib/device-auth.ts`).
2. Cole a chave em `SENIORCARE_API_KEY` no `bridge/.env` da ponte.
3. A ponte chama:

   **Evento** — cria um registro no histórico e atualiza o dispositivo:

   ```
   POST /api/ingest/events
   Authorization: Bearer <apiKey>
   Content-Type: application/json

   {
     "type": "fall_detected",   // ou "normal" | "low_battery" | "device_offline"
     "confidence": 0.81,        // opcional, 0 a 1 (índice heurístico da ponte)
     "batteryLevel": 82,        // opcional, 0 a 100
     "message": "texto custom", // opcional — tem um padrão por tipo
     "details": { "peakRatio": 7.4, "stillSeconds": 3.0 }, // opcional, objeto JSON
     "timestamp": "2026-09-26T12:00:00Z" // opcional — default: agora
   }
   ```

   **Heartbeat** (~1×/s) — só atualiza o status, **não** cria evento:

   ```
   POST /api/ingest/heartbeat
   Authorization: Bearer <apiKey>

   { "state": "monitoring", "activity": 0.031, "rssi": -52 }   // tudo opcional
   ```

4. O dashboard (`/dashboard`) consulta `GET /api/dashboard/snapshot` a cada 1,5 s e mostra, sem
   recarregar: banner vermelho de **QUEDA DETECTADA** (+ título da aba e alarme sonoro, se ativado),
   estado do detector, gráfico de atividade do sinal e histórico. "Marcar como resolvido" chama
   `PATCH /api/events/<id>`.
5. O dispositivo aparece como **Online** só se houve heartbeat/evento nos últimos 15 s.

O botão **"Testar alerta (queda simulada)"** do dashboard cria uma queda marcada como `[TESTE]`
(`POST /api/events/test`) para validar tela/som/Telegram sem hardware.

**Notificação externa (opcional):** com `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID` no `.env`, cada
`fall_detected` envia uma mensagem no Telegram (incluindo os contatos de emergência cadastrados).
Sem essas variáveis nada é enviado. **Ainda não há SMS/e-mail/push para os `EmergencyContact`.**

Para testar sem a ponte, gere a apiKey e chame o endpoint na mão:

```bash
curl -X POST http://localhost:3000/api/ingest/events   -H "Authorization: Bearer <apiKey>"   -H "Content-Type: application/json"   -d '{"type":"fall_detected","confidence":0.94}'
```

**Limitação atual:** cada conta suporta **um dispositivo por vez**. `POST /api/devices`
retorna `409` se já existir um. Para trocar de dispositivo, remova o atual primeiro —
pelo botão de lixeira no card "Status do Dispositivo", ou diretamente via
`DELETE /api/devices/<id>` (apaga o dispositivo e, em cascata, seu histórico de eventos).

### O que ainda falta

| Área | Status | O que falta |
|---|---|---|
| Notificação de contatos | 🟡 Parcial | Dashboard em tempo real + Telegram opcional (um chat global via `.env`). SMS/e-mail/push para cada `EmergencyContact` ainda é trabalho futuro. |
| `app/api/auth/forgot-password/route.ts` | 🟡 Sem email | Integrar com Resend / SendGrid / Nodemailer |

---

## Próximos passos (fora desta fatia)

### Notificação real de contatos de emergência
O Telegram opcional (`lib/notifications.ts`) usa um único chat definido no `.env`. Para notificar cada
`EmergencyContact` (SMS/e-mail/push): adicionar as credenciais do provedor (Twilio, Resend, ...) e
estender `notifyFall`, chamado em `app/api/ingest/events/route.ts` para eventos `fall_detected`.

### Tempo real com menos latência
O dashboard usa polling de 1,5 s (simples e robusto). Para push imediato, trocar por Server-Sent Events
ou WebSocket acionados a partir de `app/api/ingest/events/route.ts`.

### Envio de e-mail / notificações de conta
1. Adicionar variáveis SMTP no `.env`.
2. Instalar biblioteca de email (ex: `npm install resend`).
3. Descomentar e completar o trecho em `app/api/auth/forgot-password/route.ts`.

### Banco de dados em produção
- Trocar `provider = "sqlite"` por `"postgresql"` em `prisma/schema.prisma`.
- Ajustar `DATABASE_URL` para a string de conexão do PostgreSQL.

---

## Comandos úteis

```bash
npm run dev           # Servidor de desenvolvimento
npm run build         # Build de produção
npm run db:migrate    # Criar/rodar migrations em desenvolvimento
npm run db:seed       # Conta demo + dispositivo (imprime a apiKey)
npm run db:studio     # Abrir Prisma Studio (GUI do banco)
npm run db:generate   # Regenerar cliente Prisma após alterar schema
```
