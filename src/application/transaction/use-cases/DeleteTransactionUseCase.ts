import { ITransactionRepository } from '../../../domain/transaction/repositories/ITransactionRepository';
import { UserId } from '../../../domain/shared/value-objects/UserId';
import { ForbiddenError, NotFoundError } from '../../../domain/shared/errors/DomainError';

export class DeleteTransactionUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private isAdmin: boolean = false
  ) {}

  async execute(userId: string, transactionId: string): Promise<void> {
    const userIdVO = UserId.create(userId);
    const transaction = await this.transactionRepository.findById(transactionId);

    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }

    // Check ownership - user can delete their own transactions, admin can delete any
    if (!transaction.isOwnedBy(userIdVO) && !this.isAdmin) {
      throw new ForbiddenError('Você não tem permissão para deletar esta transação');
    }

    await this.transactionRepository.delete(transactionId);
  }
}
