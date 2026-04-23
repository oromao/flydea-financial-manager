# Task: OCR Avançado Open Source
**Domínio:** Processamento de Documentos
**Objetivo:** Implementar pipeline de pré-processamento e extração inteligente.

## Subtasks
- [ ] Integrar `sharp` para pré-processamento (contraste, denoise, grayscale).
- [ ] Implementar detecção de "PDF Escaneado" vs "PDF Texto".
- [ ] Refinar extração de datas e valores com validação cruzada.
- [ ] Criar benchmark de precisão OCR.

**Risco:** Consumo de memória no Vercel (limite 1GB/4GB dependendo do plano).
**Validação:** Testes unitários com fixtures de imagens reais.
