import { PaddleOCRService } from "../src/lib/ocr/paddle-ocr";
import fs from "fs";
import path from "path";

async function runOCRBenchmark() {
  const service = new PaddleOCRService();
  
  // Simulation of different document types
  const cases = [
    { name: "Textual Data", content: "VALOR TOTAL R$ 1.500,00\nData: 10/10/2026\nEmitente: Teste Corp", mime: "text/plain" },
    { name: "Scanned Mock", content: "MOCK IMAGE CONTENT", mime: "image/jpeg" }
  ];

  console.log("=== OCR BENCHMARK ===");
  
  for (const c of cases) {
    const start = Date.now();
    try {
      // For images, we skip actual Tesseract if not needed in benchmark or mock it
      // But here we want real execution time if possible
      const buffer = Buffer.from(c.content);
      const result = await service.process(buffer, c.mime);
      const duration = Date.now() - start;
      
      console.log(`\nCase: ${c.name}`);
      console.log(`Duration: ${duration}ms`);
      console.log(`Result: ${JSON.stringify(result.structured)}`);
      
      const success = !!(result.structured.amount || result.structured.date);
      console.log(`Success Heuristic: ${success ? "✅" : "❌"}`);
    } catch (error) {
      console.error(`Failed case ${c.name}:`, error);
    }
  }
}

runOCRBenchmark().then(() => process.exit(0));
