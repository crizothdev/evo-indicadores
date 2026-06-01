# PROMPTS.md — Prompts Reutilizáveis para IA

> Blocos de prompt padronizados para iniciar sessões, revisar código e atualizar contexto.

---

## Iniciar Nova IA

```
Antes de qualquer alteração:
1. Leia ai-context/history/CHANGELOG.md — histórico completo
2. Leia ai-context/core/AGENTS.md — contexto geral
3. Leia ai-context/runtime/NEXT_SESSION.md — continuidade imediata
4. Leia ai-context/runtime/CURRENT_STATE.md — estado atual
5. Leia ai-context/core/INSTRUCTIONS.md — regras de código
6. Após alterações, atualize os arquivos em ai-context/
```

## Revisar Código

```
Revise o código considerando:
- Segue as convenções de ai-context/core/INSTRUCTIONS.md?
- Respeita decisões em ai-context/core/DECISIONS.md?
- Usa path alias @/ para imports?
- Variáveis em inglês? Strings de UI em PT-BR?
- Componentes PascalCase? Hooks camelCase com use?
- Cores seguem tokens do index.css?
- Firebase com fallback mock?
```

## Gerar Feature Nova

```
Antes de implementar {feature}:
1. Verifique DECISIONS.md por decisões relacionadas
2. Verifique se já existe implementação similar (evitar duplicação)
3. Siga o padrão: types/ → services/ → hooks/ → pages/
4. Use path alias @/ para todos os imports
5. Variáveis em inglês, UI strings em PT-BR
6. Atualize CHANGELOG.md, CURRENT_STATE.md, TASKS.md
```

## Atualizar Contexto

```
Após alterações no código:
1. Atualize runtime/CURRENT_STATE.md com o novo estado
2. Atualize runtime/TASKS.md (mover concluídos)
3. Atualize runtime/SESSION_SUMMARY.md com o resumo
4. Adicione entrada no topo do history/CHANGELOG.md
5. Se houver continuidade, atualize runtime/NEXT_SESSION.md
```

## Revisar Arquitetura

```
Ao revisar a arquitetura:
- As camadas estão respeitando separação (types/services/hooks/pages)?
- Os hooks React Query estão no nível correto?
- Há acoplamento indevido entre componentes?
- As decisões em DECISIONS.md ainda são válidas?
- O controle de acesso (roles) está sendo aplicado corretamente?
```

## Resumir Sessão

```
Resumo da sessão:
- O que foi feito:
- Decisões tomadas:
- Arquivos alterados:
- Próximos passos:
- Pendências:
```
