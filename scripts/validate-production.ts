import { uploadFileToBlobStorage } from "../src/lib/blob-storage";
import { paddleOCR } from "../src/lib/ocr/paddle-ocr";
import { PicoClawEngine } from "../src/lib/ai/pico-claw";
import { prisma } from "../src/lib/prisma";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function runProductionValidation() {
  console.log("=== VAZAMENTO DE VARIÁVEIS DE AMBIENTE ===");
  console.log("VERCEL_BLOB_TOKEN presente:", !!process.env.VERCEL_BLOB_TOKEN || !!process.env.VERCEL_BLOB_READ_WRITE_TOKEN);
  console.log("RESEND_API_KEY presente:", !!process.env.RESEND_API_KEY);

  console.log("\n=== FASE 1: BLOB (USO REAL) ===");
  try {
    const testContent = Buffer.from("Este é um teste de upload real para auditoria de produção do FlyDea.");
    const blobUrl = await uploadFileToBlobStorage("teste-auditoria-real.txt", testContent, "text/plain");
    console.log("✅ Blob URL gerada:", blobUrl);
  } catch (error: any) {
    console.error("❌ Erro no Blob:", error.message);
  }

  console.log("\n=== FASE 2: OCR HARD MODE ===");
  try {
    const complexText = `
      SUPERMERCADO DIA A DIA
      CNPJ 12.345.678/0001-90
      Emissão: 15/03/2026
      ------------------------------
      Cód.  Descrição   Qtd   V.Unit  V.Total
      001   Arroz 5kg   2     25,00   50,00
      002   Feijão 1kg  3     8,00    24,00
      003   Carne 2kg   1     80,00   80,00
      ------------------------------
      Total Itens: 3
      Valor Total: R$ 154,00
      Dinheiro: R$ 160,00
      Troco: R$ 6,00
      3x de R$ 51,33
    `;
    const buffer = Buffer.from(complexText);
    const result = await paddleOCR.process(buffer, "text/plain");
    console.log("✅ OCR Raw extraído com sucesso.");
    console.log("Structured Data:", result.structured);
  } catch (error: any) {
    console.error("❌ Erro no OCR:", error.message);
  }

  console.log("\n=== FASE 3: IA LONGITUDINAL (PICOCLAW) ===");
  try {
    const engine = new PicoClawEngine();
    const mockUser = {
      userId: "test-user-prod-validation",
      summary: {
        totalBalance: 1000,
        monthlyIncome: 5000,
        monthlyExpenses: 6000,
        netFlow: -1000,
        pendingPayments: 0,
        expensesByCategory: { "Supermercado": 154 }
      }
    };
    
    // First run
    const insights1 = await engine.generateInsights(mockUser);
    console.log("Ciclo 1: Insights gerados:", insights1.map(i => i.title));
    
    // Simular que os insights foram persistidos na base para o mockUser
    console.log("Limpando histórico do test-user...");
    await prisma.insight.deleteMany({ where: { userId: "test-user-prod-validation" } });
    
    await prisma.insight.createMany({
      data: insights1.map(i => ({
        userId: "test-user-prod-validation",
        type: i.title,
        content: i.message,
        priority: i.priority,
        status: "SHOWN"
      }))
    });

    // Second run
    const insights2 = await engine.generateInsights(mockUser);
    console.log("Ciclo 2: Insights gerados (devem excluir os do Ciclo 1):", insights2.map(i => i.title));
    
    // Cleanup
    await prisma.insight.deleteMany({ where: { userId: "test-user-prod-validation" } });
    console.log("✅ IA Longitudinal concluída com sucesso.");
  } catch (error: any) {
    console.error("❌ Erro na IA:", error.message);
  }
}

runProductionValidation().then(() => {
  console.log("\nAuditoria de validação em scripts concluída.");
  process.exit(0);
});
