# API.md — Interface de Serviços

> Métodos públicos dos serviços do app. Firebase Auth + Firestore.

---

## AuthService (`src/services/authService.ts`)

| Método | Retorno | Descrição |
|---|---|---|
| `loginWithEmail(email, password)` | `Promise<User>` | Login Firebase Auth + busca perfil no Firestore |
| `logoutUser()` | `Promise<void>` | Sign out Firebase Auth |
| `onAuthChange(callback)` | `() => void` | Listener de estado de autenticação (retorna unsubscribe) |

## FirestoreService (`src/services/firestoreService.ts`)

### Units

| Método | Retorno | Descrição |
|---|---|---|
| `fetchUnits()` | `Promise<Unit[]>` | Todas as unidades |
| `fetchUnit(id)` | `Promise<Unit \| null>` | Unidade por ID |
| `updateUnit(id, data)` | `Promise<void>` | Atualiza unidade |

### Notices

| Método | Retorno | Descrição |
|---|---|---|
| `fetchNotices()` | `Promise<Notice[]>` | Avisos ordenados por data |
| `createNotice(data)` | `Promise<string>` | Cria aviso, retorna ID |
| `updateNotice(id, data)` | `Promise<void>` | Atualiza aviso |
| `deleteNotice(id)` | `Promise<void>` | Remove aviso |

### Users

| Método | Retorno | Descrição |
|---|---|---|
| `fetchUsers()` | `Promise<User[]>` | Todos os usuários |
| `createUser(data)` | `Promise<string>` | Cria usuário |
| `updateUser(id, data)` | `Promise<void>` | Atualiza usuário |

### Top5

| Método | Retorno | Descrição |
|---|---|---|
| `fetchTop5()` | `Promise<Top5Entry[]>` | Auditoria TOP5 |
| `updateTop5Entry(id, data)` | `Promise<void>` | Atualiza entrada TOP5 |

### Follow Up

| Método | Retorno | Descrição |
|---|---|---|
| `fetchFollowUps()` | `Promise<FollowUp[]>` | Unidades em acompanhamento |
| `createFollowUp(data)` | `Promise<string>` | Adiciona ao acompanhamento |

### Appointments

| Método | Retorno | Descrição |
|---|---|---|
| `fetchAppointments()` | `Promise<Appointment[]>` | Compromissos ordenados |
| `createAppointment(data)` | `Promise<string>` | Cria compromisso |
| `deleteAppointment(id)` | `Promise<void>` | Remove compromisso |

### History

| Método | Retorno | Descrição |
|---|---|---|
| `fetchTCEHistory(unitId?)` | `Promise<{date, totalTCE}[]>` | Histórico de TCEs |
| `fetchTrainingPresence(unitId?)` | `Promise<{trainingDate, present}[]>` | Presença em treinamentos |

## CSVParser (`src/services/csvParser.ts`)

| Método | Retorno | Descrição |
|---|---|---|
| `parseCSV(csvText)` | `CSVImportResult` | Parser de TCEs com agrupamento por razão social |
| `parseTrainingCSV(csvText)` | `CSVImportResult` | Parser de presença em treinamentos |

**CSVImportResult:**
- `rows: CSVImportRow[]` — linhas parseadas
- `errors: string[]` — erros de validação
- `summary: Record<string, number>` — agrupamento por razão social

## Hooks React Query

### useUnits / useUnit / useUpdateUnit
### useNotices / useCreateNotice / useUpdateNotice / useDeleteNotice
### useUsers / useCreateUser / useUpdateUser
### useTop5 / useUpdateTop5
### useFollowUps / useCreateFollowUp
### useAppointments / useCreateAppointment / useDeleteAppointment
### useCSVImport

Todos hooks seguem padrão `useQuery` para fetch e `useMutation` para write, com `invalidateQueries` automático.
