# Wizza.Chat - Arquitetura e Guia de Deploy

## 🏗️ Arquitetura do Sistema

A plataforma **Wizza.Chat** foi projetada para ser escalável, segura e multi-tenant.

### Componentes:
1.  **Frontend (Next.js 14+)**: Interface do usuário SPA, utilizando Tailwind CSS e ShadCN UI. Comunica-se com o backend via REST e WebSockets.
2.  **Backend (NestJS)**: API principal que gerencia a lógica de negócio, autenticação (Supabase Auth), RBAC e persistência de dados (Prisma + Supabase Postgres).
3.  **WhatsApp Service (Baileys Service)**: Microserviço isolado para gerenciar as instâncias do WhatsApp via biblioteca Baileys. Isso permite que o backend principal seja serverless (Vercel) enquanto o serviço de socket mantém conexões persistentes.
4.  **Banco de Dados (Supabase)**: Banco de dados gerenciado com suporte a Row Level Security (RLS) para isolamento total de empresas.
5.  **Billing (Stripe)**: Integração para gestão de planos e assinaturas SaaS.

### Fluxo de Dados:
- Mensagem Pendente → WhatsApp Service → Baileys → Webhook Backend → Socket.io Frontend.

---

## 🚀 Guia de Deploy

### 1. Supabase Setup
- Crie um novo projeto no Supabase.
- Execute o script `supabase_rls.sql` no SQL Editor do Supabase para configurar as políticas de segurança.
- Obtenha as chaves `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `DATABASE_URL`.

### 2. Backend (NestJS)
- Suba o código para um repositório Git.
- No painel da **Vercel**, conecte o repositório e selecione a pasta `backend`.
- Adicione as variáveis de ambiente:
    - `DATABASE_URL`
    - `SUPABASE_URL`
    - `SUPABASE_JWT_SECRET`
    - `JWT_SECRET`
- Execute: `npx prisma generate` e `npx prisma db push`.
- Adicione o script de seed: `npm run seed`.

### 3. Frontend (Next.js)
- Suba para a **Vercel**.
- Configure as variáveis:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `NEXT_PUBLIC_API_URL`
    - `NEXT_PUBLIC_WS_URL`

### 4. WhatsApp Service (Baileys)
- Este serviço deve ser hospedado em um ambiente que suporte processos de longa duração (VPS, Render, Railway, DigitalOcean). **Não pode ser serverless**.
- Instale as dependências: `npm install`.
- Configure as variáveis no `.env`.
- Inicie: `npm run start:prod`.

---

## 🔐 RBAC - Papéis e Permissões
- `super_admin`: Gestão da plataforma e planos.
- `org_admin`: Gestão da empresa, pagamentos e usuários.
- `manager`: Gestão de filas e relatórios.
- `agent`: Atendimento ao cliente.
- `viewer`: Acompanhamento sem permissão de escrita.

## 💳 Faturamento (Billing)
- O sistema utiliza **Stripe Webhooks** para gerenciar o status da assinatura em tempo real.
- As permissões são bloqueadas automaticamente se o status da assinatura for `past_due` ou `canceled`.
