import { AgentType } from "../value-objects/AgentType";
import { AgentAction } from "./AgentAction";
import { AgentExecution } from "./AgentExecution";

export class AIAgent {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly description: string | null;
  readonly type: AgentType;
  readonly schedule: string; // Cron expression
  readonly isActive: boolean;
  readonly timezone: string;
  readonly config: Record<string, unknown>;
  readonly actions: AgentAction[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    name: string,
    description: string | null,
    type: AgentType,
    schedule: string,
    isActive: boolean,
    timezone: string,
    config: Record<string, unknown>,
    actions: AgentAction[],
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.name = name;
    this.description = description;
    this.type = type;
    this.schedule = schedule;
    this.isActive = isActive;
    this.timezone = timezone;
    this.config = config;
    this.actions = actions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: string,
    userId: string,
    name: string,
    description: string | null,
    type: AgentType,
    schedule: string,
    isActive: boolean,
    timezone: string,
    config: Record<string, unknown>,
    actions: AgentAction[] = []
  ): AIAgent {
    if (!name || name.trim().length === 0) {
      throw new Error("Agent name cannot be empty");
    }
    if (!schedule || schedule.trim().length === 0) {
      throw new Error("Agent schedule cannot be empty");
    }
    return new AIAgent(
      id,
      userId,
      name,
      description,
      type,
      schedule,
      isActive,
      timezone,
      config,
      actions,
      new Date(),
      new Date()
    );
  }

  static restore(
    id: string,
    userId: string,
    name: string,
    description: string | null,
    type: AgentType,
    schedule: string,
    isActive: boolean,
    timezone: string,
    config: Record<string, unknown>,
    actions: AgentAction[],
    createdAt: Date,
    updatedAt: Date
  ): AIAgent {
    return new AIAgent(
      id,
      userId,
      name,
      description,
      type,
      schedule,
      isActive,
      timezone,
      config,
      actions,
      createdAt,
      updatedAt
    );
  }

  activate(): void {
    (this as any).isActive = true;
  }

  deactivate(): void {
    (this as any).isActive = false;
  }

  updateConfig(config: Record<string, unknown>): void {
    (this as any).config = config;
    (this as any).updatedAt = new Date();
  }

  addAction(action: AgentAction): void {
    this.actions.push(action);
  }

  removeAction(actionId: string): void {
    const index = this.actions.findIndex((a) => a.id === actionId);
    if (index > -1) {
      this.actions.splice(index, 1);
    }
  }
}
