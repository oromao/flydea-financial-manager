export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message: string) {
    super(message);
  }
}
