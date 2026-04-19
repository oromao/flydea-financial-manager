#!/usr/bin/env node

/**
 * Configure Vercel Environment Variables via API
 * Usage: node scripts/configure-vercel.js <VERCEL_TOKEN> <PROJECT_ID>
 */

const https = require('https');

function makeRequest(method, path, data, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseData));
        } catch {
          resolve(responseData);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function configureVercel() {
  const vercelToken = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!vercelToken) {
    console.error('❌ Erro: VERCEL_TOKEN não está definido');
    console.error('Use: export VERCEL_TOKEN=<seu-token>');
    console.error('Gere em: https://vercel.com/account/tokens');
    process.exit(1);
  }

  if (!projectId) {
    console.error('❌ Erro: VERCEL_PROJECT_ID não está definido');
    console.error('Encontre em: https://vercel.com/dashboard');
    process.exit(1);
  }

  console.log('🔐 Configurando variáveis de ambiente no Vercel...\n');

  const envVars = {
    DATABASE_URL: 'postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    DIRECT_URL: 'postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require',
    NEXTAUTH_URL: 'https://flydea-financial-manager.vercel.app',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || generateSecret(),
  };

  try {
    for (const [key, value] of Object.entries(envVars)) {
      console.log(`⏳ Adicionando ${key}...`);

      const result = await makeRequest(
        'POST',
        `/v9/projects/${projectId}/env`,
        {
          key: key,
          value: value,
          target: ['production', 'preview', 'development']
        },
        vercelToken
      );

      if (result.error) {
        console.error(`  ❌ Erro: ${result.error.message}`);
      } else {
        console.log(`  ✅ ${key} configurada!`);
      }
    }

    console.log('\n✅ Variáveis de ambiente configuradas!');
    console.log('🚀 Próximo passo: Clique em Redeploy no Vercel Dashboard');
    console.log('   https://vercel.com/dashboard');
  } catch (error) {
    console.error('❌ Erro ao configurar:', error.message);
    process.exit(1);
  }
}

function generateSecret() {
  return require('crypto').randomBytes(32).toString('base64');
}

configureVercel();
