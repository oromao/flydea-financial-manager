import { ValidationError } from '../errors/DomainError';

export class UserId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): UserId {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError('UserId inválido');
    }

    return new UserId(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
