import { Transaction } from '../entities/Transaction';
import { UserId } from '../../shared/value-objects/UserId';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByIdAndUserId(id: string, userId: UserId): Promise<Transaction | null>;
  findByUserId(userId: UserId): Promise<Transaction[]>;
  findByUserIdAndPeriod(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByIdAndUserId(id: string, userId: UserId): Promise<void>;
}
