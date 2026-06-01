# NEXT_SESSION.md — Próxima Sessão

> Instruções de continuidade para a próxima interação com IA.

---

## ⚠️ Problema Crítico: Tailwind v4 não compila classes de padding/spacing

As classes Tailwind de padding (`px-*`, `py-*`, `p-*`, `space-y-*`, `gap-*`) **não estão funcionando** neste projeto. Usar **inline style** (`style={{}}`) para qualquer ajuste de espaçamento.

**Não perder tempo testando classes Tailwind para spacing** — ir direto para inline style.

### Card component (`src/components/ui/card.tsx`)
```tsx
style={{ padding: '36px', background: '#fff', marginBottom: '24px' }}
```

### Main layout (`src/components/layout/AppLayout.tsx`)
```tsx
style={{ paddingLeft: '10px', paddingRight: '10px' }}
```

### Regra geral
Sempre reiniciar o servidor Vite (`pkill -f "vite"`) depois de alterar arquivos.

---

## Ao Iniciar a Sessão

```
1. Leia ai-context/history/CHANGELOG.md
2. Leia ai-context/core/AGENTS.md
3. Leia ai-context/runtime/NEXT_SESSION.md
4. Leia ai-context/runtime/CURRENT_STATE.md
5. Leia ai-context/core/INSTRUCTIONS.md
6. Após alterações, atualize os arquivos em ai-context/
```

## Arquivos para Consultar

- `ai-context/core/DECISIONS.md` — decisões arquiteturais
- `ai-context/api/FLOWS.md` — fluxos de navegação
