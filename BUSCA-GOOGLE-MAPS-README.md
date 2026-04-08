# Busca pela API do Google Maps — Descrição do Funcionamento

## Visão Geral

O módulo de **Prospecção B2B** utiliza a API do Google Maps (Places API) para buscar estabelecimentos comerciais por **nicho** (tipo de negócio) e **localização** (cidade ou região). Os resultados são exibidos como leads com dados de contato (nome, endereço, telefone, site) e podem ser salvos diretamente no CRM.

---

## Fluxo da Busca

```
┌─────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────┐
│  Frontend       │────▶│  API Backend                 │────▶│  Google Maps API   │
│  (Leads Page)   │     │  GET /leads/search           │     │  (Places / Text    │
│                 │     │  ?query=...&location=...     │     │   Search)          │
└─────────────────┘     └──────────────────────────────┘     └─────────────────────┘
         │                              │                              │
         │  1. Usuário preenche         │  2. Backend consulta         │  3. Retorna lista de
         │     query + location         │     Places API                │     estabelecimentos
         │                              │                              │
         ▼                              ▼                              ▼
┌─────────────────┐     ┌──────────────────────────────┐     ┌─────────────────────┐
│  Exibe resultados│◀────│  Processa e enriquece dados  │◀────│  place_id, name,    │
│  (cards de lead)│     │  (telefone, website, etc.)   │     │  address, phone...  │
└─────────────────┘     └──────────────────────────────┘     └─────────────────────┘
```

---

## 1. Frontend — Tela de Prospecção B2B

**Localização:** `frontend/src/app/(dashboard)/leads/page.tsx`

### 1.1 Formulário de Busca

O usuário informa dois campos obrigatórios:

| Campo      | Descrição                                      | Exemplo                    |
|-----------|-------------------------------------------------|----------------------------|
| **Query** | Nicho ou tipo de negócio                        | `Pizzaria`, `Clínica`, `Oficina` |
| **Location** | Cidade ou região para busca                  | `São Paulo`, `Campinas`     |

### 1.2 Chamada à API

```typescript
GET ${process.env.NEXT_PUBLIC_API_URL}/leads/search?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}
```

**Headers:**
- `Authorization: Bearer <token>`
- `x-organization-id: <organizationId>`

### 1.3 Tratamento da Resposta

- **Sucesso:** `setResults(data)` — exibe os leads em cards
- **Sem resultados:** `showAlert('Busca concluída', 'Nenhum estabelecimento foi encontrado...')`
- **Sem telefone:** `showAlert('Atenção', 'Encontramos X estabelecimentos, mas nenhum possui telefone visível.')`
- **Erro:** `showError('Erro na busca', data.message)`

---

## 2. Estrutura de Dados do Lead

**Interface:** `frontend/src/components/prospeccao/Results.tsx`

```typescript
interface Lead {
    place_id: string;   // ID único do Google Places
    name: string;       // Nome do estabelecimento
    address?: string;   // Endereço completo
    phone?: string;     // Telefone (pode ser vazio)
    website?: string;   // Site do negócio
}
```

- **`place_id`** — Identificador do Google Places API; usado como chave única e para salvar no CRM
- **`phone`** — Nem todos os estabelecimentos retornam telefone; leads sem telefone não podem abrir WhatsApp

---

## 3. Ações do Usuário

### 3.1 Salvar Lead Individual

- Botão **"Salvar no CRM"** em cada card
- **Endpoint:** `POST /contacts`
- **Body:** `{ name, phone, email: null, address, website }`
- O telefone é normalizado (apenas dígitos) antes do envio

### 3.2 Salvar Todos os Leads

- Botão **"Importar em massa"** no header
- Confirmação via modal
- Loop salvando cada lead sequencialmente em `/contacts`

### 3.3 Abrir WhatsApp

- Botão **WhatsApp** (ícone) quando o lead possui telefone
- Abre `https://wa.me/${phone}` em nova aba

---

## 4. Backend (API / Google Maps)

**Nota:** O backend completo do endpoint `/leads/search` não está no repositório atual. O histórico de commits indica:

- **Integração com Google Maps API** — busca de estabelecimentos
- **Possível uso de:** Places API (Text Search ou Nearby Search) para localizar negócios por tipo e região
- **Enriquecimento:** Extração de telefone e website (Place Details ou scraping de dados públicos)

### 4.1 Contrato Esperado da API

| Parâmetro | Tipo   | Descrição                          |
|-----------|--------|------------------------------------|
| `query`   | string | Nicho/tipo de negócio              |
| `location`| string | Cidade ou região                   |

**Resposta:** Array de objetos `Lead` (place_id, name, address, phone, website)

---

## 5. Controle de Acesso

- **Requisito:** `currentOrganization?.plan?.has_leads === true` ou `currentOrganization?.slug === 'criatech'`
- **Sem acesso:** Exibe tela de bloqueio com CTA para upgrade em `/settings/billing`

---

## 6. Componentes Relacionados

| Componente          | Arquivo                          | Função                          |
|---------------------|----------------------------------|---------------------------------|
| **Header**          | `components/prospeccao/Header.tsx` | Título, contador de leads, botão importar em massa |
| **SearchForm**      | `components/prospeccao/SearchForm.tsx` | Formulário com query, location e botão buscar |
| **Results**         | `components/prospeccao/Results.tsx` | Grid de cards de leads         |
| **EmptyState**      | `components/prospeccao/EmptyState.tsx` | Estado vazio antes da primeira busca |
| **LoadingState**    | `components/prospeccao/LoadingState.tsx` | Estado de carregamento durante a busca |

---

## 7. Resumo do Fluxo de Dados

1. Usuário preenche **nicho** (ex: Pizzaria) e **localização** (ex: São Paulo)
2. Frontend envia `GET /leads/search?query=Pizzaria&location=São Paulo`
3. Backend consulta Google Maps (Places API) e retorna lista de estabelecimentos
4. Frontend exibe cards com nome, endereço, telefone e site
5. Usuário pode salvar leads no CRM ou abrir WhatsApp diretamente

---

## 8. Referências

- **Google Places API:** https://developers.google.com/maps/documentation/places/web-service
- **Text Search:** Busca por texto (ex: "pizzaria em São Paulo")
- **Place Details:** Dados adicionais (telefone, website) por `place_id`
