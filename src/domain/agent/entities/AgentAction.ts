export enum ActionType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  IN_APP_NOTIFICATION = "IN_APP_NOTIFICATION",
  WEBHOOK = "WEBHOOK",
}

export class AgentAction {
  readonly id: string;
  readonly agentId: string;
  readonly type: ActionType;
  readonly recipient: string | null;
  readonly template: string | null;
  readonly order: number;
  readonly createdAt: Date;

  constructor(
    id: string,
    agentId: string,
    type: ActionType,
    recipient: string | null,
    template: string | null,
    order: number,
    createdAt: Date
  ) {
    this.id = id;
    this.agentId = agentId;
    this.type = type;
    this.recipient = recipient;
    this.template = template;
    this.order = order;
    this.createdAt = createdAt;
  }

  static create(
    id: string,
    agentId: string,
    type: string,
    recipient: string | null,
    template: string | null,
    order: number
  ): AgentAction {
    const validType = Object.values(ActionType).includes(type as ActionType);
    if (!validType) {
      throw new Error(`Invalid action type: ${type}`);
    }
    return new AgentAction(
      id,
      agentId,
      type as ActionType,
      recipient,
      template,
      order,
      new Date()
    );
  }
}
