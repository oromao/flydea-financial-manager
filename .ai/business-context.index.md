# Flydea Financial Manager — Business Context

Flydea Financial Manager é um SaaS de finanças pessoais premium, mobile-first, focado no mercado brasileiro. O produto oferece controle financeiro completo com inteligência artificial local, automação e experiência premium.

## Core do Produto

- Gestão de finanças pessoais com múltiplas contas
- Transações com recorrência automática
- Orçamentos com alertas inteligentes
- Fechamento mensal e relatórios financeiros
- Fluxo de caixa com projeções
- IA local (RAG) para insights financeiros — sem enviar dados para LLMs externos
- Motor PicoClaw de insights comportamentais
- OCR para extração de documentos
- Suporte a múltiplos usuários com perfis de acesso
- Design mobile-first para iPhone 16 (390x844)

## Tese Estratégica

O Flydea tem potencial para ser o "cérebro financeiro pessoal" do usuário brasileiro tech-savvy, unindo controle, automação, inteligência local e experiência premium em um único app.

## Mercado

- Mercado brasileiro de finanças pessoais em expansão
- Usuários saindo de planilhas Excel/Google Sheets e apps genéricos
- Demanda por automação inteligente, categorização e relatórios
- Preocupação crescente com privacidade de dados financeiros
- Oportunidade em nicho premium para usuários tech-savvy

## Posicionamento

- SaaS B2C premium
- Mobile-first (iPhone 16)
- Privacidade primeiro — IA local, sem dados na nuvem de terceiros
- Experiência premium com design system próprio
- Produto com forte sensibilidade a usabilidade e performance

## Objetivos

- Atingir 90%+ de cobertura de testes
- Resolver 11 bugs críticos P0
- Fechar 87 gaps de UX
- Expandir automação com mais tipos de agente IA
- Melhorar performance mobile e offline-first
- Fortalecer diferenciais competitivos (Spend Decision, PicoClaw, RAG local)

## Implicações Técnicas

- Privacidade e segurança de dados financeiros são prioridade absoluta
- Clean Architecture + DDD para sustentar evolução do produto
- Cobertura de testes é requisito para deploy
- Performance mobile deve ser prioridade (First Contentful Paint < 1.5s)
- Dados financeiros exigem precisão matemática e auditoria
- LGPD e proteção de dados sensíveis
