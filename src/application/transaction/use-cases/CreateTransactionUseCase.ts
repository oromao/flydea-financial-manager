import { Transaction } from '../../../domain/transaction/entities/Transaction';
import { ITransactionRepository } from '../../../domain/transaction/repositories/ITransactionRepository';
import { UserId } from '../../../domain/shared/value-objects/UserId';
import { TransactionType } from '../../../domain/transaction/value-objects/TransactionType';
import { PaymentStatus } from '../../../domain/transaction/value-objects/PaymentStatus';
import { Money } from '../../../domain/shared/value-objects/Money';
import { ValidationError } from '../../../domain/shared/errors/DomainError';
import { CreateTransactionDTO } from '../dtos/CreateTransactionDTO';
import { TransactionDTO } from '../dtos/TransactionDTO';
import { TransactionMapper } from '../mappers/TransactionMapper';
import { v4 as uuidv4 } from 'uuid';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(userId: string, dto: CreateTransactionDTO): Promise<TransactionDTO> {
    try {
      const userIdVO = UserId.create(userId);
      const type = TransactionType.create(dto.type);
      const amount = Money.create(dto.amount);
      const paymentStatus = PaymentStatus.create(dto.paymentStatus);

      const transaction = Transaction.create(
        uuidv4(),
        userIdVO,
        type,
        dto.description,
        amount,
        dto.categoryId,
        new Date(dto.date),
        paymentStatus
      );

      await this.transactionRepository.save(transaction);

      return TransactionMapper.toDTO(transaction);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError('Erro ao criar transação');
    }
  }
}
