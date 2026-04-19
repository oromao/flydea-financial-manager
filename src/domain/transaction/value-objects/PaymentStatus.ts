import { ValidationError } from '../../shared/errors/DomainError';

export enum PaymentStatusEnum {
  PAID = 'PAID',
  PENDING = 'PENDING',
}

export class PaymentStatus {
  private readonly value: PaymentStatusEnum;

  private constructor(value: PaymentStatusEnum) {
    this.value = value;
  }

  static create(value: string): PaymentStatus {
    if (!Object.values(PaymentStatusEnum).includes(value as PaymentStatusEnum)) {
      throw new ValidationError(`Status de pagamento inválido: ${value}`);
    }

    return new PaymentStatus(value as PaymentStatusEnum);
  }

  static paid(): PaymentStatus {
    return new PaymentStatus(PaymentStatusEnum.PAID);
  }

  static pending(): PaymentStatus {
    return new PaymentStatus(PaymentStatusEnum.PENDING);
  }

  getValue(): PaymentStatusEnum {
    return this.value;
  }

  isPaid(): boolean {
    return this.value === PaymentStatusEnum.PAID;
  }

  isPending(): boolean {
    return this.value === PaymentStatusEnum.PENDING;
  }

  equals(other: PaymentStatus): boolean {
    return this.value === other.value;
  }
}
