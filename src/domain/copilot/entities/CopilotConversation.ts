import { PageType, PageTypeVO } from "../value-objects/PageType";

export class CopilotMessage {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly sources: string[];
  readonly metrics: Record<string, unknown> | null;
  readonly createdAt: Date;

  constructor(
    id: string,
    role: "user" | "assistant",
    content: string,
    sources: string[],
    metrics: Record<string, unknown> | null,
    createdAt: Date
  ) {
    this.id = id;
    this.role = role;
    this.content = content;
    this.sources = sources;
    this.metrics = metrics;
    this.createdAt = createdAt;
  }
}

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export class CopilotConversation {
  readonly id: string;
  readonly userId: string;
  readonly pageType: PageTypeVO;
  readonly pageContext: Record<string, unknown> | null;
  readonly messages: CopilotMessage[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(
    id: string,
    userId: string,
    pageType: PageTypeVO,
    pageContext: Record<string, unknown> | null,
    messages: CopilotMessage[],
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.userId = userId;
    this.pageType = pageType;
    this.pageContext = pageContext;
    this.messages = messages;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    id: string,
    userId: string,
    pageType: PageType,
    pageContext: Record<string, unknown> | null = null
  ): CopilotConversation {
    return new CopilotConversation(
      id,
      userId,
      PageTypeVO.create(pageType),
      pageContext,
      [],
      new Date(),
      new Date()
    );
  }

  static restore(
    id: string,
    userId: string,
    pageType: PageTypeVO,
    pageContext: Record<string, unknown> | null,
    messages: CopilotMessage[],
    createdAt: Date,
    updatedAt: Date
  ): CopilotConversation {
    return new CopilotConversation(
      id,
      userId,
      pageType,
      pageContext,
      messages,
      createdAt,
      updatedAt
    );
  }

  private asMutable(): Mutable<CopilotConversation> {
    return this as unknown as Mutable<CopilotConversation>;
  }

  addMessage(message: CopilotMessage): void {
    this.messages.push(message);
    this.asMutable().updatedAt = new Date();
  }

  getLastMessage(): CopilotMessage | null {
    return this.messages[this.messages.length - 1] || null;
  }

  updatePageContext(context: Record<string, unknown>): void {
    this.asMutable().pageContext = context;
    this.asMutable().updatedAt = new Date();
  }
}
