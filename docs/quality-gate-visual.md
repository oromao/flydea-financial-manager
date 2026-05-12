# Quality Gate Visual — Checklist para PRs

**FLY-019** | **Owner:** UX/UI Designer & Researcher | **Data:** 2026-05-11

---

## Quando Usar

Todo PR que altera **UI, CSS, componentes, layouts ou adiciona novas páginas** deve passar pelo quality gate visual antes do merge.

O responsável pode ser:
- O próprio autor (self-review guiado)
- O UX/UI Designer & Researcher (revisão dedicada)
- O Frontend/Mobile Engineer (revisão pareada)

---

## Checklist de Revisão Visual

### 1. Layout & Responsividade

- [ ] **Testado em viewport 390x844** (iPhone 16) — a interface não quebra
- [ ] **Safe-area-insets respeitadas** — conteúdo não fica atrás do notch ou bottom bar
- [ ] **Touch targets ≥ 44x44px** — todos os botões, ícones clicáveis e inputs atendem o mínimo
- [ ] **Bottom nav max 5 itens** — se alterou navegação, respeita o limite
- [ ] **Desktop adaptado** — não é apenas mobile esticado (se aplicável)
- [ ] **Conteúdo não transborda** — sem overflow horizontal inesperado
- [ ] **Keyboard não cobre botões** — formulários com submit visível ao abrir teclado

### 2. Design System & Tokens

- [ ] **Usa tokens CSS** — nenhuma cor hardcoded (hex, rgba) em classes Tailwind
- [ ] **Border radius consistente** — usa `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px) ou `rounded-full`
- [ ] **Tipografia segue padrão** — `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl` (24px)
- [ ] **Spacing segue múltiplos de 4px** — `p-2` (8px), `p-4` (16px), `p-6` (24px), `gap-4`, etc.
- [ ] **Sem `!important` desnecessário** — exceto em @media print e prefers-reduced-motion
- [ ] **Sem `font-size` inline** — exceto em templates de email

### 3. Acessibilidade (WCAG 2.1 AA)

- [ ] **Contraste de cor suficiente** — texto sobre fundo tem contraste ≥ 4.5:1
- [ ] **Focus-visible rings presentes** — todo elemento interativo tem `focus-visible:ring-2`
- [ ] **ARIA labels em ícones** — todo ícone sem texto tem `aria-label` ou `sr-only`
- [ ] **prefers-reduced-motion respeitado** — animações são desligadas se o usuário preferir
- [ ] **Zoom não desabilitado** — sem `user-scalable=no` ou `maximum-scale=1`
- [ ] **Touch-action: manipulation** — em botões e links para evitar delay de 300ms

### 4. Interação & Feedback

- [ ] **Animações 150-300ms** — transições não são muito lentas nem instantâneas
- [ ] **Loading states implementados** — skeleton para página, spinner para ações
- [ ] **Toast de sucesso/erro** — toda ação do usuário tem feedback visual
- [ ] **Ações destrutivas usam `useConfirm()`** — nunca `confirm()` nativo
- [ ] **Animações GPU-accelerated** — usar `transform` e `opacity`, evitar `width/height/top/left`

### 5. Código & Boas Práticas

- [ ] **Sem `confirm()` nativo** — zero ocorrências de `window.confirm()` ou `confirm(`
- [ ] **Sem `alert()` nativo** — zero ocorrências de `window.alert()` ou `alert(`
- [ ] **Sem `window.location.reload()`** — usar router.refresh() ou re-fetch
- [ ] **Sem `useToast()` local** — usar o `useToast()` global de toast.tsx
- [ ] **Formulários usam react-hook-form + Zod** — validação no frontend e backend
- [ ] **Sem CSS inline `style={{...}}`** — exceto para valores dinâmicos (ex: posição, cor condicional)

### 6. Mobile-Specific

- [ ] **Inputs têm `font-size: 16px`** — para evitar zoom automático no iOS
- [ ] **Dialogs são fullscreen no mobile** — `h-[100dvh]` com header sticky
- [ ] **Bottom sheet fecha com swipe** — Framer Motion drag para fechar
- [ ] **Labels acima dos inputs** — nunca ao lado no mobile
- [ ] **Tabelas ocultas no mobile** — usar cards em < 768px

---

## Critérios de Aprovação/Rejeição

### ❌ REJEITADO (volta para ajustes)
Qualquer item **P0** falhando:
- Touch target < 44px
- Cor hardcoded (hex/rgba) em vez de token
- `confirm()` ou `alert()` nativo
- `window.location.reload()`
- `user-scalable=no`
- Safe-area não respeitada
- Layout quebrado em 390x844

### ⚠️ APROVADO COM RESSALVAS
Itens **P1/P2** falhando com justificativa documentada:
- Ex: "rounded-[32px] será migrado para token na próxima sprint"
- Ex: "ARIA label será adicionado em PR separado"

### ✅ APROVADO
Todos os itens aplicáveis do checklist atendidos.

---

## Como Usar no PR

Adicione este checklist ao body do PR quando ele contiver mudanças visuais:

```markdown
## 📱 UI/UX Quality Gate

- [ ] Testado em 390x844
- [ ] Touch targets ≥ 44px
- [ ] Tokens CSS usados (sem hex hardcoded)
- [ ] Acessibilidade OK (contraste, ARIA, focus)
- [ ] useConfirm() usado, não confirm() nativo
- [ ] Loading states implementados
- [ ] Dark mode compatível
```

---

## Exemplo de Uso

**PR**: Corrige header sticky no dialog de movimentações

```markdown
## O que mudou
- Adicionado `sticky top-0` ao header do dialog
- Ajustado z-index para não sobrepor backdrop

## 📱 UI/UX Quality Gate
- [x] Testado em 390x844
- [x] Touch targets ≥ 44px
- [x] Tokens CSS usados (bg-surface-container-lowest, shadow-sm)
- [x] Acessibilidade OK
- [x] useConfirm() mantido (não mexe em confirmação)
- [x] Loading states — não aplicável (só CSS)
- [x] Dark mode testado
```

---

## Integração com CI (Futuro)

Em versões futuras, este quality gate pode ser automatizado:

```bash
# Sugestão de script para CI
npx quality-gate \
  --viewport 390x844 \
  --check-touch-targets \
  --check-hardcoded-colors \
  --check-native-confirm \
  --check-location-reload
```

---

*Documento gerado por: UX/UI Designer & Researcher*
*Data: 2026-05-11*
