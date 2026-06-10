# TASKS.md — Prioridades Atuais

> Lista de tarefas ordenadas por prioridade.

---

## MVP — Crítico

1. **Conectar Firebase real**: configurar `.env` com chaves de produção
2. **Substituir dados mock**: trocar dados estáticos das páginas pelos hooks React Query
3. **Testar fluxos**: login, CRUD, importação CSV, navegação por roles

## Imediato (Próxima Sessão)

1. **Importar CSVs mockados e testar**:
   - Importar `mock-data/franquias.csv` (criar unidades)
   - Importar `mock-data/tces.csv` com data 01/06/2026
   - Importar `mock-data/presenca-treinamentos.csv`
   - Fazer segunda importação de TCE com data diferente e validar comparação
   - Verificar Dashboard com dados reais

## Pendências Técnicas

- **Testes automatizados**: Vitest + React Testing Library
- **Chunk splitting**: código acima de 500KB (Recharts + Firebase)
- **Firebase Functions**: backend para processamento pesado de CSV
- **PWA**: service worker para offline-first

## Backlog — Módulo de Relatórios

### Panorama Mensal (screenshot do último dia do mês)
Criar coleção `panoramas` no Firestore com um documento por mês:
- **Nível franqueadora**: total de unidades, total de TCEs, engajamento médio da rede
- **Nível unidade**: TCEs, crescimento (vs mês anterior), engajamento, status, posição no ranking
- **Objetivo**: fonte única para relatórios históricos, eliminando necessidade de recalcular de `tce_history` toda vez
- **Geração**: ao importar CSV do último dia do mês, gerar o panorama automaticamente; ou botão "Fechar Mês"
- **Consumo**: módulo `/relatorios` buscará desses dados

### Inserção manual de TOP 5 de meses anteriores
- Permitir na página `/top5` selecionar mês/ano e auditar/promover unidades manualmente
- Hoje só funciona para o mês corrente (candidatos elegíveis)
- Necessário: buscar dados do `tce_history` do mês selecionado, calcular candidatos, permitir auditoria

## Pós-MVP

- **Dark mode**: toggle light/dark (tokens já definidos no index.css)
- **Notificações push**: Firebase Cloud Messaging
- **IA Analítica**: predição de queda, sugestão de ações CS
- **Gamificação**: badges, medalhas, streaks
- **Benchmarking**: unidade vs região, unidade vs TOP5
- **Exportação PDF/Excel real**: implementar geração de relatórios
