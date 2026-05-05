import { RawContent } from "./web-crawler";
import { logger } from "@/lib/logger";

const SCRIPT_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi,
  /<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi,
  /<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi,
  /<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi,
  /<!--[\s\S]*?-->/g
];

const MIN_CONTENT_LENGTH = 200;
const MAX_CONTENT_LENGTH = 15000;
const MIN_PARAGRAPH_LENGTH = 50;

const REMOVE_ELEMENTS = [
  "script",
  "style",
  "nav",
  "footer",
  "header",
  "aside",
  "iframe",
  "noscript",
  "form",
  "button",
  "input",
  "select",
  "textarea"
];

export class ContentCleaner {
  /**
   * Clean HTML and extract text content
   */
  clean(raw: RawContent): CleanedContent | null {
    try {
      let content = raw.html;

      for (const pattern of SCRIPT_PATTERNS) {
        content = content.replace(pattern, "");
      }

      for (const tag of REMOVE_ELEMENTS) {
        const tagRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, "gi");
        content = content.replace(tagRegex, "");
      }

      content = content
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&\w+;/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim();

      const title = this.extractTitle(raw.html);

      if (content.length < MIN_CONTENT_LENGTH) {
        logger.warn("ContentCleaner: Content too short", {
          url: raw.url,
          length: content.length
        });
        return null;
      }

      if (content.length > MAX_CONTENT_LENGTH) {
        content = content.slice(0, MAX_CONTENT_LENGTH);
      }

      const paragraphs = this.extractParagraphs(content);
      const cleanParagraphs = paragraphs.filter(p => p.length >= MIN_PARAGRAPH_LENGTH);

      if (cleanParagraphs.length < 2) {
        logger.warn("ContentCleaner: Not enough valid paragraphs", {
          url: raw.url,
          count: cleanParagraphs.length
        });
        return null;
      }

      return {
        url: raw.url,
        domain: raw.domain,
        title,
        content: cleanParagraphs.join("\n\n"),
        paragraphs: cleanParagraphs.length,
        cleanLength: content.length,
        extractedAt: new Date()
      };
    } catch (error) {
      logger.error("ContentCleaner: Error cleaning content", {
        url: raw.url,
        error
      });
      return null;
    }
  }

  /**
   * Extract title from HTML
   */
  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      return this.decodeHtmlEntities(titleMatch[1].trim());
    }

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
      return this.decodeHtmlEntities(h1Match[1].trim());
    }

    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      return this.decodeHtmlEntities(ogTitleMatch[1].trim());
    }

    return "";
  }

  /**
   * Extract paragraphs from content
   */
  private extractParagraphs(content: string): string[] {
    return content
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Count words in content
   */
  countWords(content: string): number {
    return content.split(/\s+/).filter(w => w.length > 0).length;
  }

  /**
   * Check if content is mostly promotional
   */
  isPromotional(content: string): boolean {
    const promotionalPatterns = [
      /compre agora/i,
      /oferta limitada/i,
      /clique aqui/i,
      /ganhe dinheiro/i,
      /trabalho em casa/i,
      /milionário em/i,
      /resultado garantido/i
    ];

    const matches = promotionalPatterns.filter(pattern => pattern.test(content));
    return matches.length > 1;
  }

  /**
   * Get content preview (first N characters)
   */
  getPreview(content: string, length = 200): string {
    const cleaned = content.replace(/\s+/g, " ").trim();
    if (cleaned.length <= length) return cleaned;
    return cleaned.slice(0, length) + "...";
  }
}

export interface CleanedContent {
  url: string;
  domain: string;
  title: string;
  content: string;
  paragraphs: number;
  cleanLength: number;
  extractedAt: Date;
}

export const contentCleaner = new ContentCleaner();