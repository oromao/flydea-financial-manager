import { NextRequest, NextResponse } from 'next/server';
import { CreateTransactionUseCase } from '../../application/transaction/use-cases/CreateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../application/transaction/use-cases/DeleteTransactionUseCase';
import { ITransactionRepository } from '../../domain/transaction/repositories/ITransactionRepository';
import { DomainError } from '../../domain/shared/errors/DomainError';
import { CreateTransactionDTO } from '../../application/transaction/dtos/CreateTransactionDTO';

export class TransactionController {
  constructor(
    private transactionRepository: ITransactionRepository,
    private userRole: string = 'USER'
  ) {}

  async create(
    userId: string,
    dto: CreateTransactionDTO
  ): Promise<NextResponse> {
    try {
      const useCase = new CreateTransactionUseCase(this.transactionRepository);
      const result = await useCase.execute(userId, dto);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete(
    userId: string,
    transactionId: string
  ): Promise<NextResponse> {
    try {
      const isAdmin = this.userRole === 'ADMIN';
      const useCase = new DeleteTransactionUseCase(
        this.transactionRepository,
        isAdmin
      );
      await useCase.execute(userId, transactionId);
      return NextResponse.json({ success: true });
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): NextResponse {
    if (error instanceof DomainError) {
      const statusCode = this.getStatusCode(error.code);
      return NextResponse.json(
        { error: error.message },
        { status: statusCode }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }

  private getStatusCode(code: string): number {
    const statusMap: Record<string, number> = {
      VALIDATION_ERROR: 400,
      NOT_FOUND: 404,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
    };
    return statusMap[code] || 500;
  }
}
