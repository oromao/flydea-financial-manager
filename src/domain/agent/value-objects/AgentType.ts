export enum AgentTypeEnum {
  BUDGET_REVIEW = "BUDGET_REVIEW",
  EXPENSE_ALERT = "EXPENSE_ALERT",
  INCOME_CHECK = "INCOME_CHECK",
  CASHFLOW_FORECAST = "CASHFLOW_FORECAST",
  SAVINGS_GOAL = "SAVINGS_GOAL",
  CUSTOM = "CUSTOM",
}

export class AgentType {
  readonly value: AgentTypeEnum;

  private constructor(value: AgentTypeEnum) {
    this.value = value;
  }

  static create(value: string): AgentType {
    const valid = Object.values(AgentTypeEnum).includes(value as AgentTypeEnum);
    if (!valid) {
      throw new Error(`Invalid agent type: ${value}`);
    }
    return new AgentType(value as AgentTypeEnum);
  }

  isBudgetReview(): boolean {
    return this.value === AgentTypeEnum.BUDGET_REVIEW;
  }

  isExpenseAlert(): boolean {
    return this.value === AgentTypeEnum.EXPENSE_ALERT;
  }

  isIncomeCheck(): boolean {
    return this.value === AgentTypeEnum.INCOME_CHECK;
  }

  isCashflowForecast(): boolean {
    return this.value === AgentTypeEnum.CASHFLOW_FORECAST;
  }

  isSavingsGoal(): boolean {
    return this.value === AgentTypeEnum.SAVINGS_GOAL;
  }

  equals(other: AgentType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
