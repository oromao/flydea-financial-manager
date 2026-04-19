// Enum para tipos de página onde o copiloto pode ser usado
export enum PageType {
  DASHBOARD = "DASHBOARD",
  ACCOUNTS = "ACCOUNTS",
  TRANSACTIONS = "TRANSACTIONS",
  BUDGETS = "BUDGETS",
  RECURRENCES = "RECURRENCES",
  INSIGHTS = "INSIGHTS",
}

export class PageTypeVO {
  readonly value: PageType;

  private constructor(value: PageType) {
    this.value = value;
  }

  static create(value: string): PageTypeVO {
    const valid = Object.values(PageType).includes(value as PageType);
    if (!valid) {
      throw new Error(`Invalid page type: ${value}`);
    }
    return new PageTypeVO(value as PageType);
  }

  equals(other: PageTypeVO): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
