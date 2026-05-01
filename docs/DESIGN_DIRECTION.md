# FlyDea — Direção de Redesign Premium

> **Data:** 2026-04-30  
> **Propósito:** Definir a nova direção visual do produto. Mobile-first, iPhone 16, estética Apple + shadcn.

---

## 1. PRINCÍPIOS VISUAIS

### 1.1 Minimalismo Premium
- **Menos é mais:** Cada tela deve ter no máximo 3 hierarquias visuais
- **Respiração:** Espaçamento generoso entre elementos (mínimo 16px entre cards)
- **Foco:** Um call-to-action primário por tela
- **Tipografia limpa:** Inter para corpo, Manrope para headings. Sem mais de 3 tamanhos por tela.

### 1.2 Paleta Refinada

**Modo Claro (base atual, refinada):**
```
Background: #FFFFFF (branco puro)
Surface:     #F9FAFB (quase branco)
Card:        #FFFFFF com shadow-md
Primary:     #8A05BE (roxo premium — manter)
Text:        #111827 (high emphasis)
Text muted:  #6B7280 (medium emphasis)
Border:      #E5E7EB (sutil)
```

**Modo Escuro:**
```
Background: #0A0A0B (preto premium, não cinza)
Surface:     #121214
Card:        #1A1A1D
Primary:     #D585FA (lilás — já definido)
Text:        #F5F5F7
Text muted:  #98989D
Border:      #2C2C30
```

> **Mudança:** Fundo escuro deve ser preto premium (#0A0A0B), não o roxo-acinzentado atual (#151218). A cor atual tem um tom púrpura que compete com o primary.

### 1.3 Tipografia
```
Display (hero): Manrope 800, 32px/40px tracking-tight
H1:            Manrope 700, 24px/32px
H2:            Manrope 600, 20px/28px
Body:          Inter 400, 16px/24px
Caption:       Inter 500, 13px/18px uppercase tracking-wider
```

### 1.4 Sombras (Apple-style — suaves, difusas)
```css
--shadow-card:   0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
--shadow-dialog: 0 25px 50px -12px rgba(0,0,0,0.15);
--shadow-nav:    0 -1px 0 rgba(0,0,0,0.05);
```

### 1.5 Border Radius
```
Input/Button:  12px (rounded-xl — mais macio que 8px)
Card:          16px (rounded-2xl)
Dialog:        24px (rounded-3xl no topo do mobile)
Badge/Pill:    9999px (rounded-full)
```

---

## 2. PADRÕES DE COMPONENTES

### 2.1 Cards
```
Card padrão:
- bg-surface-container-lowest (claro) / bg-[#1A1A1D] (escuro)
- rounded-2xl (16px)
- shadow-card (sutil)
- padding: 20px (p-5)
- Sem border (no-line rule)
- Hover: shadow-dialog (elevação sutil)
- Transição: 300ms ease
```

### 2.2 Botões
```
Primary:
- bg-primary text-on-primary
- rounded-xl (12px)
- h-12 (48px) para mobile
- font-semibold text-[15px]
- hover: brightness-110
- active: scale-[0.98]
- focus-visible: ring-2 ring-primary/40 ring-offset-2

Secondary:
- bg-surface-container-high text-on-surface
- hover: bg-surface-container-highest

Destructive:
- bg-tertiary-container text-on-tertiary-container
- NUNCA usar bg-red-500 direto

Ghost:
- transparent, hover: bg-surface-container-low
```

### 2.3 Inputs
```
- bg-surface-container-high
- rounded-xl (12px)
- h-12 min (48px touch target)
- px-4, text-[16px] (previne zoom no iOS)
- focus: bg-surface-container-lowest, ring-2 ring-primary/20
- placeholder: text-on-surface-variant/50
- label: text-[13px] uppercase tracking-wider text-on-surface-variant mb-1.5
```

### 2.4 Dialogs (Mobile)
```
- h-[100dvh], w-full
- rounded-t-3xl (topo), bottom flat
- bg-background
- Header: sticky top-0, bg-background/80 backdrop-blur-xl
- Close: min-w-[44px] min-h-[44px] absolute top-4 right-4
- Drag indicator: barra cinza 36x5px no topo centralizado
- Swipe: threshold 100px para fechar
- Conteúdo: pt-16 (espaço pro header), px-5
```

### 2.5 Bottom Navigation
```
- h-[calc(3.5rem+env(safe-area-inset-bottom))]
- bg-background/80 backdrop-blur-xl
- border-t border-outline/10
- 5 itens: ícone 24px + label 10px
- Active: text-primary, ícone preenchido
- Inactive: text-on-surface-variant/60
- Central (+): bg-primary, text-white, rounded-full, shadow-lg
```

---

## 3. TELAS QUE PRECISAM SER REFEITAS

### 3.1 Prioridade Crítica
| Tela | Problema | Ação |
|------|----------|------|
| **Dashboard** | Card "Saldo Geral" destoa dos outros, gráfico sem label Y, overflow de informações | Redesenhar com hierarquia clara: Saldo (hero) → Resumo (3 cards) → Alertas (lista) → Gráfico (compacto) |
| **Movimentações** | Formulário grande (12 campos) sem sections visuais, tabela mesclada com cards | Separar claramente: mobile = cards, desktop = tabela. Agrupar form em 3 sections com divider |
| **Orçamentos** | Cards sem hierarquia clara, barra de progresso inconsistente | Progress bar Apple-style (thin, rounded), alerta visual sutil |
| **Relatórios** | Pie chart labels sobrepostos, gráfico de barras sem contexto | Pie: legend externa. Bar: tooltip rico. Ambos: compactos no mobile |

### 3.2 Prioridade Alta
| Tela | Problema | Ação |
|------|----------|------|
| **Contas** | Botões de ação pequenos, cores duras | Touch targets 44px, cores mais suaves, archive visual |
| **Recorrências** | Lista densa, botões colados | Cards individuais com spacing 16px, ações em dropdown |
| **Contas a Pagar** | Seções sem diferenciação visual forte | Headers com cor de fundo, badges de status |
| **Fechamento** | Botões de período overflow | Carrossel horizontal ou tabs |

---

## 4. MICRO-INTERAÇÕES

- **Hover em cards:** scale(1.01), shadow transition 300ms ease
- **Botão click:** scale(0.97) → scale(1) com spring
- **Toast entrada:** slideInFromTop + fade, 300ms
- **Dialog entrada:** slideInFromBottom + fade, 400ms spring
- **Page transition:** fade 200ms (não slide — cansa no mobile)
- **Loading skeleton:** pulse suave, não piscante
- **Números:** countUp animation (já existe `useCountUp`)

---

## 5. O QUE REMOVER (Anti-Patterns)

| Remover | Motivo | Substituir por |
|---------|--------|---------------|
| `bg-red-500` direto | Hardcoded, não adapta tema | `bg-tertiary` ou `text-tertiary` |
| `bg-amber-500` direto | Idem | Token de warning (a criar) |
| `window.location.reload()` | Perda de estado | `router.refresh()` |
| `confirm()` nativo | Quebra design system | `useConfirm()` hook |
| `alert()` nativo | Idem (já removido ✅) | `useToast()` |
| `any` em tipos | Perda de type safety | Tipos corretos do Prisma |
| Labels inline (não acima) | Mobile ruim | Labels acima do input |
| Múltiplos CTAs por tela | Confusão visual | 1 primary, resto secondary/ghost |

---

*Este documento define a direção. Toda nova tela ou componente deve seguir estes padrões.*
