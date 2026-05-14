# UX/UI Fix Backlog — Flydea Financial Manager

> **Origem:** Auditoria completa 2026-05-14 (navegador real + análise de código)
> **Prioridade:** 🔴 Crítica > 🟡 Alta > 🟢 Média > 🔵 Baixa

---

## 🔴 Fase 1 — Modais e Fluxos Críticos

### Modal de Transação
- [ ] **C01** Fechar modal de "Novo Lançamento" automaticamente após salvar com sucesso
- [ ] **C01-b** Adicionar toast de sucesso "Transação criada com sucesso" após salvar
- [ ] **C01-c** Desabilitar botão "Salvar" durante o envio para evitar duplicidade
- [ ] **F01** Padronizar formato de valor monetário (decidir: vírgula ou ponto, ser consistente)
- [ ] **M04** Garantir que botão "Salvar transação" fique visível com teclado aberto no mobile (keyboard-aware)

### Modal de Orçamento
- [ ] **C04** Adicionar scroll interno no modal "Novo Orçamento" para mobile (390x844)
- [ ] **C04-b** Garantir que botão "Salvar" do orçamento fique sempre visível
- [ ] **C04-c** Fechar modal após salvar com sucesso + toast

### Modal de Editar Transação
- [ ] **C06** Verificar z-index do DialogClose em todos os modais (reincidência QA-04)
- [ ] **C06-b** Garantir que botão "Fechar" não seja interceptado por header sticky
- [ ] **F05** Adicionar validação de categoria obrigatória no formulário

### Modal de Conta
- [ ] **C06-c** Verificar z-index do botão fechar no modal de editar conta
- [ ] **F05-b** Adicionar validação de nome de conta duplicado

### Modal de Excluir
- [ ] **C08** Melhorar confirmação de exclusão com descrição do que será apagado
- [ ] **C08-b** Adicionar nome do item sendo excluído no título do confirm dialog

---

## 🔴 Fase 1b — Segurança

- [ ] **A01** Adicionar role check ADMIN na página `/admin/analytics`
- [ ] **A01-b** Adicionar role check ADMIN em todas as rotas `/admin/*`

---

## 🟡 Fase 2 — Mobile First Real

### Ações Visíveis
- [ ] **M01** Adicionar texto visível nos botões editar/excluir no mobile (tooltip ou label ao lado do ícone)
- [ ] **M01-b** Garantir touch targets de 48px para todas as ações de editar/excluir

### Responsividade
- [ ] **M02** Otimizar largura dos cards de transação no mobile (margem lateral consistente)
- [ ] **M06** Verificar bottom nav em 360px de largura (itens podem apertar)
- [ ] **M07** Ajustar posição do FAB em telas muito pequenas (< 380px)

### Teclado
- [ ] **M04** Keyboard-aware forms: implementar scroll automático quando teclado abre (E19-T2)
- [ ] **M04-b** Testar em todos os modais com formulário

---

## 🟡 Fase 3 — Feedbacks e Estados

### Feedbacks de Ação
- [ ] **C03** Melhorar PageErrorBoundary com botão "Tentar novamente" e mensagem amigável
- [ ] **C03-b** Adicionar toast de sucesso em TODAS as operações (criar, editar, excluir)
- [ ] **C03-c** Adicionar toast de erro com mensagem clara do problema

### Estados Vazios
- [ ] **C02** Adicionar empty state na página de Fechamento quando mês não tiver dados
- [ ] **C02-b** Incluir CTA "Voltar para mês atual" no empty state
- [ ] **C09** Adicionar preview de avatar antes do upload na página de Perfil

### Indicadores Visuais
- [ ] **C05** Adicionar badge/indicador no botão de filtro quando estiver ativo
- [ ] **C05-b** Mostrar texto "Filtrando por: [categoria/data]" na página de movimentações
- [ ] **C09-b** Adicionar indicador de progresso nos orçamentos (% usado)

---

## 🟡 Fase 4 — Formulários e Validação

### Campos Obrigatórios
- [ ] **F02** Adicionar asterisco (*) em todos os campos obrigatórios
- [ ] **F05** Validar categoria como obrigatória no formulário de transação
- [ ] **F07** Garantir que campo "Conta" exista em formulários de transação

### Mensagens de Erro
- [ ] **F03** Posicionar mensagens de erro junto ao campo específico (não apenas no topo)
- [ ] **C07** Melhorar mensagens de erro do login: diferenciar "email não encontrado" de "senha inválida"

### Data
- [ ] **F04** Exibir data no formato pt-BR (DD/MM/AAAA) em vez de ISO
- [ ] **F04-b** Placeholder do input de data em pt-BR

### Esqueci Senha
- [ ] Login: Informar quando email não existe na base (sem revelar se o email existe — segurança vs UX)
- [ ] Login: Adicionar spinner no botão "Entrar" durante requisição

---

## 🟢 Fase 5 — Consistência Visual

### Botões
- [ ] **P07** Unificar altura de botões: definir padrão h-11 para mobile, h-10 para desktop
- [ ] **P01** Igualar altura dos botões "Novo Lançamento" e "Extrato" no dashboard

### Cards e Espaçamento
- [ ] **P02** Padronizar padding interno dos cards de entrada/saída/saldo
- [ ] **P06** Adicionar margem lateral nos cards da previsão semanal no mobile
- [ ] **P05** Unificar distância label→input em todos os formulários (consistente entre modais)

### Inputs
- [ ] **P04** Padronizar padding do prefixo "R$" no input de valor

### Tipografia
- [ ] **P08** Verificar e unificar tamanhos de heading entre páginas
- [ ] Global: Verificar font-size consistente para body text em todas as telas

---

## 🔵 Fase 6 — Refinamentos

### Login
- [ ] Login: Adaptar layout para autofill do navegador (mudança de cor de fundo)
- [ ] Login: Melhorar contraste do link "Esqueci minha senha" no light mode

### Dashboard
- [ ] Dashboard: Repensar texto "este minuto" — mostrar "há X minutos" ou remover
- [ ] Dashboard: Gráfico fluxo mensal com orientação quando vazio

### Geral
- [ ] Global: Limitar caracteres da descrição com contador visível
- [ ] Global: Cores de conta daltônico-friendly (opcional)
- [ ] Menu: Renomear "Painel Geral" para "Dashboard" (consistência com o título)
- [ ] Menu: Renomear "Contas e Cartões" para apenas "Contas" (mais direto)

---

## 🎯 Ordem de Execução Recomendada

### Semana 1 — 🔴 Fase 1: Modais e Segurança
```
C01 → C04 → C06 → C08 → A01
```
Foco: todo modal fecha após salvar, z-index correto, scroll no mobile, admin protegido.

### Semana 2 — 🟡 Fases 2+3: Mobile + Feedbacks
```
M01 → M04 → M02 → C03 → C05 → C02 → F02
```
Foco: ações visíveis no mobile, feedback claro em toda operação, estados vazios com orientação.

### Semana 3 — 🟡 Fase 4: Formulários
```
F01 → F05 → F03 → F04 → C07
```
Foco: validação consistente, mensagens de erro claras, formato monetário e data pt-BR.

### Semana 4 — 🟢+🔵 Fases 5+6: Consistência + Refinamentos
```
P07 → P02 → P05 → P08 → demais ajustes de alinhamento e microcopy
```
Foco: aparência profissional e consistente em todas as telas.

---

## 📊 Esforço Estimado

| Fase | Tasks | Esforço Estimado |
|------|-------|-----------------|
| 🔴 Fase 1 — Modais críticos | ~10 tasks | 2-3 dias |
| 🟡 Fase 2 — Mobile first | ~6 tasks | 2 dias |
| 🟡 Fase 3 — Feedbacks | ~8 tasks | 1-2 dias |
| 🟡 Fase 4 — Formulários | ~8 tasks | 2 dias |
| 🟢 Fase 5 — Consistência visual | ~7 tasks | 1-2 dias |
| 🔵 Fase 6 — Refinamentos | ~8 tasks | 1 dia |
| **Total** | **~47 tasks** | **~10-12 dias** |
