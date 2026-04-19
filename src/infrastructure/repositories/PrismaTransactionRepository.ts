import { ITransactionRepository } from '../../domain/transaction/repositories/ITransactionRepository';
import { Transaction } from '../../domain/transaction/entities/Transaction';
import { UserId } from '../../domain/shared/value-objects/UserId';
import { TransactionType } from '../../domain/transaction/value-objects/TransactionType';
import { PaymentStatus } from '../../domain/transaction/value-objects/PaymentStatus';
import { Money } from '../../domain/shared/value-objects/Money';
import { prisma } from '../../lib/prisma';
import { NotFoundError } from '../../domain/shared/errors/DomainError';

export class PrismaTransactionRepository implements ITransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    const record = await prisma.transaction.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByIdAndUserId(id: string, userId: UserId): Promise<Transaction | null> {
    const record = await prisma.transaction.findFirst({
      where: { id, userId: userId.getValue() },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByUserId(userId: UserId): Promise<Transaction[]> {
    const records = await prisma.transaction.findMany({
      where: { userId: userId.getValue() },
      orderBy: { date: 'desc' },
    });
    return records.map(record => this.toDomain(record));
  }

  async findByUserIdAndPeriod(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const records = await prisma.transaction.findMany({
      where: {
        userId: userId.getValue(),
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });
    return records.map(record => this.toDomain(record));
  }

  async save(transaction: Transaction): Promise<void> {
    await prisma.transaction.create({
      data: {
        id: transaction.getId(),
        userId: transaction.getUserId().getValue(),
        type: transaction.getType().getValue(),
        description: transaction.getDescription(),
        amount: transaction.getAmount().getValue(),
        categoryId: transaction.getCategoryId(),
        date: transaction.getDate(),
        dueDate: transaction.getDueDate(),
        paidAt: transaction.getPaidAt(),
        amountPaid: transaction.getAmountPaid().getValue(),
        paymentStatus: transaction.getPaymentStatus().getValue(),
        accountId: transaction.getAccountId() || null,
        attachmentUrl: transaction.getAttachmentUrl() || null,
      },
    });
  }

  async update(transaction: Transaction): Promise<void> {
    await prisma.transaction.update({
      where: { id: transaction.getId() },
      data: {
        type: transaction.getType().getValue(),
        description: transaction.getDescription(),
        amount: transaction.getAmount().getValue(),
        categoryId: transaction.getCategoryId(),
        date: transaction.getDate(),
        dueDate: transaction.getDueDate(),
        paidAt: transaction.getPaidAt(),
        amountPaid: transaction.getAmountPaid().getValue(),
        paymentStatus: transaction.getPaymentStatus().getValue(),
        accountId: transaction.getAccountId() || null,
        attachmentUrl: transaction.getAttachmentUrl() || null,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }

  async deleteByIdAndUserId(id: string, userId: UserId): Promise<void> {
    const transaction = await this.findByIdAndUserId(id, userId);
    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }
    await this.delete(id);
  }

  private toDomain(record: any): Transaction {
    return Transaction.restore(
      record.id,
      UserId.create(record.userId),
      TransactionType.create(record.type),
      record.description,
      Money.create(record.amount),
      record.categoryId,
      record.date,
      PaymentStatus.create(record.paymentStatus),
      Money.create(record.amountPaid),
      record.createdAt,
      record.updatedAt,
      record.dueDate,
      record.paidAt,
      record.accountId,
      record.attachmentUrl
    );
  }
}
