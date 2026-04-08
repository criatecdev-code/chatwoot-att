# Fluxo de Mensagens WizzaChat – Resumo Detalhado e Plano de Otimização

## Índice
1. [Resumo do Fluxo de Recebimento](#1-resumo-do-fluxo-de-recebimento)
2. [Resumo do Fluxo de Envio](#2-resumo-do-fluxo-de-envio)
3. [Pontos de Latência e Gargalos](#3-pontos-de-latência-e-gargalos)
4. [Comparação com Plataformas CRM Líderes](#4-comparação-com-plataformas-crm-líderes)
5. [Plano de Implementação para Otimização](#5-plano-de-implementação-para-otimização)

---

## 1. Resumo do Fluxo de Recebimento

### 1.1 Diagrama Sequencial (Entrada)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  WhatsApp   │────▶│ Baileys (sock)   │────▶│ whatsapp-service    │────▶│ Backend (Nest)  │────▶│  Frontend    │
│  Servidor   │     │ messages.upsert  │     │ forwardToBackend()  │     │ Webhooks API    │     │  Socket.io   │
└─────────────┘     └──────────────────┘     └─────────────────────┘     └─────────────────┘     └──────────────┘
```

### 1.2 Etapas Detalhadas (Recebimento)

| # | Camada | Arquivo | Função/Evento | Descrição |
|---|--------|---------|--------------|-----------|
| 1 | **WhatsApp** | - | - | Mensagem chega aos servidores do WhatsApp |
| 2 | **Baileys** | `baileys.service.ts` | `sock.ev.on('messages.upsert')` | Evento disparado para cada mensagem nova (type === 'notify') |
| 3 | **Filtros** | `baileys.service.ts` | - | Ignora: `status@broadcast`, grupos (`@g.us`), mensagens vazias |
| 4 | **Extração** | `baileys.service.ts` | `getMessageContent()`, `extractMediaMessage()` | Extrai texto, mídia, reações |
| 5 | **Download mídia** | `baileys.service.ts` | `downloadMediaMessage()` | **SÍNCRONO** – baixa mídia antes de prosseguir |
| 6 | **Webhook HTTP** | `baileys.service.ts` | `forwardToBackend('/api/webhooks/whatsapp-service/incoming')` | POST com payload completo (timeout 90s, retry 3x) |
| 7 | **Controller** | `webhooks.controller.ts` | `handleWhatsappServiceIncoming` | Recebe e delega ao service |
| 8 | **Service** | `webhooks.service.ts` | `processWhatsappServiceMessage()` | Busca instance, contact, conversation; trata reações |
| 9 | **Lookups DB** | `webhooks.service.ts` | `findUnique`, `findFirst`, `findMany` | Múltiplas queries Prisma (instance, contact, conversation) |
| 10 | **Storage** | `message-storage.service.ts` | `saveMessage()` | INSERT na tabela `messages` |
| 11 | **Cache** | `webhooks.service.ts` | `updateConversationCache()` | UPDATE em `conversations` (last_message, unread_count) |
| 12 | **Eventos** | `webhooks.service.ts` | `events.push({ new_message, ai_typing })` | Monta array de eventos para Socket.io |
| 13 | **Retorno** | `baileys.service.ts` | `result?.events` | Backend retorna `{ events }` no response HTTP |
| 14 | **Emissão** | `baileys.service.ts` | `this.io.to(room).emit(evt.event, evt.data)` | whatsapp-service emite via Socket.io para rooms |
| 15 | **IA (background)** | `webhooks.service.ts` | `aiService.evaluateLead()`, `processBotResponse()` | IIFE async – não bloqueia resposta |
| 16 | **Frontend** | - | `on('new_message')` | Cliente recebe e renderiza mensagem |

### 1.3 Fluxo de Reações e Status

- **Reações:** `messages.upsert` com `reactionMessage` → webhook incoming com `isReaction: true` → `updateMessageByExternalId` → evento `message_updated`
- **Status (sent/delivered/read):** `messages.update` → webhook `message-status` → `updateMessageByExternalId` → evento `message_updated`

---

## 2. Resumo do Fluxo de Envio

### 2.1 Diagrama Sequencial (Saída)

```
┌──────────────┐     ┌─────────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend    │────▶│ Backend (Nest)       │────▶│ whatsapp-service │────▶│ Baileys (sock)   │────▶│  WhatsApp   │
│  POST /api/  │     │ ConversationsService │     │ POST /send-*     │     │ sock.sendMessage │     │  Servidor   │
│  messages    │     │ sendMessage()        │     │                  │     │                  │     │             │
└──────────────┘     └─────────────────────┘     └──────────────────┘     └──────────────────┘     └─────────────┘
```

### 2.2 Etapas Detalhadas (Envio)

| # | Camada | Arquivo | Função | Descrição |
|---|--------|---------|--------|-----------|
| 1 | **Frontend** | - | `POST /api/conversations/:id/messages` | Body: `content`, `content_type`, `media_url`, `quoted_message_id` |
| 2 | **Controller** | `conversations.controller.ts` | `sendMessage()` | Valida e chama service |
| 3 | **Service** | `conversations.service.ts` | `sendMessage()` | Busca conversation, inbox, contact |
| 4 | **Storage** | `message-storage.service.ts` | `saveMessage()` | Salva mensagem com status `sent` (sem external_id ainda) |
| 5 | **Gateway** | `whatsapp.gateway.ts` | `notifyNewMessage()` | Emite `new_message` imediatamente (otimistic UI) |
| 6 | **Cache** | `conversations.service.ts` | `updateConversationCache()` | Atualiza em background (não bloqueia) |
| 7 | **Dispatch** | `conversations.service.ts` | `dispatchToChannel()` | Chamado em background via `.then()` |
| 8 | **WhatsApp Service** | `whatsapp.service.ts` | `sendTextMessage()` ou `sendMediaMessage()` | Se `WHATSAPP_SERVICE_URL`: POST externo; senão: sock local |
| 9 | **HTTP** | `whatsapp-service/index.ts` | `POST /send-message` ou `/send-media` | Recebe e chama `baileys.sendMessage()` |
| 10 | **Baileys** | `baileys.service.ts` | `sendMessage()` ou `sendMediaMessage()` | `sock.sendMessage(jid, payload)` |
| 11 | **Callback** | `conversations.service.ts` | `.then(externalId => ...)` | Atualiza mensagem com `external_id`, emite `message_updated` |

### 2.3 Modo Externo (Vercel + VPS)

Quando `WHATSAPP_SERVICE_URL` está definido:
- Backend (Vercel) não roda Baileys localmente
- `WhatsappService.callExternalService()` faz POST para o whatsapp-service (VPS)
- Socket.io: Backend chama `emitViaExternalService()` → POST `/emit-event` no whatsapp-service → este emite para clientes

---

## 3. Pontos de Latência e Gargalos

### 3.1 Recebimento – Gargalos Identificados

| Gargalo | Local | Impacto | Tipo |
|---------|-------|---------|------|
| **Download de mídia síncrono** | `baileys.service.ts` L327-342 | Alto – cada mensagem com mídia bloqueia o loop até o download | Síncrono |
| **Webhook síncrono** | `baileys.service.ts` L347 | Alto – `await forwardToBackend()` bloqueia até o backend responder | Síncrono |
| **Múltiplas queries DB** | `webhooks.service.ts` | Médio – `findUnique`, `findMany`, `findFirst` em sequência | Síncrono |
| **Lookup de contact/conversation** | `webhooks.service.ts` L369-439 | Médio – até 6+ queries para resolver contact e conversation | Síncrono |
| **Save + Cache sequenciais** | `webhooks.service.ts` L541-548 | Baixo – `saveMessage` + `updateConversationCache` em sequência | Síncrono |
| **Retorno HTTP antes de emitir** | `baileys.service.ts` L347-374 | - | O backend retorna `events` e o whatsapp-service emite; se backend demorar, emissão atrasa |

### 3.2 Envio – Gargalos Identificados

| Gargalo | Local | Impacto | Tipo |
|---------|-------|---------|------|
| **Resposta ao usuário** | `conversations.service.ts` | Baixo – mensagem é salva e emitida antes do envio ao canal | Já otimizado |
| **HTTP para whatsapp-service** | `whatsapp.service.ts` | Médio – latência de rede (Vercel ↔ VPS) | Rede |
| **Envio Baileys** | `baileys.service.ts` | Baixo – `sock.sendMessage` é rápido | - |
| **Atualização external_id** | `conversations.service.ts` L375-377 | Baixo – em background após envio | Assíncrono |

### 3.3 Estimativa de Latência (Recebimento – Mensagem de Texto)

| Etapa | Tempo estimado |
|-------|----------------|
| Baileys → processamento local | ~5-20 ms |
| forwardToBackend (HTTP) | 50-200 ms (rede) |
| processWhatsappServiceMessage (DB + lógica) | 100-400 ms |
| saveMessage + updateConversationCache | 20-80 ms |
| Retorno HTTP + emissão Socket.io | 10-50 ms |
| **Total (texto)** | **~200-750 ms** |

Para **mensagem com mídia**: +500 ms a 3 s (download no Baileys).

---

## 4. Comparação com Plataformas CRM Líderes

### 4.1 Zendesk

| Aspecto | Zendesk | WizzaChat Atual |
|---------|---------|-----------------|
| **Real-time** | Streaming API WebSocket (`wss://rtm.zopim.com/stream`) | Socket.io via whatsapp-service |
| **Eventos** | Webhooks + event connector | Webhooks HTTP + Socket.io |
| **Escalabilidade** | 1000 conexões/account, 10/agent | Sem limite explícito |
| **Latência** | Conexão persistente, eventos push | HTTP request/response para cada mensagem |

### 4.2 Intercom

| Aspecto | Intercom | WizzaChat Atual |
|---------|----------|-----------------|
| **Webhooks** | 150.000 eventos/min, resposta &lt;500 ms | Sem rate limit explícito |
| **Retry** | Retry + queue em interrupções | Retry 3x em 502/503 |
| **Deduplicação** | Verificação de acknowledgment | `getMessageByExternalId` evita duplicatas |

### 4.3 WhatsApp Business API (Meta)

| Aspecto | Meta Cloud API | WizzaChat (Baileys) |
|---------|----------------|---------------------|
| **Throughput** | 80 msg/s (até 400 com aprovação) | Limitado pelo Baileys e pela infra |
| **Webhooks** | Eventos push (message, status, etc.) | Polling implícito via Baileys + forward HTTP |
| **Mídia** | URL ou upload separado | Download síncrono no recebimento |

### 4.4 Padrões Comuns nas Melhores Plataformas

1. **Event-driven:** Webhooks/WebSockets para push, não polling
2. **Processamento assíncrono:** Filas (SQS, Bull, RabbitMQ) para tarefas pesadas
3. **Mídia em background:** Upload/download assíncrono, URL temporária
4. **Conexão persistente:** WebSocket para real-time, sem HTTP por evento
5. **Deduplicação:** Idempotency keys, external_id
6. **Cache:** Redis para contact/conversation lookup

---

## 5. Plano de Implementação para Otimização

### 5.1 Objetivo

Reduzir latência de **~200-750 ms (texto)** e **+500 ms a 3 s (mídia)** para algo próximo de **&lt;100 ms (texto)** e **&lt;300 ms (mídia)** na percepção do usuário, alinhado a plataformas como Zendesk e Intercom.

---

### Fase 1: Quick Wins (1-2 semanas)

#### 1.1 Emitir Mensagem Imediatamente (Recebimento)

**Problema:** O backend só retorna `events` após processar tudo. O frontend só recebe quando o HTTP termina.

**Solução:** No `baileys.service.ts`, emitir um evento "mensagem recebida" assim que a mensagem chegar, antes do `forwardToBackend`. O backend continua processando e emite um evento "mensagem confirmada" com dados completos (conversation_id, etc.). O frontend pode mostrar a mensagem em estado "pendente" e atualizar quando confirmada.

**Arquivos:** `baileys.service.ts`, `webhooks.service.ts`, frontend

**Impacto:** Redução perceptível de latência para o usuário (mensagem aparece em &lt;50 ms).

---

#### 1.2 Mídia em Background (Fire-and-Forget)

**Problema:** `downloadMediaMessage` bloqueia o loop. Mensagens com mídia atrasam todas as demais.

**Solução:**
- Para mensagens com mídia: enviar ao backend **sem** o base64 imediatamente (contentType, key, etc.).
- Backend salva mensagem com `media_url: null` ou placeholder.
- Emitir evento `new_message` imediatamente.
- Em background (worker ou IIFE): baixar mídia, fazer upload para storage (S3/Supabase), atualizar mensagem com `media_url` e emitir `message_updated`.

**Arquivos:** `baileys.service.ts`, `webhooks.service.ts`, possível job/worker

**Impacto:** Mensagens de texto não são bloqueadas por mídia. Latência de texto cai significativamente.

---

#### 1.3 Paralelizar Queries no Webhook

**Problema:** Várias queries Prisma em sequência (`findUnique`, `findMany`, `findFirst`).

**Solução:** Usar `Promise.all` onde possível:
- `getMessageByExternalId` + `findMany` de contacts em paralelo (já feito em parte).
- Reduzir `findFirst` de conversation com índices e queries mais diretas.

**Arquivos:** `webhooks.service.ts`

**Impacto:** Redução de 100-200 ms no processamento do webhook.

---

### Fase 2: Arquitetura Event-Driven (2-4 semanas)

#### 2.1 Fila de Mensagens (Bull/BullMQ ou SQS)

**Problema:** Toda a cadeia é síncrona. Um gargalo afeta tudo.

**Solução:**
1. Baileys recebe mensagem → publica em fila (ex: `incoming-messages`) com payload mínimo.
2. Worker consome da fila: processa, salva, emite eventos.
3. Webhook HTTP retorna 202 Accepted imediatamente após enfileirar.

**Benefícios:** Backend não bloqueia o Baileys. Escalabilidade horizontal. Retry automático.

**Arquivos:** Novo módulo `queue`, `baileys.service.ts`, `webhooks.service.ts`

---

#### 2.2 Cache de Contact/Conversation (Redis)

**Problema:** Lookup de contact e conversation a cada mensagem.

**Solução:**
- Cache em Redis: `contact:org:phone` → contactId, `conversation:org:contact:inbox` → conversationId.
- TTL curto (ex: 5 min). Invalidação ao criar/atualizar contact ou conversation.
- Fallback para DB se cache miss.

**Arquivos:** Novo `CacheService`, `webhooks.service.ts`

**Impacto:** Redução de 50-150 ms em cenários de cache hit.

---

#### 2.3 WebSocket Direto Backend ↔ Frontend (Opcional)

**Problema:** Com `WHATSAPP_SERVICE_URL`, o backend chama `POST /emit-event` no whatsapp-service para emitir. Isso adiciona um hop HTTP.

**Solução:** Se o backend tiver Socket.io próprio (em deploy não-serverless), emitir diretamente. Se não, manter o fluxo atual mas garantir que o whatsapp-service tenha baixa latência para `/emit-event`.

**Arquivos:** `whatsapp.gateway.ts`, infra

---

### Fase 3: Otimizações Avançadas (4-8 semanas)

#### 3.1 Upload de Mídia para URL (Supabase Storage / S3)

**Problema:** Mídia em base64 no payload aumenta tamanho e latência.

**Solução:**
- Baileys faz download → upload para Supabase Storage/S3 → obtém URL.
- Envia apenas a URL no webhook.
- Backend salva `media_url` diretamente.

**Arquivos:** `baileys.service.ts`, config storage

---

#### 3.2 Índices e Otimização de Queries

- Índice em `conversations(organization_id, inbox_id, metadata->>'remoteJid')` para lookup por remoteJid.
- Índice em `messages(external_id, conversation_id)` para `getMessageByExternalId`.
- Revisar N+1 em includes do Prisma.

---

#### 3.3 Métricas e Observabilidade

- Logs estruturados com `messageId`, `instanceId`, timestamps.
- Métricas: tempo de processamento por etapa (Baileys → Backend → DB → Emit).
- Alertas para latência &gt; 1 s ou falhas de webhook.

---

### 5.2 Priorização Sugerida

| Prioridade | Item | Esforço | Impacto |
|------------|------|---------|---------|
| P0 | 1.2 Mídia em background | Médio | Alto |
| P0 | 1.1 Emitir mensagem imediatamente | Baixo | Alto |
| P1 | 1.3 Paralelizar queries | Baixo | Médio |
| P1 | 2.1 Fila de mensagens | Alto | Alto |
| P2 | 2.2 Cache Redis | Médio | Médio |
| P2 | 3.1 Upload mídia para URL | Médio | Médio |
| P3 | 2.3 WebSocket direto | Baixo | Baixo |
| P3 | 3.2 Índices DB | Baixo | Médio |
| P3 | 3.3 Métricas | Médio | Operacional |

---

### 5.3 Resultado Esperado

| Métrica | Atual | Meta (Fase 1) | Meta (Fase 2) |
|---------|-------|---------------|---------------|
| Latência percebida (texto) | 200-750 ms | &lt;100 ms | &lt;50 ms |
| Latência percebida (mídia) | +500 ms a 3 s | &lt;300 ms (placeholder) | &lt;200 ms |
| Throughput | Limitado | +50% | +200% |
| Resiliência | Retry 3x | Fila + retry | Fila + retry + dead-letter |

---

## Referências

- [Zendesk Streaming API](https://developer.zendesk.com/api-reference/live-chat/real-time-chat-api/streaming)
- [Intercom Webhooks](https://developers.intercom.com/docs/webhooks/webhook-notifications)
- [WhatsApp Business API Best Practices](https://www.twilio.com/docs/whatsapp/best-practices-and-faqs)
- [Building Real-Time Applications with WebSockets](https://zeonedge.com/en/blog/building-real-time-applications-websockets-2026-architecture-scaling)
