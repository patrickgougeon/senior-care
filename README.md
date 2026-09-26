# SeniorCare — MVP v0.1

Sistema de detecção de quedas para idosos. Cobre a landing page pública, autenticação,
gerenciamento de contatos de emergência, e o dashboard com status do dispositivo e
eventos reais (gravados via `/api/ingest/events`).

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação e execução local

```bash
# 1. Instalar dependências
npm install

# 2. Gerar o cliente Prisma e criar o banco de dados SQLite
npx prisma generate
npx prisma migrate dev --name init

# 3. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste os valores:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="gere-um-segredo-com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Em produção, troque o `DATABASE_URL` para PostgreSQL e gere um `NEXTAUTH_SECRET` forte.

---

## Estrutura do projeto

```
senior-care/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Páginas de login/cadastro/recuperação
│   ├── api/                    # API routes (auth, contatos, devices, ingest)
│   ├── dashboard/              # Área logada (protegida)
│   └── page.tsx                # Landing page pública
├── components/
│   ├── dashboard/              # Componentes do painel
│   └── landing/                # Componentes da landing page
├── lib/
│   ├── auth.ts                 # Configuração NextAuth
│   ├── device-auth.ts          # Geração/verificação da apiKey do dispositivo
│   ├── events.ts               # Tipos e defaults dos eventos (fall_detected, etc.)
│   └── prisma.ts               # Singleton do Prisma Client
├── prisma/
│   └── schema.prisma           # Schema do banco (SQLite em dev)
├── public/
│   └── videos/                 # Coloque hero-animation.mp4 aqui
├── types/
│   └── next-auth.d.ts          # Extensão de tipos para a sessão
└── middleware.ts               # Proteção de rotas /dashboard/*
```

---

## Como o dispositivo se conecta ao backend

O hardware é um par de módulos ESP32 que detecta quedas por interferência no sinal
Wi-Fi entre eles (CSI). Este backend **não fala diretamente com o ESP32** — ele recebe,
via HTTP, os eventos já processados por um serviço externo (o que roda o modelo de IA
sobre o sinal Wi-Fi).

1. No dashboard (`/dashboard`), o usuário clica em "Cadastrar dispositivo". Isso chama
   `POST /api/devices`, que cria o registro e devolve uma `apiKey` — mostrada **uma única
   vez** (só o hash SHA-256 fica salvo, ver `lib/device-auth.ts`).
2. Essa `apiKey` é configurada no serviço externo de processamento do sinal.
3. Quando esse serviço identifica um evento, ele chama:

   ```
   POST /api/ingest/events
   Authorization: Bearer <apiKey>
   Content-Type: application/json

   {
     "type": "fall_detected",   // ou "normal" | "low_battery" | "device_offline"
     "confidence": 0.94,        // opcional, 0 a 1
     "batteryLevel": 82,        // opcional, 0 a 100
     "message": "texto custom", // opcional — tem um padrão por tipo
     "timestamp": "2026-09-26T12:00:00Z" // opcional — default: agora
   }
   ```

4. O evento é gravado na tabela `Event` e o `Device` tem `connected`/`lastSeenAt`/
   `batteryLevel` atualizados. O dashboard mostra o evento assim que a página é
   carregada (a query roda a cada acesso).

**Este MVP só avisa pelo dashboard.** Não há envio automático de SMS/e-mail/push para
os `EmergencyContact` cadastrados — essa lista fica salva para consulta manual do
cuidador. Ver "Próximos passos" abaixo para a integração futura.

Para testar sem o serviço externo, basta gerar a apiKey pelo dashboard e chamar o
endpoint na mão:

```bash
curl -X POST http://localhost:3000/api/ingest/events \
  -H "Authorization: Bearer <apiKey>" \
  -H "Content-Type: application/json" \
  -d '{"type":"fall_detected","confidence":0.94}'
```

**Limitação atual:** cada conta suporta **um dispositivo por vez**. `POST /api/devices`
retorna `409` se já existir um. Para trocar de dispositivo, remova o atual primeiro —
pelo botão de lixeira no card "Status do Dispositivo", ou diretamente via
`DELETE /api/devices/<id>` (apaga o dispositivo e, em cascata, seu histórico de eventos).

### O que ainda falta

| Área | Status | O que falta |
|---|---|---|
| Notificação de contatos | 🟡 Não implementada | Hoje o alerta só aparece no dashboard. Enviar SMS/e-mail/push para os `EmergencyContact` é trabalho futuro — ver "Próximos passos". |
| `app/api/auth/forgot-password/route.ts` | 🟡 Sem email | Integrar com Resend / SendGrid / Nodemailer |

---

## Próximos passos (fora desta fatia)

### Notificação real de contatos de emergência
Hoje `app/api/ingest/events/route.ts` só grava o evento — nada é enviado aos
`EmergencyContact` cadastrados. Para implementar:
1. Adicionar variáveis SMTP/Twilio no `.env`.
2. Instalar a lib do provedor (ex: `npm install resend` ou `twilio`).
3. Criar um serviço (ex.: `lib/notifications.ts`) que, ao receber um evento
   `fall_detected`, busca os `EmergencyContact` do usuário e dispara o alerta.
4. Chamar esse serviço em `app/api/ingest/events/route.ts` após criar o evento.

### Status em tempo real no dashboard
Hoje o dashboard mostra o estado no momento em que a página carrega. Para refletir
eventos assim que chegam, considerar WebSocket ou Server-Sent Events acionados a
partir de `app/api/ingest/events/route.ts`.

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
npm run db:migrate    # Rodar migrations
npm run db:studio     # Abrir Prisma Studio (GUI do banco)
npm run db:generate   # Regenerar cliente Prisma após alterar schema
```
