# CHANGELOG — Evo Indicadores

> Formato: `YYYY-MM-DD | arquivo | descricao`

---

## 2026-06-01 — Correção de Layout + Auth

- `src/pages/LoginPage.tsx` | fix: loading infinito no login com try/catch/finally
- `src/pages/LoginPage.tsx` | fix: ícones removidos dos inputs, estilo erro laranja
- `src/pages/RegistrarPage.tsx` | fix: ícones removidos dos inputs, estilo erro laranja
- `src/pages/UnidadesPage.tsx` | fix: ícone de busca removido
- `src/components/ui/card.tsx` | fix: inline style padding 36px + marginBottom 24px (Tailwind classes não funcionavam)
- `src/components/layout/Sidebar.tsx` | fix: nome do usuário no lugar de "EVO" fixo
- `src/contexts/AuthContext.tsx` | revert: fallbacks removidos (mantido original)
- `src/services/authService.ts` | revert: alterações removidas (mantido original)
- `ai-context/` | docs: session summary, next session, changelog atualizados

## 2026-05-31 — TCE Format + Mock Data + Date Input

- `src/services/csvParser.ts` | refactor: parseDailyTCE aceita formato simplificado (só nomes de unidade)
- `src/services/firestoreService.ts` | feat: saveTCEImport compara com último dia no banco e retorna comparison
- `src/services/dataService.ts` | refactor: saveTCEImport retorna objeto { id, comparison }
- `src/pages/ImportacaoPage.tsx` | feat: campo de data dd/mm/aaaa obrigatório para TCE, tabela com comparação ganhou/perdeu clientes
- `mock-data/franquias.csv` | feat: 10 unidades mock
- `mock-data/tces.csv` | feat: 50 TCEs distribuídos entre 10 unidades
- `mock-data/presenca-treinamentos.csv` | feat: 4 datas de treinamento com presença variável

## 2026-05-24 — Projeto Inicial

- ... (projeto inicial completo)
