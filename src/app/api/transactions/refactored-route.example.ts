/**
 * EXAMPLE: Refactored Transaction API Route
 * This shows how to use the Clean Architecture + DDD approach
 *
 * To apply this pattern to actual routes:
 * 1. Extract business logic to Use Cases
 * 2. Use Repository pattern for data access
 * 3. Use Controllers to orchestrate Use Cases
 * 4. Let controllers handle HTTP concerns
 */

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Container } from '@/infrastructure/di/Container';
import { CreateTransactionDTO } from '@/application/transaction/dtos/CreateTransactionDTO';

const container = Container.getInstance();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const dto: CreateTransactionDTO = {
      type: body.type,
      description: body.description,
      amount: body.amount,
      categoryId: body.categoryId,
      date: body.date,
      paymentStatus: body.paymentStatus,
      dueDate: body.dueDate,
      paidAt: body.paidAt,
      accountId: body.accountId,
      attachmentUrl: body.attachmentUrl,
    };

    const controller = container.createTransactionController();
    return await controller.create(session.user.id, dto);
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const isAdmin = session.user.role === 'ADMIN';
    const controller = container.createTransactionController(session.user.role);
    return await controller.delete(session.user.id, id);
  } catch (error) {
    console.error('Error in DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
