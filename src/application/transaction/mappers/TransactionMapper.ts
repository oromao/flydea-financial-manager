import { Transaction } from '../../../domain/transaction/entities/Transaction';
import { TransactionDTO } from '../dtos/TransactionDTO';

export class TransactionMapper {
  static toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.getId(),
      userId: transaction.getUserId().getValue(),
      type: transaction.getType().getValue(),
      description: transaction.getDescription(),
      amount: transaction.getAmount().getValue(),
      categoryId: transaction.getCategoryId(),
      date: transaction.getDate().toISOString(),
      dueDate: transaction.getDueDate()?.toISOString(),
      paidAt: transaction.getPaidAt()?.toISOString(),
      amountPaid: transaction.getAmountPaid().getValue(),
      paymentStatus: transaction.getPaymentStatus().getValue(),
      accountId: transaction.getAccountId(),
      attachmentUrl: transaction.getAttachmentUrl(),
      createdAt: transaction.getCreatedAt().toISOString(),
      updatedAt: transaction.getUpdatedAt().toISOString(),
    };
  }
}
