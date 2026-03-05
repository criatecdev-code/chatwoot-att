# Credenciais de Acesso ao Sistema

## 🔐 Superadmin - Criatech

### Usuário Superadmin
- **Username**: `max`
- **Email**: `max@criatech.com`
- **Senha**: `Criatech@2024`
- **Organização**: Criatech
- **Permissões**: Acesso ilimitado a tudo

### Como Acessar

1. **Inicie o Backend** (se não estiver rodando):
   ```bash
   cd backend
   npm run start:dev
   ```
   O backend rodará em: `http://localhost:3001`

2. **Inicie o Frontend** (se não estiver rodando):
   ```bash
   cd frontend
   npm run dev
   ```
   O frontend rodará em: `http://localhost:3000`

3. **Acesse o Sistema**:
   - Landing Page: `http://localhost:3000`
   - Login: `http://localhost:3000/login`
   - Dashboard: `http://localhost:3000/dashboard`

4. **Faça Login**:
   - Username: `max`
   - Senha: `Criatech@2024`

### Privilégios do Superadmin

Como superadmin da Criatech, você tem:

✅ **Acesso Ilimitado**:
- Conexões ilimitadas (WhatsApp, Instagram, Telegram, etc.)
- Usuários ilimitados
- Conversas ilimitadas
- Sem restrições de plano

✅ **Recursos Exclusivos**:
- Menu "Planos" (gerenciar planos do sistema)
- Badge dourado "Criatech - Acesso Ilimitado ∞"
- Bypass de todos os limites

✅ **Gerenciamento Total**:
- Criar/editar/deletar planos
- Gerenciar todas as organizações
- Acesso a todas as configurações
- Visualizar todos os dados

### Outros Usuários (para testes)

Se precisar criar usuários de teste, use a página de registro ou crie via seed:

```bash
cd backend
npx prisma db seed
```

### Troubleshooting

**Erro "Failed to fetch"**:
- ✅ Verifique se o backend está rodando na porta 3001
- ✅ Verifique se o frontend está configurado para `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

**Erro de autenticação**:
- ✅ Limpe o localStorage do navegador
- ✅ Verifique se o usuário existe no banco de dados
- ✅ Rode a migration: `npx prisma migrate dev`

**Backend não inicia**:
- ✅ Instale as dependências: `npm install`
- ✅ Gere o Prisma Client: `npx prisma generate`
- ✅ Rode as migrations: `npx prisma migrate dev`

### URLs Importantes

- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Conexões**: http://localhost:3000/connections
- **Planos** (superadmin): http://localhost:3000/plans
- **API**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api-docs (se configurado)

---

**Última atualização**: 2026-01-24
**Sistema**: Criatech Customer Service Platform
