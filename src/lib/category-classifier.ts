import { ExtractedDocumentData } from "./document-parser";

export interface ClassificationResult {
  transactionType: "INCOME" | "EXPENSE" | "TRANSFER" | "UNKNOWN";
  categoryName: string;
  paymentStatus: "PAID" | "PENDING" | "OVERDUE" | "UNKNOWN";
  confidence: number;
  reasoning: string[];
}

type CategoryType = "INCOME" | "EXPENSE" | "TRANSFER";

const CATEGORY_RULES: Array<{
  keywords: string[];
  category: string;
  type: CategoryType;
}> = [
  { keywords: ["ifood", "restaurante", "lanchonete", "pizzaria", "hamburguer", "delivery", "burger king", "mc donald", "padaria"], category: "Alimentação", type: "EXPENSE" },
  { keywords: ["supermercado", "mercado", "walmart", "carrefour", "extra", "paes", "pão de açucar", "atacado", "atacadão"], category: "Alimentação", type: "EXPENSE" },
  { keywords: ["posto", "combustível", "gasolina", "álcool", "diesel", "s10", "etanol", "shell", "petrobras", "ipiranga"], category: "Combustível", type: "EXPENSE" },
  { keywords: ["farmácia", "drogaria", "medicamento", "remédio", "drugstore"], category: "Saúde", type: "EXPENSE" },
  { keywords: ["médico", "médica", "hospital", "clínica", "consultório", "saúde", "unimed", "laboratório", "exame"], category: "Saúde", type: "EXPENSE" },
  { keywords: ["escola", "universidade", "curso", "educação", "faculdade", "colégio", "mensalidade escolar"], category: "Educação", type: "EXPENSE" },
  { keywords: ["aluguel", "locação", "imobiliária", "imovel", "inquilino", "fiador"], category: "Aluguel", type: "EXPENSE" },
  { keywords: ["energia", "elétrica", "cpfl", "enel", "celesc", "copel", "light", "cemig"], category: "Energia", type: "EXPENSE" },
  { keywords: ["água", "saneamento", "sabesp", "corsan", "agua", "esgoto"], category: "Água", type: "EXPENSE" },
  { keywords: ["internet", "telefonia", "telecom", "vivo", "claro", "tim", "oi", "teless", "fibra", "banda larga"], category: "Internet/Telefonia", type: "EXPENSE" },
  { keywords: ["contador", "contabilidade", "escritório contábil", "imposto", "das", "gps", "darf"], category: "Impostos/Contabilidade", type: "EXPENSE" },
  { keywords: ["netflix", "spotify", "amazon prime", "disney", "streaming", "assinatura"], category: "Lazer", type: "EXPENSE" },
  { keywords: ["frete", "transportadora", "correios", "sedex", "logística", "uber", "99app", "transporte"], category: "Transporte", type: "EXPENSE" },
  { keywords: ["salário", "folha de pagamento", "holerite", "pro-labore", "pagamento salarial"], category: "Salário", type: "INCOME" },
  { keywords: ["vendas", "venda", "mercadoria", "comercio", "faturamento"], category: "Vendas", type: "INCOME" },
  { keywords: ["serviço", "serviços", "prestação", "hora técnica", "consultoria", "honorários"], category: "Serviços", type: "INCOME" },
  { keywords: ["amazon", "magazine", "lojas american", "casas bahia", "magazine luiza"], category: "Outros", type: "EXPENSE" },
  { keywords: ["pix", "transferencia", "ted", "doc", "depósito"], category: "Outros", type: "TRANSFER" },
  { keywords: ["nota fiscal", "nfe", "nf-e", "emitida contra", "nota eletrônica"], category: "Vendas", type: "INCOME" },
  { keywords: ["recibo de", "recebimento", "recebemos"], category: "Outros", type: "INCOME" },
  { keywords: ["boleto", "fatura", "cobrança", "parcela"], category: "Outros", type: "EXPENSE" },
];

const CNPJ_EMITTERS: Record<string, { category: string; type: CategoryType }> = {
  "07.069.732/0001-90": { category: "Serviços", type: "INCOME" },
  "12.345.678/0001-90": { category: "Vendas", type: "INCOME" },
};

export async function classifyDocument(
  extractedData: ExtractedDocumentData,
  _userId: string,
  _getUserCategories: (userId: string) => Promise<Array<{ id: string; name: string; type: string }>>
): Promise<ClassificationResult> {
  const reasoning: string[] = [];
  let confidence = 0;

  const docType = extractedData.documentType;
  const amount = extractedData.totalAmount;
  const emitterName = extractedData.emitterName?.toLowerCase() || "";
  const emitterDoc = extractedData.emitterDocument || "";
  const description = extractedData.description?.toLowerCase() || "";
  const fullText = extractedData.extractedText.toLowerCase();

  let transactionType: ClassificationResult["transactionType"] = "UNKNOWN";
  let categoryName = "Outros";
  let paymentStatus: ClassificationResult["paymentStatus"] = "UNKNOWN";

  if (docType === "NOTA_FISCAL" || docType === "RECIBO") {
    if (description.includes("emitida contra") || description.includes("nf-e")) {
      transactionType = "INCOME";
      reasoning.push("Documento de receita (nota fiscal emitida)");
    } else {
      transactionType = "EXPENSE";
      reasoning.push("Documento de despesa (nota fiscal)");
    }
  } else if (docType === "BOLETO") {
    if (extractedData.dueDate && new Date(extractedData.dueDate) < new Date()) {
      paymentStatus = "OVERDUE";
      reasoning.push("Boleto vencido");
    } else {
      paymentStatus = "PENDING";
      reasoning.push("Boleto a pagar");
    }
    transactionType = "EXPENSE";
  } else if (docType === "COMPROVANTE") {
    if (amount && amount > 0) {
      transactionType = "EXPENSE";
      paymentStatus = "PAID";
      reasoning.push("Comprovante de pagamento");
    }
  }

  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (emitterName.includes(keyword) || description.includes(keyword) || fullText.includes(keyword)) {
        categoryName = rule.category;
        // Só sobrescreve o tipo se for UNKNOWN ou se for TRANSFER
        if (transactionType === "UNKNOWN" || rule.type === "TRANSFER") {
          transactionType = rule.type;
        }
        confidence = 0.7;
        reasoning.push(`Palavra-chave: ${keyword}`);
        break;
      }
    }
    if (confidence > 0) break;
  }

  if (emitterDoc) {
    const cnpjDigits = emitterDoc.replace(/\D/g, "");
    if (CNPJ_EMITTERS[cnpjDigits]) {
      const knownEmitter = CNPJ_EMITTERS[cnpjDigits];
      categoryName = knownEmitter.category;
      transactionType = knownEmitter.type === "TRANSFER" ? "TRANSFER" : knownEmitter.type;
      confidence = 0.9;
      reasoning.push("CNPJ conhecido");
    }
  }

  if (transactionType === "UNKNOWN") {
    transactionType = amount && amount > 0 ? "EXPENSE" : "UNKNOWN";
  }

  if (paymentStatus === "UNKNOWN") {
    if (extractedData.paymentDate) {
      paymentStatus = "PAID";
      reasoning.push("Pagamento registrado");
    } else if (docType === "BOLETO" || docType === "NOTA_FISCAL") {
      paymentStatus = extractedData.dueDate ? "PENDING" : "UNKNOWN";
    }
  }

  if (confidence < extractedData.confidence) {
    confidence = extractedData.confidence * 0.5;
  }

  if (confidence < 0.3) {
    confidence = 0.3;
    reasoning.push("Fallback: Outros (baixa confiança)");
  }

  return {
    transactionType,
    categoryName,
    paymentStatus,
    confidence,
    reasoning,
  };
}

export function getDefaultCategories(): string[] {
  return [
    "Aluguel",
    "Alimentação",
    "Salário",
    "Transporte",
    "Educação",
    "Lazer",
    "Saúde",
    "Marketing",
    "Vendas",
    "Serviços",
    "Outros",
  ];
}