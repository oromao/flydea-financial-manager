export enum ExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export class AgentExecution {
  readonly id: string;
  readonly agentId: string;
  readonly status: ExecutionStatus;
  readonly output: Record<string, unknown> | null;
  readonly actionResults: Record<string, unknown> | null;
  readonly error: string | null;
  readonly scheduledAt: Date;
  readonly startedAt: Date | null;
  readonly completedAt: Date | null;
  readonly createdAt: Date;

  constructor(
    id: string,
    agentId: string,
    status: ExecutionStatus,
    output: Record<string, unknown> | null,
    actionResults: Record<string, unknown> | null,
    error: string | null,
    scheduledAt: Date,
    startedAt: Date | null,
    completedAt: Date | null,
    createdAt: Date
  ) {
    this.id = id;
    this.agentId = agentId;
    this.status = status;
    this.output = output;
    this.actionResults = actionResults;
    this.error = error;
    this.scheduledAt = scheduledAt;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
  }

  static create(
    id: string,
    agentId: string,
    scheduledAt: Date
  ): AgentExecution {
    return new AgentExecution(
      id,
      agentId,
      ExecutionStatus.PENDING,
      null,
      null,
      null,
      scheduledAt,
      null,
      null,
      new Date()
    );
  }

  private asMutable(): Mutable<AgentExecution> {
    return this as unknown as Mutable<AgentExecution>;
  }

  markRunning(): void {
    this.asMutable().status = ExecutionStatus.RUNNING;
    this.asMutable().startedAt = new Date();
  }

  markSuccess(output: Record<string, unknown>, actionResults: Record<string, unknown>): void {
    this.asMutable().status = ExecutionStatus.SUCCESS;
    this.asMutable().output = output;
    this.asMutable().actionResults = actionResults;
    this.asMutable().completedAt = new Date();
  }

  markFailed(error: string): void {
    this.asMutable().status = ExecutionStatus.FAILED;
    this.asMutable().error = error;
    this.asMutable().completedAt = new Date();
  }
}
