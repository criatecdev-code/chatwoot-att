# 🤖 Módulo de Inteligência Artificial - Chatwoot

## Visão Geral

O módulo de IA do Chatwoot permite automatizar o atendimento ao cliente usando diversos provedores de inteligência artificial. O sistema é capaz de:

- **Responder automaticamente** mensagens dos clientes
- **Analisar intenções** para entender o que o cliente precisa
- **Rotear conversas** para as filas corretas automaticamente
- **Aprender com conversas anteriores** através do sistema de treinamento
- **Suportar múltiplos provedores** de IA (OpenAI, Anthropic, Google, Groq, etc.)
- **Usar ferramentas especializadas** para buscar informações e executar ações

## 🎯 Funcionalidades

### 1. Configuração de IA

Crie múltiplas configurações de IA para diferentes cenários:

- **Auto-Resposta**: A IA responde automaticamente às mensagens
- **Roteamento Inteligente**: Direciona conversas para a fila/equipe correta
- **Análise de Intenção**: Identifica o que o cliente quer (reclamação, dúvida, elogio, etc.)
- **Horário de Funcionamento**: Configure quando a IA deve atuar
- **Fallback para Humano**: Transfere para atendente humano quando a confiança é baixa
- **Ferramentas de IA**: Configure quais ferramentas a IA pode usar

### 2. Provedores Suportados

#### OpenAI
- **Modelos**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o, GPT-4o Mini
- **Requer**: API Key
- **Site**: https://platform.openai.com

#### Anthropic (Claude)
- **Modelos**: Claude 3 Opus, Sonnet, Haiku, Claude 3.5 Sonnet
- **Requer**: API Key
- **Site**: https://console.anthropic.com

#### Google AI (Gemini)
- **Modelos**: Gemini Pro, Gemini 1.5 Pro, Gemini 1.5 Flash
- **Requer**: API Key
- **Site**: https://makersuite.google.com

#### Groq
- **Modelos**: Llama 3.1 70B/8B, Mixtral 8x7B, Gemma 7B
- **Requer**: API Key
- **Site**: https://console.groq.com

#### Cohere
- **Modelos**: Command, Command Light, Command R, Command R Plus
- **Requer**: API Key
- **Site**: https://dashboard.cohere.com

#### Mistral AI
- **Modelos**: Mistral Large/Medium/Small, Mixtral 8x7B
- **Requer**: API Key
- **Site**: https://console.mistral.ai

#### Perplexity
- **Modelos**: PPLX 70B Online, PPLX 7B/70B Chat
- **Requer**: API Key
- **Site**: https://www.perplexity.ai

#### Ollama (Local)
- **Modelos**: Llama2, Mistral, CodeLlama, Neural Chat
- **Requer**: Endpoint local
- **Site**: https://ollama.ai

### 3. Ferramentas de IA 🔧

A IA pode usar ferramentas especializadas para buscar informações e executar ações. Configure quais ferramentas estão disponíveis para cada configuração de IA.

#### Base de Conhecimento
- **Buscar Base de Conhecimento**: Busca em artigos, FAQs e documentação
- **Buscar Documentação Técnica**: Acessa manuais e guias técnicos
- **Consultar Políticas da Empresa**: Acessa políticas de devolução, garantia, etc.
- **Buscar Conhecimento da Equipe**: Acessa notas internas e resoluções documentadas
- **Buscar por Tags**: Busca conteúdo usando sistema de tags/categorias

#### Acesso a Arquivos
- **Buscar Arquivos**: Busca e acessa arquivos armazenados (PDFs, documentos, imagens)
- **Extrair Conteúdo de Arquivo**: Extrai e processa conteúdo de arquivos

#### Busca em Conversas
- **Buscar Conversas Anteriores**: Busca em conversas passadas para encontrar contexto e resoluções similares

#### Dados da Organização
- **Obter Dados do Cliente**: Acessa informações do cliente (histórico, pedidos, preferências)
- **Consultar Informações de Produtos**: Busca detalhes sobre produtos/serviços
- **Verificar Status de Pedido**: Consulta status e detalhes de pedidos

#### Integrações de API
- **Chamar API Externa**: Integra com APIs externas configuradas (CRM, ERP, etc.)

## 📋 Como Usar

### Passo 1: Criar uma Configuração de IA

1. Acesse **IA** no menu do dashboard
2. Clique em **"Nova Configuração de IA"**
3. Preencha os dados:
   - **Nome**: Ex: "Atendimento Geral"
   - **Provedor**: Escolha o provedor de IA
   - **Modelo**: Selecione o modelo específico
   - **API Key**: Cole sua chave de API
   - **Prompt do Sistema**: Instruções para a IA

4. Configure os parâmetros:
   - **Temperatura** (0-2): Criatividade das respostas (0.7 recomendado)
   - **Max Tokens**: Tamanho máximo da resposta (1000 recomendado)
   - **Confiança**: Nível mínimo para responder automaticamente (70% recomendado)

5. Ative as funcionalidades desejadas:
   - ✅ Resposta Automática
   - ✅ Roteamento Inteligente
   - ✅ Análise de Intenção
   - ✅ Transferir para Humano em Baixa Confiança

### Passo 2: Configurar Ferramentas de IA

1. Acesse **IA > Ferramentas**
2. Selecione a configuração de IA
3. Habilite as ferramentas que a IA pode usar:
   - ✅ Buscar Base de Conhecimento
   - ✅ Buscar Conversas Anteriores
   - ✅ Obter Dados do Cliente
   - ✅ Consultar Informações de Produtos
   - E outras conforme necessário
4. Clique em **"Salvar Configuração"**

### Passo 3: Treinar a IA

1. Acesse **IA > Treinamento**
2. Selecione a configuração de IA
3. Clique em **"Iniciar Treinamento"**

A IA irá:
- Analisar todas as conversas anteriores
- Aprender com as respostas dos atendentes
- Identificar padrões de atendimento
- Melhorar as respostas futuras

### Passo 4: Monitorar o Desempenho

Acompanhe as métricas da IA:
- **Taxa de Sucesso**: Porcentagem de respostas bem-sucedidas
- **Taxa de Fallback**: Quantas vezes transferiu para humano
- **Confiança Média**: Nível médio de certeza nas respostas
- **Total de Interações**: Número de conversas atendidas

## 🔧 Configurações Avançadas

### Horário de Funcionamento

Configure quando a IA deve atuar:

```json
{
  "monday": { "enabled": true, "start": "09:00", "end": "18:00" },
  "tuesday": { "enabled": true, "start": "09:00", "end": "18:00" },
  "wednesday": { "enabled": true, "start": "09:00", "end": "18:00" },
  "thursday": { "enabled": true, "start": "09:00", "end": "18:00" },
  "friday": { "enabled": true, "start": "09:00", "end": "18:00" },
  "saturday": { "enabled": false },
  "sunday": { "enabled": false }
}
```

### Filtros de Inbox e Equipe

Restrinja a IA para atuar apenas em:
- **Inboxes específicos**: Ex: apenas WhatsApp
- **Equipes específicas**: Ex: apenas Suporte Técnico

### Prompt do Sistema

Exemplo de prompt eficaz:

```
Você é um assistente de atendimento ao cliente da empresa XYZ.

Suas responsabilidades:
1. Responder perguntas sobre produtos e serviços
2. Ajudar com problemas técnicos básicos
3. Coletar informações para o atendimento humano
4. Manter um tom profissional e amigável

Regras importantes:
- Sempre cumprimente o cliente
- Seja conciso e objetivo
- Se não souber algo, admita e ofereça transferir para um atendente
- Nunca invente informações
- Mantenha a privacidade do cliente

Ferramentas disponíveis:
- Use "Buscar Base de Conhecimento" para encontrar informações sobre produtos
- Use "Buscar Conversas Anteriores" para ver como casos similares foram resolvidos
- Use "Obter Dados do Cliente" para personalizar o atendimento

Informações da empresa:
- Horário de atendimento: Segunda a Sexta, 9h às 18h
- Telefone: (11) 1234-5678
- Email: contato@xyz.com
```

## 📊 API Endpoints

### Configuração

```typescript
// Listar configurações
GET /api/ai/config

// Criar configuração
POST /api/ai/config
Body: { name, provider, model, apiKey, enabledTools, ... }

// Atualizar configuração
PUT /api/ai/config/:id
Body: { name, temperature, enabledTools, ... }

// Deletar configuração
DELETE /api/ai/config/:id

// Ativar/Desativar
POST /api/ai/config/:id/toggle
```

### Ferramentas

```typescript
// Listar ferramentas disponíveis
GET /api/ai/tools

// Obter ferramentas de uma configuração
GET /api/ai/tools/config/:configId

// Executar uma ferramenta
POST /api/ai/tools/execute
Body: { toolId, params, configId? }
```

### Treinamento

```typescript
// Iniciar treinamento
POST /api/ai/training/:configId/start
Body: { includeConversations, includeFeedback, minRating }

// Status do treinamento
GET /api/ai/training/:configId/status

// Dados de treinamento
GET /api/ai/training/:configId/data?limit=100

// Atualizar dados
POST /api/ai/training/:configId/refresh
```

### Resposta e Análise

```typescript
// Gerar resposta
POST /api/ai/respond
Body: { conversationId, message, configId? }

// Analisar intenção
POST /api/ai/analyze-intent
Body: { message, configId? }

// Sugerir fila
POST /api/ai/suggest-queue
Body: { conversationId, configId? }
```

### Analytics

```typescript
// Métricas da IA
GET /api/ai/analytics/:configId?startDate=&endDate=
```

## 🎨 Exemplos de Uso

### Exemplo 1: Atendimento 24/7 com Ferramentas

```typescript
{
  name: "Atendimento 24/7",
  provider: "openai",
  model: "gpt-4o-mini",
  enableAutoResponse: true,
  enableQueueRouting: true,
  responseDelay: 1000,
  confidenceThreshold: 0.8,
  fallbackToHuman: true,
  enabledTools: [
    "search_knowledge_base",
    "search_conversations",
    "get_customer_data",
    "get_product_info"
  ],
  workingHours: {} // Sempre ativo
}
```

### Exemplo 2: Triagem Inicial

```typescript
{
  name: "Triagem",
  provider: "groq",
  model: "llama-3.1-70b",
  enableAutoResponse: false, // Não responde
  enableQueueRouting: true, // Apenas roteia
  enableIntentAnalysis: true,
  confidenceThreshold: 0.6,
  enabledTools: [
    "search_conversations",
    "get_customer_data"
  ]
}
```

### Exemplo 3: Suporte Técnico Especializado

```typescript
{
  name: "Suporte Técnico",
  provider: "anthropic",
  model: "claude-3-sonnet",
  enableAutoResponse: true,
  temperature: 0.3, // Mais preciso
  maxTokens: 1500,
  systemPrompt: "Você é um especialista técnico...",
  teamIds: ["tech-support-team-id"],
  enabledTools: [
    "search_documentation",
    "search_files",
    "extract_file_content",
    "search_team_knowledge"
  ]
}
```

## 🔒 Segurança

- **API Keys são criptografadas** no banco de dados
- **Acesso restrito** por organização (multi-tenant)
- **Logs de todas as interações** para auditoria
- **Rate limiting** para evitar abuso
- **Controle de ferramentas** por configuração

## 📈 Melhores Práticas

1. **Comece com temperatura baixa** (0.3-0.5) para respostas mais consistentes
2. **Use fallback para humano** quando a confiança for baixa
3. **Treine regularmente** com novas conversas
4. **Monitore as métricas** semanalmente
5. **Ajuste o prompt** baseado no feedback
6. **Teste diferentes modelos** para encontrar o melhor custo-benefício
7. **Configure horários** para economizar custos de API
8. **Habilite apenas ferramentas necessárias** para cada caso de uso
9. **Configure permissões adequadas** para acesso a dados sensíveis
10. **Documente resoluções** para melhorar a base de conhecimento

## 💡 Dicas

- **GPT-4o Mini**: Melhor custo-benefício para atendimento geral
- **Claude 3 Sonnet**: Excelente para conversas longas e complexas
- **Groq + Llama**: Muito rápido e gratuito para testes
- **Gemini 1.5 Flash**: Ótimo para análise de documentos/imagens
- **Ferramentas de Busca**: Sempre habilite "Buscar Conversas Anteriores" para contexto
- **Base de Conhecimento**: Mantenha artigos e FAQs atualizados

## 🐛 Troubleshooting

### IA não está respondendo

1. Verifique se a configuração está **ativa**
2. Confirme se está dentro do **horário de funcionamento**
3. Verifique se a **API Key** é válida
4. Confira os **logs de erro** no histórico de treinamento

### Respostas de baixa qualidade

1. **Ajuste o prompt do sistema** com mais contexto
2. **Treine com mais conversas** de qualidade
3. **Aumente a temperatura** para respostas mais criativas
4. **Teste outro modelo** mais avançado
5. **Habilite ferramentas relevantes** para acesso a informações

### Muitos fallbacks para humano

1. **Reduza o threshold de confiança** (ex: de 0.8 para 0.6)
2. **Melhore o prompt** com mais informações
3. **Treine com conversas similares**
4. **Habilite mais ferramentas** para a IA ter acesso a mais dados

### Ferramentas não funcionam

1. **Verifique se as ferramentas estão habilitadas** na configuração
2. **Configure as fontes de dados** necessárias (base de conhecimento, arquivos, etc.)
3. **Verifique permissões** de acesso aos dados
4. **Consulte os logs** de execução das ferramentas

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação completa ou entre em contato com o suporte técnico.

---

**Desenvolvido com ❤️ para automatizar e melhorar o atendimento ao cliente**
