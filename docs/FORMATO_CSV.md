# Formato CSV — Evo Indicadores

## 1. TCEs Diários (Relatório Diário)

**Origem:** Sistema de relatórios da Evo. Exportação diária com lista de razões sociais.

**Formato do CSV exportado:**
```csv
Relatório,Data/Hora,Nome Agente
"Relatório TCE Ativos","18/05/2026 19:14:05","EVO ESTAGIOS CONSULTORIA E TREINAMENTOS LTDA"
"Relatório TCE Ativos","18/05/2026 19:14:05","LMX CONSULTORIA E TREINAMENTOS LTDA"
"Relatório TCE Ativos","18/05/2026 19:14:05","EVO ESTAGIOS CONSULTORIA E TREINAMENTOS LTDA"
"Relatório TCE Ativos","18/05/2026 19:14:05","LMX CONSULTORIA E TREINAMENTOS LTDA"
```

**Colunas:**

| # | Nome | Descrição |
|---|---|---|
| 1 | Relatório | Tipo de relatório (fixo: "Relatório TCE Ativos") |
| 2 | Data/Hora | Data e hora da exportação (formato: DD/MM/AAAA HH:MM:SS) |
| 3 | Nome Agente | Razão social da empresa (unidade) |

**Processamento:**
1. O sistema lê todas as linhas
2. Agrupa por `Nome Agente` (razão social)
3. Conta quantas vezes cada razão social aparece → **total de TCEs da unidade no dia**
4. Extrai a data do campo `Data/Hora`
5. Salva em `tce_history`: `{ unitId, date, totalTCE }`

**Exemplo de resultado:**
```
EVO ESTAGIOS CONSULTORIA E TREINAMENTOS LTDA → 2 TCEs
LMX CONSULTORIA E TREINAMENTOS LTDA → 2 TCEs
```

**Regras:**
- Separador: `,` (vírgula)
- Campos entre aspas duplas (`"`)
- Linhas em branco são ignoradas
- Primeira linha é o cabeçalho
- Valores com aspas preservam vírgulas internas

---

## 2. Presença em Treinamentos

**Origem:** Lista de presença exportada da planilha de treinamentos.

**Formato (horizontal):**
```csv
Franquia,07/05,14/05,21/05
Aldeota,,,
Anápolis,,,
Araraquara,,ok,ok
Atibaia,ok,ok,ok
Barra de São Francisco,,,
```

**Colunas:**

| # | Nome | Descrição |
|---|---|---|
| 1 | Franquia | Nome da unidade |
| 2+ | DD/MM | Data do treinamento (uma coluna por data) |

**Valores das células:**
- `ok` → presente
- vazio → ausente

**Processamento:**
1. Lê o cabeçalho para extrair as datas
2. Para cada unidade, verifica presença em cada data
3. Salva em `training_presence`: `{ unitId, trainingDate, present }`

**Exemplo de resultado:**
```
Araraquara: 14/05 ✓, 21/05 ✓ (2 de 3)
Atibaia: 07/05 ✓, 14/05 ✓, 21/05 ✓ (3 de 3)
```

---

## 3. Histórico Legado

**Origem:** Planilha histórica com dados consolidados de meses anteriores.

**Formato (a ser normalizado por IA):**
```csv
razao_social,01/04/2026,01/05/2026,01/06/2026
Unidade A,140,145,150
Unidade B,125,128,130
```

**Colunas:**

| # | Nome | Descrição |
|---|---|---|
| 1 | razao_social | Nome da unidade |
| 2+ | DD/MM/AAAA | Data de referência com total de TCEs consolidado |

**Processamento:**
- Uma IA externa normaliza a planilha para este formato
- O sistema lê cada data como um registro diário separado
- Salva em `tce_history`

---

## 4. Cadastro de Franquias (CSV)

**Origem:** Planilha master de franquias da Evo.

**Formato (24 colunas):**
```
RAZÃO SOCIAL,UNIDADE,UF,Região de atuação,FALTA DE CONTRATO,Franqueado,Data de Nascimento,Profissão,CNPJ,CEP,Telefone,Email,Status,Prime/Home Office,Data início contrato,Data rescisão,Data final 5 anos,Vencimento,Data renovação,Data 2° renovação,Vencimento 2,Data início royalties,VALOR,IGPM
```

| # | Coluna | Descrição |
|---|---|---|
| 1 | RAZÃO SOCIAL | Razão social da empresa (identificador) |
| 2 | UNIDADE | Nome da unidade/região |
| 3 | UF | Estado |
| 4 | Região de atuação | Área de cobertura |
| 5 | FALTA DE CONTRATO | Observação |
| 6 | Franqueado | Nome(s) do(s) franqueado(s) |
| 7 | Data de Nascimento | DD/MM/AAAA |
| 8 | Profissão | Profissão do franqueado |
| 9 | CNPJ | CNPJ da unidade |
| 10 | CEP | CEP |
| 11 | Telefone | Telefone de contato |
| 12 | Email | Email da unidade |
| 13 | Status | ATIVO / Inativo / Rescindido / Processo / Não Finalizado |
| 14 | Prime/Home Office | HOME OFFICE / PRESENCIAL |
| 15 | Data início contrato | DD/MM/AAAA |
| 16 | Data rescisão | DD/MM/AAAA (se rescindido) |
| 17-24 | Datas e valores | Controle de renovações, vencimentos, royalties |

**Processamento:**
- Campos entre aspas preservam vírgulas
- Linhas sem razão social usam nome do franqueado como identificador
- Cria documento em `units` no Firestore

---

## Regras Gerais para Todos os Formatos

- **Encoding**: UTF-8
- **Separador**: `,` (vírgula) — todos os formatos aceitam também `;`
- **Aspas**: Campos com vírgulas internas devem estar entre aspas duplas (`"`)
- **Linhas em branco**: Ignoradas
- **Linhas com `#`**: Ignoradas (comentários)
- **Primeira linha**: Cabeçalho (não processada como dado)
- **Datas**: Formato DD/MM/AAAA
- **Valores numéricos**: Sem formatação (ex: `142`, não `R$ 142` ou `142,00`)
