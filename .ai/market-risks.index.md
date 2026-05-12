# Flydea Financial Manager — Market Risks

## Riscos de Mercado

### Concorrência
- Apps de bancos tradicionais (Nubank, Itaú, Bradesco) evoluindo funcionalidades
- Apps consolidados (Organizze, Mobills, Guiabolso) com base de usuários
- Entrada de players internacionais (Mint alternatives, YNAB)
- **Mitigação**: Diferenciais únicos (Spend Decision, RAG local, PicoClaw)

### Privacidade e Confiança
- Dados financeiros são extremamente sensíveis
- Vazamento destruiria a confiança do usuário
- LGPD exige proteção rigorosa
- **Mitigação**: IA local, mínimo de dados em nuvem, criptografia

### Adoção de Mercado
- Usuário brasileiro médio não tem cultura de finanças pessoais
- Apps financeiros têm alto churn
- Dificuldade de monetização em nicho B2C
- **Mitigação**: Foco em nicho premium tech-savvy, experiência superior

## Riscos Técnicos

### Qualidade e Testes
- 45.87% de cobertura de testes é insuficiente para deploy seguro
- 11 bugs P0 críticos podem comprometer confiança
- 87 gaps de UX podem causar abandono
- **Mitigação**: Roadmap de qualidade, P0 blockers first

### Performance Mobile
- PWA pode ter performance inferior a app nativo
- iPhone 16 como referência exige otimização constante
- **Mitigação**: Monitoramento de Core Web Vitals, lazy loading

### Dependências Externas
- Vercel, Neon, Upstash, Resend — dependência de serviços third-party
- Mudanças de preço ou EOL podem impactar custo
- **Mitigação**: abstração de serviços, fallbacks planejados

### Segurança
- Dados financeiros são alvo de ataques
- NextAuth com credentials provider requer proteção extra
- **Mitigação**: CSP headers, rate limiting, auditoria de acesso
