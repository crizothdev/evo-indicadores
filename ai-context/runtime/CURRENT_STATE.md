# CURRENT_STATE.md — Estado Atual do Projeto

> Snapshot do que está implementado, em andamento e bloqueado.

---

## Concluído

- [x] Setup Vite + React 19 + TypeScript
- [x] Tailwind CSS v4 + shadcn/ui (18 componentes)
- [x] Recharts integrado (BarChart, AreaChart, PieChart, LineChart)
- [x] React Router v7 com 13 rotas
- [x] Sistema de roles (admin, franchise, operacional, expansao)
- [x] ProtectedRoute com verificação de permissão por role
- [x] Sidebar colapsável com filtro por permissões
- [x] AuthContext com Firebase Auth + fallback mock
- [x] TanStack Query (QueryClientProvider)
- [x] Serviços Firebase: authService, firestoreService, csvParser
- [x] Hooks React Query: useUnits, useNotices, useUsers, useTop5, useFollowUps, useAppointments, useCSVImport
- [x] Componentes compartilhados: StatCard, StatusBadge, SituationScale, PageHeader
- [x] 13 telas implementadas com dados mock
- [x] Tela de Login (Firebase Auth + mock fallback)
- [x] Dashboard Admin com gráficos, rankings, tabela
- [x] Dashboard Franquia com comparativos, avisos, destaques
- [x] Tela de Unidades com tabela, filtros, paginação
- [x] Detalhe da Unidade com score de saúde, CS timeline
- [x] Importação CSV com upload, paste, preview
- [x] Gestão de Usuários com tabela de roles
- [x] Avisos com lista + banner expandido
- [x] TOP5 com ranking, auditoria, histórico
- [x] Acompanhamento com métricas, prioridades
- [x] Configurações com seções parametrizáveis
- [x] Relatórios com cards de exportação
- [x] Agenda com calendário, compromissos, solicitação
- [x] Documentação: README.md, CONVENTIONS.md, DEPLOY.md
- [x] ai-context/ com 15 arquivos de documentação contextual
- [x] Build funcional (tsc + vite build sem erros)
- [x] Design tokens no index.css (cores situacionais, light/dark)
- [x] .env.example + .env para Firebase
- [x] TCE CSV simplificado: aceita apenas nomes de unidade (um por linha)
- [x] Campo de data obrigatório na importação de TCE (dd/mm/aaaa)
- [x] Comparação automática com último registro no banco (ganhou/perdeu cliente)
- [x] Mock data: 10 franquias CSV, 50 TCEs CSV, treinamentos CSV em `mock-data/`
- [x] Arquivos de dados mock criados: `mock-data/franquias.csv`, `tces.csv`, `presenca-treinamentos.csv`

## Em Andamento

- *(none)*

## Pendente

- **Testar importação CSV** — importar `mock-data/franquias.csv`, `tces.csv`, `presenca-treinamentos.csv` e validar fluxo completo

## Bloqueado

- *(none)*
