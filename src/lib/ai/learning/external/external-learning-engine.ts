import { webCrawler, Source, RawContent } from "./web-crawler";
import { contentCleaner, CleanedContent } from "./content-cleaner";
import { knowledgeExtractor, ExtractedKnowledge } from "./knowledge-extractor";
import { deduplicator } from "./deduplicator";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

const DAILY_LIMIT = 20;
const CANDIDATES_PER_DAY = 50;

export class ExternalLearningEngine {
  private isRunning = false;

  /**
   * Execute daily learning cycle
   */
  async executeDailyCycle(): Promise<DailyLearningResult> {
    if (this.isRunning) {
      logger.warn("ExternalLearningEngine: Already running, skipping");
      return { success: false, reason: "ALREADY_RUNNING" };
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info("ExternalLearningEngine: Starting daily cycle");

      const sources = await this.fetchSources();
      logger.info("ExternalLearningEngine: Sources fetched", { count: sources.length });

      const rawContents = await this.crawlContents(sources.slice(0, DAILY_LIMIT));
      logger.info("ExternalLearningEngine: Contents crawled", { count: rawContents.length });

      const cleanedContents = this.cleanContents(rawContents);
      logger.info("ExternalLearningEngine: Contents cleaned", { count: cleanedContents.length });

      const extractedCandidates = this.extractKnowledge(cleanedContents);
      logger.info("ExternalLearningEngine: Knowledge extracted", { count: extractedCandidates.length });

      const uniqueCandidates = await this.deduplicate(extractedCandidates);
      logger.info("ExternalLearningEngine: Knowledge deduplicated", { count: uniqueCandidates.length });

      const savedCount = await this.saveCandidates(uniqueCandidates);
      logger.info("ExternalLearningEngine: Candidates saved", { count: savedCount });

      const duration = Date.now() - startTime;

      const result: DailyLearningResult = {
        success: true,
        sourcesAttempted: sources.length,
        sourcesFetched: rawContents.length,
        sourcesCleaned: cleanedContents.length,
        candidatesExtracted: extractedCandidates.length,
        candidatesUnique: uniqueCandidates.length,
        candidatesSaved: savedCount,
        duration,
        summary: {
          totalCandidates: extractedCandidates.length,
          uniqueCandidates: uniqueCandidates.length,
          duplicatesRemoved: extractedCandidates.length - uniqueCandidates.length,
          avgConfidence: uniqueCandidates.length > 0 
            ? uniqueCandidates.reduce((sum, c) => sum + c.confidence, 0) / uniqueCandidates.length 
            : 0,
          byCategory: {}
        }
      };

      logger.info("ExternalLearningEngine: Cycle complete", { 
        success: result.success,
        sourcesFetched: result.sourcesFetched,
        candidatesSaved: result.candidatesSaved 
      });

      return result;
    } catch (error) {
      logger.error("ExternalLearningEngine: Cycle failed", { error });
      return { success: false, reason: "ERROR", error: String(error) };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Fetch relevant sources based on topics
   */
  private async fetchSources(): Promise<Source[]> {
    const topics = webCrawler.getRandomTopics(5);
    const allSources: Source[] = [];

    for (const topic of topics) {
      const sources = await webCrawler.searchSources(topic, 5);
      allSources.push(...sources);
    }

    return [...new Map(allSources.map(s => [s.url, s])).values()];
  }

  /**
   * Crawl multiple sources
   */
  private async crawlContents(sources: Source[]): Promise<RawContent[]> {
    const contents: RawContent[] = [];

    for (const source of sources) {
      try {
        const content = await webCrawler.fetchContent(source.url);
        if (content) {
          contents.push(content);
        }
      } catch (error) {
        logger.warn("ExternalLearningEngine: Failed to crawl", {
          url: source.url,
          error
        });
      }
    }

    return contents;
  }

  /**
   * Clean multiple contents
   */
  private cleanContents(contents: RawContent[]): CleanedContent[] {
    return contents
      .map(c => contentCleaner.clean(c))
      .filter((c): c is CleanedContent => c !== null);
  }

  /**
   * Extract knowledge from cleaned contents
   */
  private extractKnowledge(contents: CleanedContent[]): ExtractedKnowledge[] {
    const candidates: ExtractedKnowledge[] = [];

    for (const content of contents) {
      const extracted = knowledgeExtractor.extract(content);
      if (extracted && extracted.confidence >= 40 && extracted.insights.length > 0) {
        candidates.push(extracted);
      }
    }

    return candidates;
  }

  /**
   * Deduplicate candidates
   */
  private async deduplicate(
    candidates: ExtractedKnowledge[]
  ): Promise<ExtractedKnowledge[]> {
    const unique: ExtractedKnowledge[] = [];

    for (const candidate of candidates) {
      const isDuplicate = await deduplicator.isDuplicate(candidate);
      if (!isDuplicate) {
        unique.push(candidate);
      }
    }

    return deduplicator.deduplicate(unique);
  }

  /**
   * Save candidates to database
   */
  private async saveCandidates(
    candidates: ExtractedKnowledge[]
  ): Promise<number> {
    let saved = 0;

    for (const candidate of candidates.slice(0, CANDIDATES_PER_DAY)) {
      try {
        await prisma.knowledgeCandidate.create({
          data: {
            url: candidate.url,
            domain: candidate.domain,
            title: candidate.title,
            category: candidate.category,
            insights: candidate.insights as any,
            tags: candidate.tags,
            confidence: candidate.confidence,
            content: candidate.content,
            sourceTitle: candidate.sourceTitle,
            sourceDomain: candidate.sourceDomain,
            status: "PENDING"
          }
        });

        saved++;
      } catch (error) {
        logger.warn("ExternalLearningEngine: Failed to save candidate", {
          url: candidate.url,
          error
        });
      }
    }

    return saved;
  }

  /**
   * Get pending candidates
   */
  async getCandidates(status = "PENDING"): Promise<any[]> {
    return prisma.knowledgeCandidate.findMany({
      where: { status },
      orderBy: { confidence: "desc" },
      take: 100
    });
  }

  /**
   * Approve candidate
   */
  async approveCandidate(id: string): Promise<boolean> {
    try {
      const candidate = await prisma.knowledgeCandidate.findUnique({
        where: { id }
      });

      if (!candidate) return false;

      await prisma.knowledgeCandidate.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      logger.info("ExternalLearningEngine: Candidate approved", { id });

      return true;
    } catch (error) {
      logger.error("ExternalLearningEngine: Failed to approve", { id, error });
      return false;
    }
  }

  /**
   * Reject candidate
   */
  async rejectCandidate(id: string): Promise<boolean> {
    try {
      await prisma.knowledgeCandidate.update({
        where: { id },
        data: { status: "REJECTED" }
      });

      logger.info("ExternalLearningEngine: Candidate rejected", { id });

      return true;
    } catch (error) {
      logger.error("ExternalLearningEngine: Failed to reject", { id, error });
      return false;
    }
  }

  /**
   * Get learning statistics
   */
  async getStats(): Promise<LearningStats> {
    const [total, pending, approved, rejected, recent] = await Promise.all([
      prisma.knowledgeCandidate.count(),
      prisma.knowledgeCandidate.count({ where: { status: "PENDING" } }),
      prisma.knowledgeCandidate.count({ where: { status: "APPROVED" } }),
      prisma.knowledgeCandidate.count({ where: { status: "REJECTED" } }),
      prisma.knowledgeCandidate.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        },
        select: { confidence: true }
      })
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      avgConfidence: recent.length > 0
        ? recent.reduce((sum, r) => sum + r.confidence, 0) / recent.length
        : 0
    };
  }
}

export interface DailyLearningResult {
  success: boolean;
  reason?: string;
  error?: string;
  sourcesAttempted?: number;
  sourcesFetched?: number;
  sourcesCleaned?: number;
  candidatesExtracted?: number;
  candidatesUnique?: number;
  candidatesSaved?: number;
  duration?: number;
  summary?: {
    totalCandidates: number;
    uniqueCandidates: number;
    duplicatesRemoved: number;
    avgConfidence: number;
    byCategory: Record<string, number>;
  };
}

export interface LearningStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  avgConfidence: number;
}

export const externalLearningEngine = new ExternalLearningEngine();