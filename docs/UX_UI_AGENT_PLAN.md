# UX/UI Designer & Researcher — Plano de Atuação

**FLY-016** | **Owner:** UX/UI Designer & Researcher | **Prioridade:** P1 | **Status:** 📋 PLANEJADO

---

## 1. Missão do Agente

Garantir que o Flydea Financial Manager tenha uma experiência premium, consistente e acessível — mobile-first no iPhone 16 — através de governança do design system, pesquisa de UX, auditoria de acessibilidade e quality gate visual em todo fluxo de desenvolvimento.

O agente **complementa** o Frontend/Mobile Engineer:
- **Frontend implementa** — código, componentes, páginas
- **UX/UI define padrões** — tokens, guidelines, protótipos, auditoria

---

## 2. Escopo de Atuação

### 2.1 Design System Governance
- Manter e evoluir tokens CSS (`globals.css`, `token-aliases.css`)
- Auditar componentes shadcn/ui para consistência
- Detectar e corrigir CSS hardcoded
- Garantir que novos componentes sigam o design system
- Manter `docs/UX_PRINCIPLES.md` atualizado

### 2.2 UX Research & Prototipação
- Mapear jornadas do usuário (user flows)
- Conduzir testes de usabilidade
- Prototipar novas telas e fluxos
- Validar fluxos com personas definidas
- Documentar descobertas e recomendações

### 2.3 Acessibilidade (WCAG 2.1 AA)
- Auditar contraste de cores
- Verificar touch targets mínimos (44x44px)
- Garantir suporte a `prefers-reduced-motion`
- Auditar labels ARIA e foco visível
- Verificar zoom não desabilitado

### 2.4 Quality Gate Visual
- Revisar PRs com mudanças visuais
- Verificar alinhamento com Figma designs
- Detectar regressões visuais
- Validar em viewport iPhone 16 (390x844)
- Verificar que animações seguem padrões (150-300ms, GPU-accelerated)

### 2.5 Component Library
- Catalogar componentes existentes
- Identificar duplicação de componentes
- Propor novos componentes quando necessário
- Manter consistência de API dos componentes

### 2.6 UX Gap Resolution
- Analisar e priorizar 87 gaps de UX documentados
- Propor correções para cada gap
- Verificar correções implementadas
- Atualizar `docs/QA_CHECKLIST.md`

---

## 3. Fluxo de Trabalho

```
PR CRIADO (com mudanças visuais)
    │
    ▼
UX/UI Agent é ativado automaticamente
    │
    ├── 1. Revisar mudanças visuais no PR
    ├── 2. Verificar tokens CSS vs hardcoded
    ├── 3. Validar responsividade mobile (390x844)
    ├── 4. Verificar acessibilidade (touch targets, contraste, ARIA)
    ├── 5. Confirmar padrões de animação
    └── 6. Aprovar ou solicitar ajustes
    │
    ▼
Frontend implementa ajustes → QA valida → Merge
```

Para mudanças que **não são PRs** (ex: prototipação de nova feature):
1. Product Owner cria task com requisitos
2. UX/UI Agent prototipa fluxo/screen
3. PO e Frontend revisam protótipo
4. Aprovado → Frontend implementa
5. UX/UI Agent audita implementação

---

## 4. Primeiras Tarefas Priorizadas (Sprint 1)

| ID | Tarefa | Prioridade | Esforço | Depende de |
|----|--------|------------|---------|------------|
| FLY-017 | Auditoria inicial do design system e tokens CSS | P1 | M | — |
| FLY-018 | Mapear e priorizar 87 gaps de UX | P1 | M | — |
| FLY-019 | Criar quality gate visual para PRs | P2 | P | FLY-017 |
| — | Auditoria de acessibilidade (WCAG) nas 5 páginas principais | P1 | G | FLY-017 |
| — | Prototipar correção dos top 10 gaps de UX | P1 | M | FLY-018 |
| — | Criar guia de estilos rápido para o time | P2 | P | FLY-017 |

**Legenda:** P=Pequeno (1-2h), M=Médio (3-6h), G=Grande (8-16h)

---

## 5. Métricas de Sucesso

| Métrica | Meta | Como Medir |
|---------|------|------------|
| CSS hardcoded eliminado | 0 ocorrências nas páginas principais | Auditoria por página |
| Touch targets < 44px | 0 ocorrências | Auditoria com DevTools |
| Gaps de UX resolvidos | 30% (26/87) na Sprint 1 | QA_CHECKLIST.md |
| PRs com quality gate visual | 100% dos PRs com UI | Checklist no PR template |
| Animações dentro do padrão | 100% (150-300ms, GPU) | Code review |
| Contrast ratio AAA | 100% dos textos | Lighthouse / axe DevTools |
| `confirm()` nativo eliminado | 0 ocorrências | Grep no código |
| Toast local eliminado | 0 ocorrências | Grep no código |

---

## 6. Quality Gate — Checklist para PRs

Quando um PR envolve mudanças visuais (CSS, componentes, layouts, novas páginas), o UX/UI Agent deve verificar:

### Layout & Responsividade
- [ ] Testado em viewport 390x844 (iPhone 16)
- [ ] Safe-area-insets respeitadas
- [ ] Touch targets ≥ 44x44px
- [ ] Bottom nav com max 5 itens
- [ ] Desktop adaptado (não apenas mobile)

### Design System
- [ ] Usa tokens CSS (não cores hardcoded)
- [ ] Border radius consistente (4/8/12/9999)
- [ ] Tipografia segue padrão (16px body, 24px h1, etc.)
- [ ] Spacing segue múltiplos de 4px

### Acessibilidade
- [ ] Contraste de cor suficiente (WCAG AA)
- [ ] Focus-visible rings presentes
- [ ] ARIA labels em ícones e botões sem texto
- [ ] `prefers-reduced-motion` respeitado
- [ ] Zoom não desabilitado (`user-scalable=no` ausente)

### Interação
- [ ] Animações 150-300ms
- [ ] Loading states implementados (skeleton/spinner)
- [ ] Toast de sucesso/erro para ações
- [ ] Ações destrutivas usam `useConfirm()` (não `confirm()` nativo)

### Código
- [ ] Nenhum `confirm()` nativo
- [ ] Nenhum `alert()` nativo
- [ ] Nenhum `window.location.reload()`
- [ ] Nenhum `useToast()` local (usar global)
- [ ] Formulários usam react-hook-form + Zod

---

## 7. Integração com Outros Agentes

| Agente | Relação |
|--------|---------|
| **Frontend/Mobile Engineer** | Complementar: Frontend implementa, UX/UI define padrões e audita |
| **QA / Validation Engineer** | Parceria: QA valida funcionalidade, UX/UI valida experiência |
| **Product Owner** | Alinhamento: PO define requisitos, UX/UI prototipa solução |
| **Platform Architect** | Consultivo: decisões de arquitetura de componentes |
| **Documentation / Knowledge Steward** | Documentação de decisões de design |

---

## 8. Próximos Passos

1. ✅ **Criar agente no harness** — concluído
2. ✅ **Definir plano de atuação** — este documento
3. 🔄 **Executar FLY-017** — Auditoria inicial do design system
4. ⏳ **Executar FLY-018** — Mapear 87 gaps de UX
5. ⏳ **Executar FLY-019** — Criar quality gate visual
6. ⏳ **Atacar FLY-007** — Fechar 30% dos gaps de UX
7. ⏳ **Auditar acessibilidade** nas 5 páginas principais

---

*Documento criado em: 2026-05-11*
*Versão: 1.0*
