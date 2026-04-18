const LABELS: Record<string, string> = {
  type: "Tipo",
  description: "Descrição",
  categoryId: "Categoria",
  amount: "Valor",
  date: "Data",
  dueDate: "Vencimento",
  paidAt: "Data de pagamento",
  frequency: "Frequência",
  paymentStatus: "Status",
  attachmentUrl: "Anexo",
  blobUrl: "Arquivo",
  accountId: "Conta",
  observations: "Observações",
  name: "Nome",
  balance: "Saldo",
  period: "Período",
  alertAt: "Alerta",
};

export function formatZodError(error: unknown): string {
  if (!error) return "Erro desconhecido";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const fieldErrors = (error as Record<string, unknown>).fieldErrors ?? error;
    const msgs: string[] = [];
    for (const [field, errs] of Object.entries(fieldErrors as Record<string, unknown>)) {
      if (Array.isArray(errs) && errs.length > 0) {
        msgs.push(`${LABELS[field] ?? field}: ${errs[0]}`);
      }
    }
    if (msgs.length > 0) return msgs.join(" • ");
  }
  return "Erro ao processar solicitação";
}
