import { ITransactionRepository } from '../../domain/transaction/repositories/ITransactionRepository';
import { PrismaTransactionRepository } from '../repositories/PrismaTransactionRepository';
import { CreateTransactionUseCase } from '../../application/transaction/use-cases/CreateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../application/transaction/use-cases/DeleteTransactionUseCase';
import { TransactionController } from '../../presentation/controllers/TransactionController';

/**
 * Dependency Injection Container
 * Centralizes all dependencies and their creation
 */
export class Container {
  private static instance: Container;
  private transactionRepository: ITransactionRepository;

  private constructor() {
    this.transactionRepository = new PrismaTransactionRepository();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  getTransactionRepository(): ITransactionRepository {
    return this.transactionRepository;
  }

  createTransactionUseCase(): CreateTransactionUseCase {
    return new CreateTransactionUseCase(this.transactionRepository);
  }

  deleteTransactionUseCase(isAdmin: boolean = false): DeleteTransactionUseCase {
    return new DeleteTransactionUseCase(this.transactionRepository, isAdmin);
  }

  createTransactionController(userRole: string = 'USER'): TransactionController {
    return new TransactionController(this.transactionRepository, userRole);
  }
}
