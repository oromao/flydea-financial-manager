import { Money } from '../../shared/value-objects/Money';
import { UserId } from '../../shared/value-objects/UserId';
import { TransactionType } from '../value-objects/TransactionType';
import { PaymentStatus } from '../value-objects/PaymentStatus';
import { ValidationError } from '../../shared/errors/DomainError';

export class Transaction {
  private id: string;
  private userId: UserId;
  private type: TransactionType;
  private description: string;
  private amount: Money;
  private categoryId: string;
  private date: Date;
  private dueDate?: Date;
  private paidAt?: Date;
  private amountPaid: Money;
  private paymentStatus: PaymentStatus;
  private accountId?: string;
  private attachmentUrl?: string;
  private createdAt: Date;
  private updatedAt: Date;

  private constructor(
    id: string,
    userId: UserId,
    type: TransactionType,
    description: string,
    amount: Money,
    categoryId: string,
    date: Date,
    paymentStatus: PaymentStatus,
    amountPaid: Money,
    createdAt: Date,
    updatedAt: Date,
    dueDate?: Date,
    paidAt?: Date,
    accountId?: string,
    attachmentUrl?: string
  ) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.description = description;
    this.amount = amount;
    this.categoryId = categoryId;
    this.date = date;
    this.dueDate = dueDate;
    this.paidAt = paidAt;
    this.amountPaid = amountPaid;
    this.paymentStatus = paymentStatus;
    this.accountId = accountId;
    this.attachmentUrl = attachmentUrl;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: string,
    userId: UserId,
    type: TransactionType,
    description: string,
    amount: Money,
    categoryId: string,
    date: Date,
    paymentStatus: PaymentStatus
  ): Transaction {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Descrição é obrigatória');
    }

    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Categoria é obrigatória');
    }

    const amountPaid = paymentStatus.isPaid() ? amount : Money.zero();

    return new Transaction(
      id,
      userId,
      type,
      description.trim(),
      amount,
      categoryId,
      date,
      paymentStatus,
      amountPaid,
      new Date(),
      new Date()
    );
  }

  static restore(
    id: string,
    userId: UserId,
    type: TransactionType,
    description: string,
    amount: Money,
    categoryId: string,
    date: Date,
    paymentStatus: PaymentStatus,
    amountPaid: Money,
    createdAt: Date,
    updatedAt: Date,
    dueDate?: Date,
    paidAt?: Date,
    accountId?: string,
    attachmentUrl?: string
  ): Transaction {
    return new Transaction(
      id,
      userId,
      type,
      description,
      amount,
      categoryId,
      date,
      paymentStatus,
      amountPaid,
      createdAt,
      updatedAt,
      dueDate,
      paidAt,
      accountId,
      attachmentUrl
    );
  }

  getId(): string {
    return this.id;
  }

  getUserId(): UserId {
    return this.userId;
  }

  getType(): TransactionType {
    return this.type;
  }

  getDescription(): string {
    return this.description;
  }

  getAmount(): Money {
    return this.amount;
  }

  getCategoryId(): string {
    return this.categoryId;
  }

  getDate(): Date {
    return this.date;
  }

  getDueDate(): Date | undefined {
    return this.dueDate;
  }

  getPaidAt(): Date | undefined {
    return this.paidAt;
  }

  getAmountPaid(): Money {
    return this.amountPaid;
  }

  getPaymentStatus(): PaymentStatus {
    return this.paymentStatus;
  }

  getAccountId(): string | undefined {
    return this.accountId;
  }

  getAttachmentUrl(): string | undefined {
    return this.attachmentUrl;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  markAsPaid(amountPaid: Money, paidAt: Date): void {
    if (!amountPaid.isPositive()) {
      throw new ValidationError('Valor pago deve ser maior que zero');
    }

    this.paymentStatus = PaymentStatus.paid();
    this.amountPaid = amountPaid;
    this.paidAt = paidAt;
    this.updatedAt = new Date();
  }

  markAsPending(): void {
    this.paymentStatus = PaymentStatus.pending();
    this.paidAt = undefined;
    this.amountPaid = Money.zero();
    this.updatedAt = new Date();
  }

  update(
    description: string,
    amount: Money,
    categoryId: string,
    date: Date,
    dueDate?: Date,
    accountId?: string,
    attachmentUrl?: string
  ): void {
    if (!description || description.trim().length === 0) {
      throw new ValidationError('Descrição é obrigatória');
    }

    if (!categoryId || categoryId.trim().length === 0) {
      throw new ValidationError('Categoria é obrigatória');
    }

    this.description = description.trim();
    this.amount = amount;
    this.categoryId = categoryId;
    this.date = date;
    this.dueDate = dueDate;
    this.accountId = accountId;
    this.attachmentUrl = attachmentUrl;
    this.updatedAt = new Date();
  }

  isOwnedBy(userId: UserId): boolean {
    return this.userId.equals(userId);
  }
}
