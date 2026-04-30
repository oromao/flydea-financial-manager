# FlyDea Financial Manager — Visão do Produto

## Proposta de Valor

Controle financeiro pessoal com clareza absoluta, automação inteligente e experiência premium no mobile. O usuário sabe exatamente quanto pode gastar, o que está atrasado e o que a IA recomenda — sem complexidade desnecessária.

## Usuário Principal

Pessoa física com perfil tech-savvy, usuária de iPhone 16, que:
- Valoriza design premium e experiência consistente
- Quer clareza financeira sem precisar entender termos técnicos
- Aceita automação inteligente que auxilie suas decisões
- É o "dono da conta" — não uma empresa, não um contador

## Dores que Resolve

| Dor | Solução FlyDea |
|-----|---------------|
| "Não sei quanto posso gastar este mês" | **SpendDecisionIndicator** — `computeSpendDecision()` retorna `PODE_GASTAR / ALERTA / NAO_PODE_GASTAR` em tempo real |
| "Perdi o controle das contas a pagar" | **Contas a Pagar** com seções: Atrasadas (dueDate < hoje), Vencem em breve (hoje +7 dias), Sem vencimento |
| "Gastos saem do controle sem aviso" | **Agentes IA** com alertas de despesas anormais, revisão de orçamentos, verificação de receita |
| "Digitar comprovante manualmente é chato" | **OCR + Importação** — Tesseract.js extrai dados, deduplicata por fileHash |
| "Não entendo meus gráficos" | **Dashboard linguagem clara** — "Receita do Mês", "Despesa do Mês", não jargões |

## Diferenciais Competitivos

1. **Spend Decision em tempo real** — `computeSpendDecision()` roda no dashboard e API de decisão
2. **IA local (RAG)** — sem enviar dados para LLMs externas; busca em documentação local via TF-IDF
3. **PicoClaw Engine** — insights baseados em histórico comportamental + `UserIntelligence` profile
4. **Arquitetura limpa real** — domain pure, use cases orquestrando, infra isolada; não é "Next.js jogado"
5. **Foco iPhone 16** — viewport 390x844, safe-area-insets, FAB posicionado corretamente

## Pilares do Produto

1. **Clareza** — termos em português, definições financeiras oficiais documentadas em `docs/DOMAIN_RULES.md`
2. **Controle** — transações, contas, recorrências, orçamentos, fechamento mensal
3. **Automação** — agentes IA, OCR, recorrências geradas via cron
4. **Inteligência** — insights comportamentais, predições, PicoClaw
5. **Premium UX** — design system com tokens, Framer Motion, Tailwind, shadcn/ui

## Princípios de UX

- **Mobile-first sempre** — desktop é derivado, não o oposto
- **"Qualquer um entende sem tutorial"** — zero jargões financeiros desnecessários
- **Feedback imediato** — toast, loading states, confirmações (useConfirm, não `confirm()` nativo)
- **Consistência** — mesmas cores, mesmos componentes, mesmas regras em todo o app
- **Transações nunca se perdem** — AuditLog em toda ação crítica

## O que o Produto Deve Virar

| Deve | Não Deve |
|------|----------|
| Sistema financeiro pessoal premium | ERP ou ferramenta empresarial |
| Foco em mobile (iPhone 16) | Desktop-first com mobile derivado |
| Clareza total nos termos | Jargão financeiro desnecessário |
| Automação útil (IA local) | IA que exponha dados a APIs externas |
| Design consistente e premium | UI inconsistente ou "MVP-polido" |
| Testável e auditável | Código sem cobertura ou sem validação |

## O que o Produto Não Deve Virar

- ❌ Contabilidade para empresas
- ❌ Ferramenta de gestão de projetos
- ❌ Plataforma de investimentos
- ❌ Sistema com múltiplas moedas (apenas BRL por enquanto)
- ❌ App com foco em desktop
- ❌ Produto sem testes ou sem validação de QA

## Visão Premium do Sistema

- Animações sutis (Framer Motion) mas nunca atrapalham a performance
- Cards com profundidade visual (sombras, radius consistentes)
- Glassmorphism pontual (não exagerado)
- Micro-interações: hover states, focus-visible rings, transições de página
- iPhone 16: touch targets mínimos 44px, safe-area-insets respeitados, teclado não cobre botões

---

*Última atualização: 2026-04-30*