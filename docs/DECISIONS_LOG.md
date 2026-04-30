# FlyDea Financial Manager — Registro de Decisões

## Como Usar Este Arquivo

Este é o log de decisões arquiteturais e de produto. Cada entrada documenta uma decisão tomada, o contexto, as alternativas consideradas e o impacto.

---

## Formato de Entrada

```markdown
## [DATA] - Título da Decisão

**Contexto:** [Por que esta decisão foi necessária]

**Opções Consideredas:**
1. [Opção 1] — [Descrição]
2. [Opção 2] — [Descrição]

**Decisão Final:** [O que foi decidido e por quê]

**Impacto:** [O que muda no código, UX ou arquitetura]

**Responsável:** [Quem tomou a decisão]
```

---

## Decisões Iniciais

### 2026-04-30 — Estrutura de Documentação do Projeto

**Contexto:** O projeto tinha 31 arquivos .md no root, muitos duplicados ou obsoletos. Precisávamos de uma estrutura organizada para que qualquer IA pudesse entender o projeto rapidamente.

**Opções Consideredas:**
1. Manter tudo no root com prefixos (docs-architecture.md, etc)
2. Mover para pasta /docs/ com estrutura consolidada
3. Usar pasta .brain do Obsidian (inacessível no Linux)

**Decisão Final:** Opção 2 — Criar pasta `/docs/` com 15 arquivos padronizados. Cada arquivo tem propósito claro e的名字.

**Impacto:**
- Qualquer IA pode entender o projeto em 5 minutos lendo os docs certos
- Backlog centralizado e rastreável
- Decisões documentadas e encontráveis
- Eliminação de duplicação

**Responsável:** AI Project Organizer

---

### 2026-04-30 — Definição de glass-card CSS

**Contexto:** Os componentes EmptyState e ConfirmDialog usam `.glass-card` que não existe no CSS.

**Opções Consideredas:**
1. Definir `.glass-card` no globals.css com glassmorphism
2. Substituir por `.premium-card` existente
3. Remover a classe e usar estilos inline

**Decisão Final:** Opção 1 — Definir `.glass-card` no globals.css com backdrop-filter e border-radius generoso. Mantém a intenção de design premium.

**Impacto:**
- EmptyState e ConfirmDialog renderizam corretamente
- Consistência visual preservada
- Design system segue o padrão estabelecido

**Responsável:** AI Project Organizer

---

### 2026-04-30 — Estratégia de Delete de Recorrências

**Contexto:** Ao deletar uma recorrência (E1-T1), o que acontece com as transações já geradas por ela?

**Opções Consideredas:**
1. **Cascade delete** — Deletar todas as transações geradas
2. **Manter transações** — Transações geradas são fatos históricos, ficam no histórico

**Decisão Final:** Opção 2 — Manter as transações geradas. A recorrência é apenas o "template" (agendamento), as transações geradas são registros financeiros reais que o usuário não deveria perder.

**Impacto:**
- Dados financeiros preservados
- Usuário pode continuar vendo histórico de transações
- Decisão registrada para todas as future IAs

**Responsável:** AI Project Organizer

---

### 2026-04-30 — Filtro de Contas a Pagar (Frontend vs Backend)

**Contexto:** O filtro fake de Contas a Pagar (E1-T2) precisa ser corrigido. A questão é: filtrar no frontend ou no backend?

**Opções Consideredas:**
1. **Frontend** — Filtrar array local já carregado
2. **Backend** — Nova query com filtro server-side

**Decisão Final:** Opção 1 — Frontend. Os dados já estão carregados, filtrar local é mais rápido e reduz complexidade de API.

**Impacto:**
- Simplicidade de implementação
- Resposta instantânea ao usuário
- API não precisa ser modificada

**Responsável:** AI Project Organizer

---

### 2026-04-30 — Estratégia de Cobertura de Testes

**Contexto:** Cobertura atual é 45%. Meta é 80%+ para garantir regressão.

**Opções Consideredas:**
1. Testar tudo com Integration Tests
2. Focar em Unit Tests com Mocks
3. Priorizar E2E para fluxos críticos

**Decisão Final:** Unit Tests com Mocks para OCR, Blob, PicoClaw, serviços de infraestrutura. E2E apenas para fluxos críticos (CRUD transações, filtros, login).

**Impacto:**
- Testes rápidos (unitários não precisam de banco)
- Mocks permitem testar edge cases
- E2E como guarda final, não como cobertura principal

**Responsável:** AI Project Organizer

---

## Regras de Preenchimento

1. **Sempre** inclua a data no formato YYYY-MM-DD
2. **Sempre** explique o contexto (por que precisou decidir)
3. **Sempre** liste opções consideradas (nunca documento decisão sem alternativas)
4. **Sempre** indique o impacto
5. **Nunca** tome decisão sem registrar aqui

---

*Este arquivo deve ser atualizado sempre que uma decisão arquitetural ou de produto for tomada.*