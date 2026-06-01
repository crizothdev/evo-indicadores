# Evo Indicadores

Plataforma web de inteligência operacional e customer success para gestão de franquias e contratos de estágio (TCEs).

Centraliza informações operacionais que atualmente são controladas manualmente via planilhas, automatizando leitura, processamento, consolidação e análise de indicadores estratégicos da rede.

## Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (plugin `@tailwindcss/vite`)
- **shadcn/ui** (18 componentes)
- **Recharts** (gráficos: Bar, Area, Pie, Line)
- **React Router v7** (rotas com controle de acesso por role)
- **TanStack Query v5** (cache e sincronização de dados)
- **Firebase** (Auth + Firestore)
- **Lucide React** (ícones)

## Funcionalidades

### Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| Indicadores | Crescimento e performance da rede |
| Engajamento | Presença em treinamentos |
| Ranking | Classificação operacional das unidades |
| Customer Success | Acompanhamento estratégico |
| Comunicação | Avisos e relacionamento com franquias |
| TOP 5 | Premiação mensal com auditoria |
| Agenda | Compromissos e solicitação de agendamento |

### Perfis de Acesso

| Role | Permissões |
|------|-----------|
| **Admin** | Acesso total — todas as telas, importação, auditoria, configurações |
| **Franquia** | Dashboard próprio, avisos, ranking pessoal, solicitar agendamento |
| **Operacional** | Visualização completa + importação de dados (sem config/usuários) |
| **Expansão** | Somente visualização (sem config/importação/edição) |

## Telas

1. **Login** — Autenticação Firebase Auth
2. **Dashboard Admin** — Visão consolidada da rede com gráficos, rankings e tabela
3. **Dashboard Franquia** — Indicadores da própria unidade com comparativos
4. **Unidades** — Listagem completa com filtros, busca e ordenação
5. **Detalhe da Unidade** — Visão analítica individual com score de saúde
6. **Importação** — Upload e parse de CSV (TCEs e treinamentos)
7. **Usuários** — Gestão de acessos com roles
8. **Avisos** — Painel de comunicados com banner expandido
9. **TOP 5** — Auditoria de premiação mensal
10. **Acompanhamento** — Customer success operacional
11. **Configurações** — Parametrização de regras e indicadores
12. **Relatórios** — Exportações PDF/Excel
13. **Agenda** — Calendário de compromissos e solicitação de agendamento

## Estrutura do Projeto

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, AppLayout
│   ├── shared/          # StatCard, StatusBadge, SituationScale, PageHeader
│   └── ui/              # 18 componentes shadcn/ui
├── contexts/
│   └── AuthContext.tsx   # Autenticação (Firebase Auth + mock fallback)
├── hooks/               # React Query hooks para cada coleção
├── lib/
│   ├── firebase.ts       # Config e inicialização Firebase
│   ├── roles.ts          # Permissões por role
│   └── utils.ts          # cn() utility
├── pages/               # 13 telas do sistema
├── services/
│   ├── authService.ts    # Login/logout/onAuthChange
│   ├── firestoreService.ts # CRUD Firestore
│   └── csvParser.ts      # Parser de CSV
├── types/
│   └── index.ts          # Tipos TypeScript
├── App.tsx               # Rotas + QueryClient + AuthProvider
└── main.tsx
```

## Como Rodar

```bash
cd evo-indicadores
npm install
cp .env.example .env   # Configurar variáveis Firebase
npm run dev
```

## Build

```bash
npm run build    # Gera em dist/
npm run preview  # Preview do build
```

## Firebase

O projeto usa Firebase Auth + Firestore com fallback mock quando as credenciais `.env` não estão configuradas. Para produção, preencha as variáveis no `.env` conforme `.env.example`.
