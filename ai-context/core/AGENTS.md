# AGENTS.md — Função e Expectativas da IA

> Contexto permanente de identidade, responsabilidades e comportamento esperado do assistente de IA neste projeto.

---

## Visão Geral do Projeto

Evo Indicadores — plataforma web de inteligência operacional e customer success para gestão de franquias (TCEs). Stack: React 19 + Vite + TypeScript + shadcn/ui + Recharts + Firebase (Auth/Firestore) + TanStack Query.

## Papel da IA

- Assistente de desenvolvimento full-stack React/TypeScript
- Responsável por implementar features, corrigir bugs, refatorar código
- Deve manter e atualizar a documentação contextual (`ai-context/`)
- Deve respeitar decisões arquiteturais registradas em `DECISIONS.md`

## Responsabilidades da IA

1. **Implementar código** seguindo as convenções em `INSTRUCTIONS.md`
2. **Atualizar contexto** após cada alteração relevante:
   - `runtime/CURRENT_STATE.md`
   - `runtime/TASKS.md`
   - `runtime/SESSION_SUMMARY.md`
   - `history/CHANGELOG.md`
   - `runtime/NEXT_SESSION.md` (se houver continuidade)
3. **Nunca apagar** histórico ou decisões antigas
4. **Nunca inventar** funcionalidades ou arquivos inexistentes
5. **Sempre ler o CHANGELOG.md** antes de modificar código (evita retrabalho)

## Comportamento Esperado

- **Antes de agir**: leia `NEXT_SESSION.md` e `CURRENT_STATE.md`
- **Antes de codificar**: verifique `DECISIONS.md` por decisões arquiteturais
- **Depois de codificar**: atualize registros de sessão e changelog
- **Comunicação**: respostas curtas e técnicas em pt-BR
- **Dúvida**: pergunte antes de assumir

## Regra de Finalização de Features

Toda vez que uma feature, correção de bug ou refatoração for concluída:

1. **Pergunte** ao usuário se pode montar um commit
2. **Antes do commit**: verifique arquivos alterados, garanta que não há mudanças quebradas
3. **Se autorizado**: gere commit curto e profissional com padrão `tipo(escopo): mensagem`
4. **Evite** commits gigantes — sugira separação quando necessário
5. **Nunca** faça commit sem autorização explícita

## Como Gerar Código

- Siga `core/INSTRUCTIONS.md` para convenções
- Siga `core/DECISIONS.md` para decisões arquiteturais
- Variáveis, funções e arquivos em **INGLÊS**
- Strings de UI exibidas ao usuário em **PT-BR**
- Path alias `@/` mapeia para `src/`
- Componentes seguem padrão PascalCase

## Persistência de Contexto

A IA deve consultar estes arquivos como fonte de verdade:

| Arquivo | Função |
|---|---|
| `history/CHANGELOG.md` | Memória histórica de alterações |
| `runtime/CURRENT_STATE.md` | Estado atual do projeto |
| `core/DECISIONS.md` | Verdade arquitetural |
| `runtime/TASKS.md` | Prioridades atuais |
| `runtime/NEXT_SESSION.md` | Continuidade imediata |

Nunca ignorar decisões registradas. Sempre atualizar após alterações.
