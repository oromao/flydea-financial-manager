import { prisma } from "@/lib/prisma";

export interface ChatInteraction {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export class MemoryManager {
  private sessionMemoryLimit = 10;

  /**
   * Loads recent chat history for context.
   * Currently uses an in-memory approach for simplicity but can be 
   * swapped to Redis or encrypted Postgres local state.
   */
  async getRecentContext(userId: string): Promise<ChatInteraction[]> {
    // In a serverless env, we'll fetch from the DB or pass it in the request.
    // For hardening, let's fetch from the AuditLog if specific to AI queries.
    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
        action: "AI_QUERY"
      },
      orderBy: { createdAt: "desc" },
      take: this.sessionMemoryLimit
    });

    return logs.map(l => ({
      role: "user" as const, // Explicitly cast to literal type
      content: l.details || "",
      timestamp: l.createdAt.getTime()
    })).reverse();
  }

  /**
   * Learns from user decision history (Long-term memory).
   */
  async getUserPreferences(userId: string) {
    const intel = await prisma.userIntelligence.findUnique({
      where: { userId }
    });

    const interactions = await prisma.insightInteraction.findMany({
      where: { insight: { userId } },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return {
      riskScore: intel?.riskScore || 50,
      favoriteCategories: this.deriveFavoriteCategories(interactions),
      ignoreList: this.deriveIgnoredTypes(interactions)
    };
  }

  private deriveFavoriteCategories(interactions: any[]): string[] {
    const counts: Record<string, number> = {};
    interactions
      .filter(i => i.interactionType === "ACTED" || i.interactionType === "CLICKED")
      .forEach(i => {
        const cat = i.metadata?.category;
        if (cat) counts[cat] = (counts[cat] || 0) + 1;
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
  }

  private deriveIgnoredTypes(interactions: any[]): string[] {
    const counts: Record<string, number> = {};
    interactions
      .filter(i => i.interactionType === "DISMISSED")
      .forEach(i => {
        const type = i.metadata?.type;
        if (type) counts[type] = (counts[type] || 0) + 1;
      });
    return Object.entries(counts).filter(e => e[1] > 3).map(e => e[0]);
  }
}

export const memoryManager = new MemoryManager();
