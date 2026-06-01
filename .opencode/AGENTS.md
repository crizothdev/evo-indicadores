# Evo Indicadores — Contexto para Agentes de IA

> **Este arquivo é um redirect.** Consulte `ai-context/` para o contexto completo.

O contexto do projeto está na estrutura modular `ai-context/`:

| Diretório | Conteúdo |
|---|---|
| `ai-context/core/` | Documentos permanentes (identidade, regras, decisões, stack) |
| `ai-context/runtime/` | Documentos voláteis (estado atual, tarefas, sessão) |
| `ai-context/history/` | Histórico imutável (changelog, archive) |
| `ai-context/api/` | Documentação técnica (serviços, dados, fluxos) |

**Sempre comece por:**
1. `ai-context/core/AGENTS.md` — contexto geral e regras
2. `ai-context/runtime/NEXT_SESSION.md` — continuidade imediata
3. `ai-context/runtime/CURRENT_STATE.md` — estado atual
4. `ai-context/core/INSTRUCTIONS.md` — regras de código
5. `ai-context/history/CHANGELOG.md` — histórico de alterações

## Documentação Adicional

| Arquivo | Conteúdo |
|---|---|
| `README.md` | Visão geral, stack, estrutura |
| `CONVENTIONS.md` | Convenções de código |
| `DEPLOY.md` | Deploy (Firebase Hosting) |
| `docs/CADASTRO_USUARIOS.md` | Fluxo de cadastro de usuários |
| `docs/FORMATO_CSV.md` | Formatos de CSV aceitos |
