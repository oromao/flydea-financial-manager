# Auditoria UX/UI — FlyDea Financial Manager
**Data:** 2026-05-12
**Ferramenta:** browser-use (navegador real)
**Usuário:** Augusto Flydea (augusto@flydea.com)

---

## 🔴 CRÍTICOS — Bloqueantes

### C1 – Base UI Error #51 em Contas e Cartões
**Página:** `/contas`
**Problema:** A página exibe "Algo deu errado / Base UI error #51" e um botão "Tentar novamente". A página está completamente quebrada.
**Impacto:** Usuário não consegue acessar contas bancárias e cartões.
**Severidade:** 🔴 Crítico

### C2 – UUID visível em dropdowns de Conta e Categoria
**Páginas afetadas:**
- `/movimentacoes` → Modal "Editar Lançamento" → Campo "Conta" mostra `067801d0-bae4-4fe4-ba5c-3e61f437e776`
- `/orcamentos` → Modal "Novo Orçamento" → Campo "Categoria" mostra `c7a64993-ea44-4585-9c9e-53cd56f0699a`
**Problema:** Usuários veem UUIDs brutos em vez de nomes legíveis.
**Nota:** QA-02 estava marcado como corrigido, mas o bug persiste em budgets e contas.
**Severidade:** 🔴 Crítico

### C3 – Turbopack crash no dev server
**Problema:** `npm run dev` crasha com `FileSystemPath("").join("../Documents/Obsidian Vault/brain") leaves the filesystem root`
**Causa:** Erro no PostCSS/Tailwind v4 ao processar globals.css com `evaluate_webpack_loader`. Path `../Documents/Obsidian Vault/brain` referenciado em algum lugar fora do projeto.
**Impacto:** Dev server local impossível de usar. Build de produção funciona.
**Severidade:** 🔴 Crítico

---

## 🟡 ALTOS — Prejudicam experiência

### A1 – Typo: "Alertas Criticos" (falta acento)
**Página:** `/orcamentos`
**Problema:** "Alertas Criticos" deveria ser "Alertas Críticos"
**Severidade:** 🟡 Alto

### A2 – Typo: "Automacao" (falta acento)
**Página:** `/recorrencias`
**Problema:** Título "Automacao de contas fixas e assinaturas" e modal título "Agendar Automacao" — falta cedilha e acento: "Automação"
**Severidade:** 🟡 Alto

### A3 – Typo: "Novo Lancamento" (falta acento)
**Página:** `/movimentacoes`
**Problema:** Modal título "Novo Lançamento" — falta cedilha no "ç"
**Severidade:** 🟡 Alto

### A4 – Typo: "NOVA RECORRENCIA" (falta acento)
**Página:** `/recorrencias`
**Problema:** Botão e título "NOVA RECORRENCIA" — deveria ser "RECORRÊNCIA" com acento
**Severidade:** 🟡 Alto

### A5 – Sidebar cortada ao scroll
**Problema:** Quando a página tem scroll (ex: Movimentações), os links da sidebar perdem o texto e mostram apenas SVG. Navegação fica comprometida.
**Severidade:** 🟡 Alto

### A6 – Página /insights duplica Dashboard
**Página:** `/insights`
**Problema:** O conteúdo de /insights é idêntico ao Dashboard (/). Espera-se conteúdo analítico diferenciado.
**Severidade:** 🟡 Alto

### A7 – Dropdown de Categoria inconsistente
**Páginas afetadas:**
- Modal "Novo Lançamento": categoria dropdown mostra placeholder "Selecione..."
- Modal "Novo Orçamento": categoria dropdown mostra UUID
- Modal "Nova Recorrência": categoria dropdown mostra "Alimentação" (correto)
- Modal "Editar Lançamento": categoria dropdown mostra "Transporte" (correto), mas Conta mostra UUID
**Problema:** Comportamento inconsistente entre modais — alguns mostram nome, outros UUID, outros placeholder.
**Severidade:** 🟡 Alto

---

## 🟢 MÉDIOS — Melhorias importantes

### M1 – Sidebar não tem link para Relatórios
**Problema:** Sidebar não inclui "Relatórios" embora a página `/relatorios` exista e funcione.
**Severidade:** 🟢 Médio

### M2 – Campos "Vencimento" sem placeholder visível
**Página:** Modal Novo/Editar Lançamento
**Problema:** O campo "Vencimento" tem placeholder `YYYY-MM-DD` genérico, sem formatação pt-BR
**Severidade:** 🟢 Médio

### M3 – Exportar CSV/PDF sem feedback visual
**Página:** `/fechamento`
**Problema:** Botões "Exportar CSV" e "Exportar PDF" não têm feedback de loading ou confirmação
**Severidade:** 🟢 Médio

### M4 – "Confirmar Agendamento" sem confirmação
**Página:** `/recorrencias`
**Problema:** Modal "Agendar Automação" não tem preview/resumo antes de confirmar
**Severidade:** 🟢 Médio

### M5 – Página /login não tem link de cadastro
**Problema:** Não há fluxo de registro/self-signup. Usuário precisa ser criado administrativamente.
**Severidade:** 🟢 Médio (limitação conhecida)

---

## 📱 MOBILE (viewport 390x844 simulado)

### MOB-1 – Sidebar ocupa tela inteira
**Problema:** Sidebar em mobile não é um drawer/drawer navigation — parece ocupar espaço fixo
**Severidade:** 🟡 Alto

### MOB-2 – Cards financeiros sem quebra de linha
**Problema:** Valores negativos longos como "-R$ 16.928,85" podem vazar em telas pequenas
**Severidade:** 🟢 Médio

---

## ✅ O QUE FUNCIONA BEM

- **Login:** Design limpo, campo de mostrar senha, link "Esqueci minha senha"
- **Dashboard:** Cards de saldo, projeção semanal, botão "Novo Lançamento" visível
- **Fluxo de Caixa:** Previsão semanal detalhada, seção de notas de receita
- **Contas a Pagar:** Filtros por vencimento (Todas, Atrasadas, Próximos 7d), campo de busca
- **Fechamento:** Abas por mês, exportação CSV/PDF
- **Perfil:** Upload de foto, formulário de edição
- **Theme toggle:** Dark/Light mode funciona em todas as páginas
- **Modal discard confirmation:** Confirmação "Descartar alterações?" ao fechar modal com dados preenchidos
- **ARIA labels:** Botões de editar/excluir têm aria-labels descritivos

---

## 📊 ESTATÍSTICAS

| Métrica | Valor |
|---------|-------|
| Páginas auditadas | 12/20 (60%) |
| Modais testados | 5 |
| Erros críticos encontrados | 3 |
| Erros altos encontrados | 7 |
| Melhorias médias | 5 |
| Issues mobile | 2 |
| **Total de problemas** | **17** |

---

## 🔗 REFERÊNCIAS

- `docs/KNOWN_ISSUES.md` — QA-02 reaberto (UUID em budgets/contas), QA-04 (modal Fechar)
- `src/app/contas/page.tsx` — Base UI error #51
- Build error: Tailwind CSS v4 + Turbopack — path `../Documents/Obsidian Vault/brain`

---

*Auditoria realizada via browser-use com navegador Chromium headed.*
