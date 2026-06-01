# Convenções do Projeto — Evo Indicadores

## Stack
- React 19 + Vite + TypeScript
- Tailwind CSS v4 (plugin @tailwindcss/vite)
- shadcn/ui (componentes em `src/components/ui/`)
- Recharts (gráficos)
- Firebase (Auth + Firestore)
- React Router v7
- TanStack Query v5
- Lucide React (ícones)

## Regras de Estilo

### Tailwind

Todas as classes utilitárias do Tailwind são usadas normalmente neste projeto. O `@tailwindcss/vite` funciona corretamente.

```tsx
// Padding, gap, cores — usar classes Tailwind
<div className="p-5 space-y-5">
<div className="flex items-center gap-3.5">
<div className="bg-primary text-primary-foreground">
```

### CSS via index.css

Tokens de design definidos em `src/index.css` via `@theme inline`:
- Cores do projeto: `--color-primary`, `--color-success`, `--color-warning`, etc.
- Cores situacionais: `--color-critica`, `--color-saudavel`, `--color-atencao`, `--color-estatica`, `--color-destaque`
- Cores do shadcn: `--background`, `--foreground`, `--card`, `--border`, `--ring`, etc.

### Componentes shadcn/ui

- Instalados via `npx shadcn@latest add`
- Localizados em `src/components/ui/`
- Config em `components.json`
- **Nunca editar diretamente** — usar props e className para customizar

### Ícones

Usar **Lucide React**:
```tsx
import { TrendingUp, Building2, Trophy, Calendar } from 'lucide-react';
```

## Estrutura de Pastas

```
src/
├── components/
│   ├── layout/      # Componentes de layout (Sidebar, Header, AppLayout)
│   ├── shared/      # Componentes reutilizáveis (StatCard, StatusBadge, etc.)
│   └── ui/          # shadcn/ui (gerado automaticamente)
├── contexts/        # Contextos React (AuthContext)
├── hooks/           # Custom hooks (React Query wrappers)
├── lib/             # Utilitários (firebase.ts, roles.ts, utils.ts)
├── pages/           # Páginas (uma por rota)
├── services/        # Serviços (authService, firestoreService, csvParser)
└── types/           # Tipos TypeScript
```

## Padrões de Código

### TypeScript
- `verbatimModuleSyntax: true` — usar `import type` para imports de tipo
- Tipos centralizados em `src/types/index.ts`
- Roles e permissões em `src/lib/roles.ts`

### React Query
- Cada coleção Firestore tem seu hook: `useUnits`, `useNotices`, `useUsers`, etc.
- Mutations invalidam queries automaticamente (`queryClient.invalidateQueries`)
- Queries tem `staleTime: 5min` e `retry: 1` por padrão

### Firebase/Firestore
- `doc(collection(db, 'units'))` para criar documento com ID automático
- Serviços em `src/services/firestoreService.ts`
- Auth em `src/services/authService.ts`
- Config em `src/lib/firebase.ts` (usa variáveis de ambiente `.env`)

### Rotas e Controle de Acesso
- `ProtectedRoute` verifica autenticação + permissão por role
- Franquia vê `FranquiaDashboardPage`, Admin vê `DashboardPage`
- Rotas definidas em `src/App.tsx`

### Gráficos (Recharts)
- Usar `ResponsiveContainer` com width/height
- Cores dos gráficos alinhadas com tokens do projeto
- Exemplo: `BarChart`, `AreaChart`, `PieChart`, `LineChart`

### Nomenclatura
- **Componentes**: PascalCase (`StatCard`, `StatusBadge`)
- **Hooks**: camelCase com prefixo `use` (`useUnits`, `useAuth`)
- **Páginas**: PascalCase com sufixo `Page` (`DashboardPage`, `LoginPage`)
- **Serviços**: camelCase (`authService`, `firestoreService`)

### Importações
- Path alias `@/` mapeia para `src/`
- Usar sempre `@/components/...`, `@/lib/...`, `@/hooks/...`
- Nunca usar paths relativos longos (`../../components/...`)
