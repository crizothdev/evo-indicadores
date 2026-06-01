# INSTRUCTIONS.md — Regras de Desenvolvimento

> Convenções, padrões arquiteturais e regras obrigatórias para todo código gerado neste projeto.

---

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19, shadcn/ui |
| Build | Vite 8, TypeScript |
| Estilo | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Gráficos | Recharts |
| Roteamento | React Router v7 |
| Estado remoto | TanStack Query v5 |
| Autenticação | Firebase Auth |
| Banco | Firestore (NoSQL) |
| Ícones | Lucide React |

## Regras Obrigatórias

### 1. Importações
- Usar path alias `@/` para `src/`
- Ex: `import { StatCard } from '@/components/shared/StatCard'`
- **Nunca** usar paths relativos longos (`../../components/...`)

### 2. Componentes
- Componentes reutilizáveis em `components/shared/`
- Componentes de layout em `components/layout/`
- Componentes shadcn em `components/ui/` (nunca editar diretamente)
- Páginas em `pages/` (uma por rota, sufixo `Page`)

### 3. Serviços e Hooks
- Serviços Firebase em `services/`
- Custom hooks React Query em `hooks/`
- Cada coleção Firestore tem seu hook: `useUnits`, `useNotices`, etc.

### 4. Tipos
- Centralizados em `types/index.ts`
- Roles e permissões em `lib/roles.ts`
- Usar `import type` para imports de tipo (verbatimModuleSyntax)

### 5. Cores e Tokens
- Tokens definidos em `src/index.css` via `@theme inline`
- Cores situacionais: `--color-critica`, `--color-saudavel`, `--color-atencao`, `--color-estatica`, `--color-destaque`
- Usar classes Tailwind que referenciam os tokens CSS

### 6. Código
- **Variáveis, funções e arquivos em INGLÊS**
- **Strings de UI em PT-BR** (exibidas ao usuário)
- Componentes PascalCase, hooks camelCase com prefixo `use`
- Sem comentários desnecessários

### 7. Firebase
- Config em `lib/firebase.ts` (variáveis de ambiente `.env`)
- Serviços de auth em `services/authService.ts`
- CRUD Firestore em `services/firestoreService.ts`
- **Mock fallback** quando `.env` não tem chaves reais

### 8. Rotas e Acesso
- `ProtectedRoute` em `App.tsx` verifica auth + permissão por role
- Roles: admin, franchise, operacional, expansao
- Permissões granulares em `lib/roles.ts`

### 9. Gráficos (Recharts)
- Sempre usar `ResponsiveContainer` com width/height
- Cores dos gráficos alinhadas com tokens do projeto
- Dados mock nas páginas (substituir por dados reais dos hooks)

### 10. Proatividade
- **Nunca inicie tarefas por conta própria.** Execute apenas tarefas solicitadas explicitamente.

## Estrutura de Diretórios

```
src/
├── components/
│   ├── layout/          # Sidebar, Header, AppLayout
│   ├── shared/          # StatCard, StatusBadge, SituationScale, PageHeader
│   └── ui/              # shadcn/ui (18 componentes)
├── contexts/            # AuthContext
├── hooks/               # React Query hooks
├── lib/                 # firebase, roles, utils
├── pages/               # 13 telas
├── services/            # authService, firestoreService, csvParser
└── types/               # Tipos TypeScript
```

## Atualização Automática de Contexto

Ao finalizar alterações relevantes:

1. Atualizar `runtime/CURRENT_STATE.md`
2. Atualizar `runtime/TASKS.md`
3. Atualizar `runtime/SESSION_SUMMARY.md`
4. Atualizar `history/CHANGELOG.md`
5. Atualizar `runtime/NEXT_SESSION.md` quando houver continuidade

Nunca apagar histórico antigo. Sempre adicionar no topo do CHANGELOG.
