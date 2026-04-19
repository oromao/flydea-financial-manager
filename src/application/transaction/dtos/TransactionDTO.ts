export interface TransactionDTO {
  id: string;
  userId: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  categoryId: string;
  date: string;
  dueDate?: string;
  paidAt?: string;
  amountPaid: number;
  paymentStatus: 'PAID' | 'PENDING';
  accountId?: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}
