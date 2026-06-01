# KNOWN_ISSUES.md — Issues e Limitações Conhecidas

> Problemas conhecidos, bugs não críticos e limitações do MVP atual.

---

## Funcionais

- **Dados mock nas páginas** — Todas as páginas usam dados estáticos. Necessário integrar hooks React Query.
- **Firebase mock** — AuthContext usa fallback mock quando `.env` não tem chaves. Produção requer config real.
- **CSV parser simples** — Não valida encoding, não trata datas com formato alternativo, não detecta duplicidade entre imports.

## Técnicas

- **Chunk size > 500KB** — Build bundle grande devido a Recharts + Firebase + shadcn. Code splitting recomendado.
- **Sem testes automatizados** — Sem Vitest, React Testing Library ou Cypress configurados.
- **Sem i18n** — Apenas PT-BR, sem estrutura para multi-idioma.
- **Sem Firebase Functions** — Processamento de CSV é feito no frontend. Para volumes grandes, mover para cloud function.

## UI/UX

- **Sem dark mode ativo** — Tokens definidos no CSS mas toggle não implementado.
- **Sem loading states refinados** — Apenas texto "Carregando..." durante auth.
- **Sem empty states** — Listas vazias não têm tratamento visual.
- **Sem feedback de erro** — Erros de Firebase/Firestore não têm tratamento de UI.

## Não Implementado

- Notificações push (Firebase Cloud Messaging)
- Exportação real de PDF/Excel
- IA analítica (predição de queda)
- Gamificação (badges, streaks)
- PWA (service worker, offline)
- Dark mode toggle
