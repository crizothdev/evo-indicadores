# DATABASE.md — Schema de Dados

> Estrutura das coleções Firestore (NoSQL) e tipos TypeScript.

---

## Coleções Firestore

### `units`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `razaoSocial` | string | Razão social da unidade |
| `nomeFantasia` | string | Nome fantasia |
| `status` | string | Operacional / Critica / Em Acompanhamento |
| `tces` | number | Quantidade de TCEs ativos |
| `growth` | number | Crescimento percentual |
| `engagement` | number | Percentual de engajamento |
| `ranking` | number | Posição no ranking |
| `trend` | string | up / down / stable |
| `createdAt` | timestamp | Data de criação |

### `tce_history`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `unitId` | string | Referência à unidade |
| `date` | string | Data (YYYY-MM-DD) |
| `totalTCE` | number | Total de TCEs no dia |
| `importedAt` | timestamp | Data de importação |

### `training_presence`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `unitId` | string | Referência à unidade |
| `trainingDate` | string | Data do treinamento |
| `present` | boolean | Presença confirmada |
| `importedAt` | timestamp | Data de importação |

### `users`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `name` | string | Nome do usuário |
| `email` | string | Email |
| `role` | string | admin / franchise / operacional / expansao |
| `unitId` | string? | Unidade vinculada (apenas franchise) |
| `active` | boolean | Status ativo/inativo |

### `notices`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `title` | string | Título do aviso |
| `content` | string | Conteúdo completo |
| `important` | boolean | Flag de destaque |
| `createdAt` | timestamp | Data de criação |
| `createdBy` | string | Autor |
| `target` | string | Público-alvo |

### `top5_audit`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `unitId` | string | Referência à unidade |
| `month` | string | Mês de referência |
| `growthEligible` | boolean | Elegível por crescimento |
| `trainingEligible` | boolean | Elegível por treinamento |
| `socialMediaApproved` | boolean | Redes sociais aprovadas |
| `paymentApproved` | boolean | Pagamentos aprovados |
| `finalApproved` | boolean | Aprovação final |

### `follow_up`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `unitId` | string | Referência à unidade |
| `createdAt` | timestamp | Data de criação |
| `notes` | string | Observações |
| `status` | string | Status do acompanhamento |

### `appointments`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string | ID do documento |
| `unitId` | string | Referência à unidade |
| `unitName` | string | Nome da unidade |
| `title` | string | Título do compromisso |
| `description` | string | Descrição |
| `date` | string | Data (YYYY-MM-DD) |
| `time` | string | Horário (HH:MM) |
| `type` | string | reuniao / suporte / checkin |
