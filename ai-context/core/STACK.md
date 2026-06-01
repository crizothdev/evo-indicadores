# STACK.md — Tecnologias e Dependências

> Registro técnico de linguagens, frameworks, bibliotecas e versões.

---

## Linguagens

| Linguagem | Versão |
|---|---|
| TypeScript | 5.8+ |
| React | 19 |
| Node.js | 22+ |

## Framework & Build

| Item | Tecnologia | Uso |
|---|---|---|
| Build tool | Vite 8 | Dev server, build, HMR |
| UI Framework | React 19 | Renderização SPA |
| Estilo | Tailwind CSS v4 | Utilitários CSS |
| Componentes | shadcn/ui | 18 componentes base |
| Gráficos | Recharts | BarChart, AreaChart, PieChart, LineChart |
| Ícones | Lucide React | Ícones vetoriais |

## Dependências (package.json)

| Pacote | Finalidade |
|---|---|
| `react` ^19 | UI framework |
| `react-dom` ^19 | Renderização DOM |
| `react-router-dom` ^7 | Roteamento SPA |
| `@tanstack/react-query` ^5 | Cache e fetch de dados |
| `firebase` ^12 | Auth + Firestore |
| `recharts` ^2 | Gráficos e visualizações |
| `lucide-react` | Ícones |
| `tailwindcss` ^4 | CSS utilitário |
| `@tailwindcss/vite` ^4 | Plugin Tailwind para Vite |
| `clsx` / `tailwind-merge` | Utilitários de classe (shadcn) |
| `date-fns` | Manipulação de datas |

## Serviços Externos

| Serviço | Status | Detalhes |
|---|---|---|
| Firebase Auth | Configurável | Login com email/senha |
| Firestore | Configurável | NoSQL, coleções: units, users, notices, etc. |
| Firebase Hosting | Planejado | Deploy do frontend |

## Ferramentas

| Ferramenta | Uso |
|---|---|
| Vite CLI | Dev server, build, preview |
| TypeScript Compiler | Type checking (`tsc -b`) |
| shadcn CLI | Adicionar componentes (`npx shadcn add`) |
| Firebase CLI | Deploy (`firebase deploy`) |
