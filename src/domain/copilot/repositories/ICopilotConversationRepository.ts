import { CopilotConversation, CopilotMessage } from "../entities/CopilotConversation";

export interface ICopilotConversationRepository {
  create(conversation: CopilotConversation): Promise<CopilotConversation>;
  findById(id: string): Promise<CopilotConversation | null>;
  findByUserId(userId: string, limit?: number): Promise<CopilotConversation[]>;
  update(conversation: CopilotConversation): Promise<CopilotConversation>;
  delete(id: string): Promise<void>;
  addMessage(conversationId: string, message: CopilotMessage): Promise<void>;
}
