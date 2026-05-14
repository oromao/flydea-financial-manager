# Sprint 5 — Onboarding & Retenção

> **Origem:** Brainstorming Estratégico 2026-05-14 (e011-e020)
> **Gap identificado:** Novo usuário não recebe nenhuma orientação ao entrar no app

---

## Problema

Usuário cria conta e cai no dashboard vazio. Sem dados, sem transações, sem orientação. O app não explica o que fazer, como cadastrar uma conta, como criar uma transação, ou como usar os agentes IA.

**Impacto:** Retenção baixa. Usuário abandona antes de entender o valor do produto.

---

## Tasks

### M1-T1 — Tour Guiado para Novos Usuários (P0, Alta)
- **Figma/Design:** Criar overlay de tour com 4-5 passos (1. Dashboard, 2. Contas, 3. Transações, 4. Agentes IA, 5. Relatórios)
- **Implementação:** Componente `OnboardingTour` com Framer Motion + localStorage para "já visto"
- **Trigger:** Primeiro login + usuário com 0 transações
- **Critério de aceite:** Novo usuário vê tour no primeiro login. Pode pular a qualquer momento. Não reaparece.

### M1-T2 — Empty States Explicativos (P1, Média)
- **Cobertura:** Dashboard, Movimentações, Contas, Orçamentos, Relatórios, Agentes, Alertas
- **Design:** Ilustração + texto explicativo + CTA claro (ex: "Nenhuma transação ainda. Crie sua primeira transação.")
- **Critério de aceite:** Toda página sem dados mostra empty state informativo, não "nenhum registro encontrado"

### M1-T3 — CTA "Primeiros Passos" no Dashboard (P1, Baixa)
- **Implementação:** Card colapsível no dashboard para novos usuários com checklist:
  - [ ] Criar uma conta
  - [ ] Adicionar primeira transação
  - [ ] Configurar orçamento
  - [ ] Explorar agentes IA
- **Critério de aceite:** Card só aparece para usuários com < 5 transações. Desaparece ao completar tudo.

### M1-T4 — Seed Data para Demonstração (P1, Média)
- **Implementação:** Ao criar nova conta, opcionalmente gerar 2-3 meses de dados de exemplo (transações, contas, categorias)
- **UX:** "Deseja começar com dados de exemplo?" → Sim/Não
- **Critério de aceite:** Usuário pode experimentar o app completo sem precisar cadastrar dados manuais primeiro

### M1-T5 — PWA Install Prompt (P1, Baixa)
- **Implementação:** Detectar se app é installável e não está instalado. Mostrar banner "Instale o FlyDea para acesso rápido"
- **Trigger:** Após 3 visitas ou 2 dias de uso
- **Critério de aceite:** Banner aparece no timing correto e não incomoda se recusado
