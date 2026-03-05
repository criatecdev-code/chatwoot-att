# OmniChat - Omnichannel SaaS Platform

Plataforma SaaS omnichannel baseada no Chatwoot, com integração WhatsApp via Baileys.

## 🚀 Como Iniciar

### 1. Requisitos
- Node.js 18+
- Instância Supabase (Postgres + Auth + Storage)
- Redis (Opcional, para escala do Baileys)

### 2. Configuração do Backend (NestJS)
```bash
cd backend
npm install
npx prisma generate
# Edite o arquivo .env com suas credenciais Supabase
npm run start:dev
```

### 3. Configuração do Frontend (Next.js)
```bash
cd frontend
npm install
# Edite o arquivo .env.local
npm run dev
```

### 4. Configuração do WhatsApp Service (Baileys)
```bash
cd whatsapp-service
npm install
npm run start
```

## 🏗️ Estrutura
- `/backend`: API Principal (NestJS + Prisma) - Gerencia multi-tenancy, RBAC e lógica de negócio.
- `/frontend`: Interface do Usuário (Next.js 14 + ShadCN UI) - UI estilo Chatwoot.
- `/whatsapp-service`: Microserviço dedicado para conexões Baileys.

## 🔐 RBAC (Controle de Acesso)
O sistema suporta permissões granulares:
- `super_admin`: Acesso total ao sistema.
- `org_admin`: Gerencia a empresa e usuários.
- `agent`: Atendimento de conversas.
- `viewer`: Apenas leitura.

## 📱 WhatsApp Real-time
A conexão é feita via WebSocket. O QR Code é enviado em tempo real para o frontend assim que a sessão é iniciada no serviço dedicado.
As sessões são persistidas no Supabase Storage para evitar desconexões em restarts.
