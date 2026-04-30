export const mockOcrResult = {
  amount: 150.00,
  date: "2026-04-25",
  description: "Netflix",
  category: "Subscription",
  extractedText: "R$ 150,00 Netflix",
};

export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  return Promise.resolve("R$ 150,00 Netflix assinatura mensal");
}

export async function parseReceipt(text: string): Promise<typeof mockOcrResult> {
  const amountMatch = text.match(/R\$\s*([\d.,]+)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(",", ".")) : 0;
  
  return {
    amount,
    date: new Date().toISOString().split("T")[0],
    description: "Receipt",
    category: "Other",
    extractedText: text,
  };
}

export async function extractInstallments(text: string): Promise<{ total: number; quantity: number; installmentAmount: number } | null> {
  const match = text.match(/(\d+)x.*R\$\s*([\d.,]+)/);
  if (!match) return null;
  
  const quantity = parseInt(match[1]);
  const installmentAmount = parseFloat(match[2].replace(",", "."));
  
  return {
    total: quantity * installmentAmount,
    quantity,
    installmentAmount,
  };
}

export const ocrService = {
  extractTextFromImage,
  parseReceipt,
  extractInstallments,
};