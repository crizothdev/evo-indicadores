# DECISIONS.md — Decisões Arquiteturais

> Registro de decisões técnicas, escolhas arquiteturais, limitações e padrões definidos.

---

## Aprovadas

### 2026-05-24 — shadcn/ui como base de componentes
**Decisão:** Usar shadcn/ui (18 componentes) em vez de biblioteca de componentes pronta (MUI, Ant Design).
**Racional:** Controle total sobre o código, customização via Tailwind, sem lock-in, copia source para o projeto.
**Arquivos:** `src/components/ui/`, `components.json`

### 2026-05-24 — Firebase Auth + Firestore com fallback mock
**Decisão:** AuthContext detecta se `.env` tem chaves Firebase. Se sim, usa Firebase real. Se não, usa mock users.
**Racional:** Permite desenvolvimento offline sem configurar Firebase, transição suave para produção.
**Arquivos:** `src/contexts/AuthContext.tsx`, `src/services/authService.ts`

### 2026-05-24 — Recharts para gráficos
**Decisão:** Usar Recharts em vez de Chart.js, Nivo, ou D3 puro.
**Racional:** API declarativa React, suporte nativo a ResponsiveContainer, boa variedade de gráficos, comunidade ativa.
**Arquivos:** `src/pages/DashboardPage.tsx`, `src/pages/FranquiaDashboardPage.tsx`

### 2026-05-24 — TanStack Query para estado remoto
**Decisão:** Usar React Query (TanStack Query v5) para cache, fetch e mutations do Firestore.
**Racional:** Cache inteligente, invalidação automática, retry, stale-while-revalidate, devtools.
**Arquivos:** `src/hooks/`, `src/App.tsx` (QueryClientProvider)

### 2026-05-24 — 4 roles com permissões granulares
**Decisão:** Roles: admin (total), franchise (própria unidade), operacional (inserção + visualização, sem config), expansao (só visualização, sem config).
**Racional:** Separa funções operacionais de estratégicas, evita exposição indevida de dados entre franquias.
**Arquivos:** `src/lib/roles.ts`, `src/App.tsx` (ProtectedRoute)

### 2026-05-24 — Estrutura pages/ em vez de features/
**Decisão:** Telas em `src/pages/` (flat), componentes compartilhados em `src/components/shared/`.
**Racional:** Projeto com 13 telas, sem complexidade que justifique estrutura feature-based. Simplicidade acima de tudo.
**Arquivos:** `src/pages/`, `src/components/shared/`

### 2026-06-10 — Cálculos em tempo de exibição (não salvos)
**Decisão:** Nenhum cálculo (crescimento, engajamento, status) é salvo como verdade absoluta no Firestore. O `growth` salvo durante a importação de CSV é apenas um snapshot. O frontend recalcula tudo ao exibir:
- **Crescimento** (`dataService.ts`): TCE mais recente − TCE do último dia do mês anterior, buscado do `tce_history`
- **Engajamento** (páginas de dashboard): % de presença em treinamentos, calculado do `training_presence`
- **Status** (`calcStatus`): derivado do crescimento no momento da exibição
**Racional:** Dados brutos são a fonte da verdade; cálculos mudam com a lógica de negócio sem necessidade de migração de dados.
**Arquivos:** `src/services/dataService.ts`, `src/services/firestoreService.ts`

### 2026-05-24 — CSV parser no frontend
**Decisão:** Parser de CSV implementado no frontend (sem cloud function).
**Racional:** MVP simples, sem custo extra de Firebase Functions, processamento leve de CSV.
**Arquivos:** `src/services/csvParser.ts`, `src/hooks/useCSVImport.ts`

### 2026-05-24 — Sidebar colapsável com permissões
**Decisão:** Sidebar filtra itens de navegação conforme role do usuário, com toggle colapsar/expandir.
**Racional:** Evita mostrar links que o usuário não pode acessar, reduz poluição visual para roles limitados.
**Arquivos:** `src/components/layout/Sidebar.tsx`, `src/lib/roles.ts`

## Limitações Conhecidas

- Firebase usa fallback mock no modo dev; para produção é necessário configurar `.env` com chaves reais
- Dados dos gráficos são mock (substituir por dados dos hooks React Query)
- CSV parser não valida formato de data nem trata encoding
- Sem testes automatizados
- Sem i18n/l10n (apenas PT-BR)
- Chunk size > 500KB no build (Recharts + Firebase + shadcn)
