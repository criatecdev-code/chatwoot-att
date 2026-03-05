# Criatech - Acesso Ilimitado ao Sistema

## Empresa Proprietária do Sistema

A **Criatech** é a empresa dona e desenvolvedora do sistema de atendimento. Por isso, possui **acesso ilimitado e irrestrito** a todas as funcionalidades.

## Usuário Superadmin

- **Nome**: Max
- **Empresa**: Criatech
- **Permissão**: Superadmin (`is_superadmin: true`)

## Privilégios Ilimitados

### 1. Conexões
- ✅ **Ilimitadas** de qualquer tipo
- ✅ Sem restrições de plano
- ✅ Todos os canais disponíveis:
  - WhatsApp Web (Baileys)
  - WhatsApp Business (Meta API)
  - Instagram Direct
  - Telegram Bot
  - Facebook Messenger
  - Website Live Chat

### 2. Usuários
- ✅ **Ilimitados** membros da equipe
- ✅ Sem restrições de funções
- ✅ Criação livre de admins e agentes

### 3. Conversas
- ✅ **Ilimitadas** conversas simultâneas
- ✅ Sem restrições de volume
- ✅ Histórico completo sem limites

### 4. Recursos Premium
- ✅ Todas as funcionalidades desbloqueadas
- ✅ Sem necessidade de upgrade
- ✅ Acesso a features beta/experimentais

### 5. API e Integrações
- ✅ Rate limits removidos
- ✅ Webhooks ilimitados
- ✅ API keys ilimitadas

### 6. Armazenamento
- ✅ Espaço ilimitado para mídias
- ✅ Backup completo
- ✅ Retenção infinita de dados

## Identificação no Sistema

A Criatech é identificada por:
- Nome da organização: `"Criatech"` (case-insensitive)
- Slug da organização: `"criatech"` (case-insensitive)
- Usuário com flag: `is_superadmin: true`

## Badge Especial

No sistema, a Criatech exibe um badge dourado especial:
```
👑 Criatech - Acesso Ilimitado ∞
```

## Implementação Técnica

### Frontend
```typescript
// Verificação se é Criatech
const isCriatech = currentOrganization?.name?.toLowerCase() === 'criatech' || 
                   currentOrganization?.slug?.toLowerCase() === 'criatech' ||
                   user?.is_superadmin === true;

// Limites sempre retornam infinito
const getLimit = (type: string) => {
    if (isCriatech) return 999; // Ilimitado
    return PLAN_LIMITS[currentPlan][type] || 0;
};

// Sempre pode adicionar mais
const canAddMore = (type: string) => {
    if (isCriatech) return true; // Sempre pode
    return getConnectionCount(type) < getLimit(type);
};
```

### Backend
```typescript
// Guards e middlewares devem verificar:
if (user.is_superadmin || organization.slug === 'criatech') {
    // Bypass de todas as restrições
    return true;
}
```

## Regras Importantes

1. **Nunca** aplicar limites à Criatech
2. **Sempre** permitir todas as ações
3. **Não** cobrar ou restringir features
4. **Exibir** badge especial de identificação
5. **Garantir** acesso total ao sistema

## Notas de Desenvolvimento

Ao implementar novas features com limites/restrições:
- ✅ Sempre adicionar verificação `isCriatech`
- ✅ Sempre bypassar limites para Criatech
- ✅ Documentar exceções no código
- ✅ Testar com usuário Max/Criatech

---

**Última atualização**: 2026-01-24
**Responsável**: Sistema de Gerenciamento
