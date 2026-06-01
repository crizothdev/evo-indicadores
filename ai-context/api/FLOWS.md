# FLOWS.md — Fluxos de Navegação e Dados

> Mapeamento de rotas, transições e jornadas do usuário.

---

## Rotas

| Rota | Componente | Permissão |
|---|---|---|
| `/login` | LoginPage | pública |
| `/dashboard` | DashboardPage / FranquiaDashboardPage | autenticado |
| `/unidades` | UnidadesPage | canViewAllUnits |
| `/unidades/:id` | UnidadeDetalhePage | canViewAllUnits |
| `/importacao` | ImportacaoPage | canImport |
| `/avisos` | AvisosPage | autenticado |
| `/top5` | Top5Page | canAuditTop5 |
| `/acompanhamento` | AcompanhamentoPage | canManageFollowUp |
| `/agenda` | AgendaPage | autenticado |
| `/usuarios` | UsuariosPage | canManageUsers |
| `/configuracoes` | ConfiguracoesPage | canConfigure |
| `/relatorios` | RelatoriosPage | canViewReports |

## Fluxos Principais

### Login

```
LoginPage → Firebase Auth → AuthContext (user state)
  → Admin → DashboardPage
  → Franquia → FranquiaDashboardPage
  → Operacional → DashboardPage
  → Expansao → DashboardPage
```

### Importação CSV

```
ImportacaoPage
  → Selecionar tipo (TCEs / Treinamentos / Histórico)
  → Upload arquivo ou colar CSV
  → parseCSV(csvText) → CSVImportResult { rows, errors, summary }
  → Preview dos dados
  → "Processar Dados" → salva no Firestore
  → Feedback de sucesso/erros
```

### Ciclo de Dados

```
CSV Importado
  → Parser CSV (agrupamento por razão social)
  → Firestore (tce_history, training_presence)
  → Cálculo de Indicadores (growth, engagement, ranking)
  → Dashboard / Rankings (Recharts)
  → TOP5 Auditoria (top5_audit)
```

### Navegação (Admin)

```
Sidebar:
  Dashboard → Unidades → Importação → Avisos → TOP 5
  → Acompanhamento → Agenda → Usuários → Configurações

Header:
  Sino (notificações) + Avatar (perfil)
```

### Navegação (Franquia)

```
Sidebar:
  Dashboard → Avisos → Agenda

Header:
  Sino (notificações) + Avatar (perfil)
```

### Avisos (Admin)

```
AvisosPage
  → Lista esquerda: avisos com tags (IMPORTANTE/URGENTE)
  → Banner direita: imagem + título + conteúdo completo
  → Botões: Novo Aviso, Editar, Excluir
```

### Agenda

```
AgendaPage
  → Calendário esquerda: mês atual, dias com eventos
  → Compromissos direita: cards com horário, tipo, unidade
  → Solicitar Agendamento: dropdown tipo + data + botão Enviar
```
