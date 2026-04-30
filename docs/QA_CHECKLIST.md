# FlyDea Financial Manager — Checklist de QA

## Visão Geral

Este documento lista os pontos de validação para cada módulo do sistema. Baseado na auditoria UX completa (87 gaps) e nos requisitos de qualidade do produto.

---

## Checklist por Módulo

### 🔴 Crítico (P0) —必须 Validar Antes de Qualquer Release

| Módulo | Item de Validar | Como Validar | Critério de Passagem |
|--------|-----------------|--------------|---------------------|
| Recorrências | Delete funciona | Clicar delete, confirmar, verificar se sumiu | Transação desaparece da lista |
| Contas a Pagar | Filtro funciona | Selecionar "Atrasadas", ver só atrasadas | Apenas itens relevantes visíveis |
| UI | glass-card existe | Abrir EmptyState e ConfirmDialog | Estilos aplicado corretamente |
| UI | --color-muted existe | Ver Skeleton em qualquer loading | Cor visível |
| Logs | Paginação funciona | Ir para página 2+ | Logs corretos carregados |
| Admin Aprovacoes | Role check | Acessar como não-admin | Redirecionado |

### 🟡 Alto (P1) — Validar Antes de Release Minor

| Módulo | Item de Validar | Como Validar | Critério de Passagem |
|--------|-----------------|--------------|---------------------|
| Global | useConfirm取代 confirm | Ações de delete em qualquer página | Dialog de confirmação nativo não aparece |
| Global | useToast取代 toast local | Qualquer ação com feedback | Toast global aparece |
| Global | Error boundary | Forçar erro em componente | Página não quebra completamente |
| Movimentações | Dialog header sticky | Abrir form no mobile, scrollar | Header permanece visível |
| Movimentações | Tabela oculta mobile | Redimensionar para < 768px | Tabela não visível |
| Movimentações | FAB position | Abrir no iPhone 16 simulation | Não sobrepõe bottom nav |
| Mobile | Navegação expandida | Clicar "Mais" na bottom nav | Sheet com todos os módulos |
| Mobile | Dialog swipe | Swipe down no dialog mobile | Dialog fecha |

### 🟢 Médio (P2) — Validar em Regression

| Módulo | Item de Validar | Como Validar | Critério de Passagem |
|--------|-----------------|--------------|---------------------|
| Fluxo de Caixa | alert() substituído | Criar invoice, ver toast | Alert nativo não aparece |
| Orçamentos | Período selector | Ir para mês anterior | Dados do mês selecionado |
| Relatórios | Charts responsivos | Mobile view | Labels não sobrepostos |
| Relatórios | Print styles | Clicar imprimir | Layout legível |
| Perfil | Reload substituído | Salvar perfil | Página não recarrega |
| Dashboard | APIs coordenadas | Recarregar dashboard | Loading simultâneo |

---

## Fluxos Críticos (E2E Required)

### 1. Autenticação
- [ ] Login com credenciais válidas → Dashboard
- [ ] Login com credenciais inválidas → Erro mostrado
- [ ] Logout → Redirect para login

### 2. Transações
- [ ] Criar transação (INCOME) → Aparece na lista
- [ ] Criar transação (EXPENSE) → Aparece na lista
- [ ] Editar transação → Dados atualizados
- [ ] Deletar transação → Confirmado e removida
- [ ] Exportar CSV → Download inicia

### 3. Recorrências
- [ ] Criar recorrência → Transação gerada
- [ ] Pausar/reativar → Status atualizado
- [ ] Deletar → Confirmado (E1-T1)

### 4. Contas a Pagar
- [ ] Ver secciones (Atrasadas, Vencem, Sem data)
- [ ] Marcar como pago → Status atualizado
- [ ] Filtro funciona (E1-T2)

### 5. Orçamentos
- [ ] Criar orçamento por categoria
- [ ] Ver alerta quando >= 80%
- [ ] Editar orçamento

### 6. Agentes IA
- [ ] Criar agente via wizard
- [ ] Executar agente manualmente
- [ ] Ver histórico de execuções

---

## Pontos Sensíveis (Atenção Extra)

| Área | Risco | Mitigação |
|------|-------|-----------|
| OCR | Dados incorretos | Usuário revisa antes de importar |
| Delete cascade | Perda de dados | Confirm dialog + manter histórico |
| Export dados | Dados sensíveis | Autenticado apenas |
| Role admin | Acesso indevido | Server-side check |
| Date timezone | Off-by-one | Testes com datas de borda |

---

## Regressões Prováveis

1. **Filtros de transações** — Mudar lógica pode quebrar outros filtros
2. **Export CSV** — Mudar formato pode quebrar planilhas de usuários
3. **Recorrências** — Mudar geração pode criar duplicatas
4. **Engine financeira** — Qualquer mudança impacta Dashboard, Fechamento, Relatórios
5. **Auth** — Mudar NextAuth pode bloquear todos os usuários

---

## Como Validar

### Teste Manual
```bash
# Levantar app
npm run dev

# Testar fluxos críticos em:
# - Mobile (390x844)
# - Desktop (1280x720)
```

### Teste Automatizado
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Quality gate
npm run test:quality  # type-check + lint + coverage
```

---

## Referências

- Auditoria UX completa: `UX-UI-AUDIT-2026-04.md` (no root)
- Testes existentes: `__tests__/`, `tests/`
- Engine financeira: `src/lib/financial-engine.ts`

---

*Este checklist deve ser usado antes de cada release. Atualize quando novos módulos ou riscos forem identificados.*