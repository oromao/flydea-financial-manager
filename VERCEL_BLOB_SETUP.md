# Vercel Blob - Guia de Configuração

## O Problema

O erro **"Vercel Blob: Access denied, please provide a valid token for this resource"** ocorre quando:

1. O token `BLOB_READ_WRITE_TOKEN` não está configurado no Vercel
2. O token está expirado ou sem permissões
3. A URL do Blob é acessada diretamente sem autenticação

## Solução Implementada

O sistema agora usa **endpoints proxy** para acessar arquivos do Vercel Blob com autenticação automática:

- `/api/image-proxy` - Para carregar imagens (avatares)
- `/api/blob-download` - Para download de comprovantes

Esses endpoints injetam o token automaticamente, então o navegador não precisa de acesso direto.

## Como Configurar no Vercel

### 1. Gerar Token do Vercel Blob

**No Dashboard do Vercel:**

1. Acesse: https://vercel.com/account/tokens
2. Clique em "Create Token"
3. Scope: "Full Access" (recomendado)
4. Copie o token gerado

### 2. Adicionar ao Seu Projeto

**No Dashboard do Vercel:**

1. Vá para seu projeto Flydea
2. Settings → Environment Variables
3. Adicione as variáveis:
   ```
   BLOB_READ_WRITE_TOKEN=seu_token_aqui
   VERCEL_BLOB_READ_WRITE_TOKEN=seu_token_aqui
   ```

### 3. Redeploy

```bash
git push
# ou force redeploy na UI do Vercel
```

### 4. Verificar

Vá para a página de Perfil e tente carregar avatar - deve funcionar agora!

## Configuração Local (Desenvolvimento)

Para testar localmente:

```bash
# Crie .env.local
BLOB_READ_WRITE_TOKEN=seu_token_aqui
VERCEL_BLOB_READ_WRITE_TOKEN=seu_token_aqui
DATABASE_URL=sua_url_database
NEXTAUTH_SECRET=seu_secret
NEXTAUTH_URL=http://localhost:3000
```

Depois rode:
```bash
npm run dev
```

## Como Usar o Sistema

### Upload de Avatar
1. Perfil → Trocar foto
2. Sistema envia para Vercel Blob
3. URL salva no banco de dados
4. Proxy `/api/image-proxy` cuida da autenticação

### Upload de Comprovantes
1. Movimentações → Upload de arquivo
2. Sistema envia para Vercel Blob
3. URL salva com a transação
4. Proxy `/api/blob-download` permite download seguro

### Endpoints Proxy

**Image Proxy (para imagens)**
```
GET /api/image-proxy?url=https://...blob.vercelusercontent.com/...
```

Retorna: Imagem com headers corretos

**Blob Download (para downloads)**
```
GET /api/blob-download?url=https://...&filename=documento.pdf
```

Retorna: Arquivo para download com Content-Disposition

## Troubleshooting

### Erro: "Token not valid"
- ✅ Verifique se o token foi copiado corretamente
- ✅ Verifique espaços em branco
- ✅ Gere um novo token

### Erro: "Access denied"
- ✅ Token configurado? Verifique Vercel Dashboard
- ✅ Variáveis de ambiente propagadas? Aguarde redeploy
- ✅ Token expirado? Gere um novo

### Imagens não carregam
- ✅ Verifique se `/api/image-proxy` existe
- ✅ Verifique permissões do token
- ✅ Veja logs do Vercel: `vercel logs`

### Downloads não funcionam
- ✅ Verifique se `/api/blob-download` existe
- ✅ URL do blob é válida? Teste em outro navegador
- ✅ Autenticação OK? Faça login primeiro

## Segurança

### ✅ Protegido por:
- NextAuth - só usuários autenticados acessam
- Servidor passa o token - cliente não o vê
- Token não exposto na URL do cliente

### ❌ Evite:
- Expor token em variáveis de cliente (`NEXT_PUBLIC_`)
- Usar token em cookies
- Permitir acesso sem autenticação

## API Reference

### GET /api/image-proxy

**Parâmetros:**
- `url` (required): URL completa do arquivo no Vercel Blob

**Retorno:**
- Imagem com headers de cache (3600s)
- Content-Type detectado automaticamente

**Exemplo:**
```html
<img src="/api/image-proxy?url=https://abc123.blob.vercelusercontent.com/avatar.jpg" />
```

### GET /api/blob-download

**Parâmetros:**
- `url` (required): URL completa do arquivo
- `filename` (optional): Nome do arquivo para download

**Retorno:**
- Arquivo com header Content-Disposition
- Token injetado automaticamente para blobs Vercel

**Exemplo:**
```html
<a href="/api/blob-download?url=https://abc.../comprovante.pdf&filename=recibo.pdf">
  Download
</a>
```

## Logs

Para debugar, verifique:

```bash
# Local
npm run dev
# Verifique console do navegador e terminal

# Produção
vercel logs <seu-projeto>
# Procure por: "Image proxy error" ou "Blob download error"
```

## Próximas Melhorias

- [ ] Cache de imagens otimizado
- [ ] Retry automático para falhas
- [ ] Suporte para outros provedores (AWS S3, etc)
- [ ] Admin panel para gerenciar blobs

## Referências

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [NextAuth Security](https://next-auth.js.org/getting-started/introduction)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**Status:** ✅ Funcionando
**Última atualização:** 2026-04-19
**Versão:** 1.0
