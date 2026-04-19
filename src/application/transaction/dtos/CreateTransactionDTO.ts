export interface CreateTransactionDTO {
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  paymentStatus: 'PAID' | 'PENDING';
  dueDate?: string;
  paidAt?: string;
  accountId?: string;
  attachmentUrl?: string;
}
