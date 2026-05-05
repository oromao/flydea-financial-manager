import { logger } from "@/lib/logger";

export interface Source {
  url: string;
  domain: string;
  name: string;
  category: string;
  trustScore: number;
}

const FINANCIAL_SOURCES: Source[] = [
  {
    url: "https://www.bcb.gov.br",
    domain: "bcb.gov.br",
    name: "Banco Central do Brasil",
    category: "OFICIAL",
    trustScore: 100
  },
  {
    url: "https://www.gov.br/fazenda",
    domain: "gov.br/fazenda",
    name: "Ministério da Fazenda",
    category: "OFICIAL",
    trustScore: 100
  },
  {
    url: "https://www.serasa.com.br/blog",
    domain: "serasa.com.br",
    name: "Serasa",
    category: "SCORE",
    trustScore: 90
  },
  {
    url: "https://blog.meubolso.com.br",
    domain: "blog.meubolso.com.br",
    name: "Meu Bolso",
    category: "EDUCACIONAL",
    trustScore: 80
  },
  {
    url: "https://www.bv.com.br/blog",
    domain: "bv.com.br",
    name: "BV",
    category: "BANK",
    trustScore: 85
  },
  {
    url: "https://www.itau.com.br/blog",
    domain: "itau.com.br",
    name: "Itaú",
    category: "BANK",
    trustScore: 85
  },
  {
    url: "https://www.nubank.com.br/blog",
    domain: "nubank.com.br",
    name: "Nubank",
    category: "FINTECH",
    trustScore: 90
  },
  {
    url: "https://www.xpinc.com.br/blog",
    domain: "xpinc.com.br",
    name: "XP",
    category: "INVESTIMENTO",
    trustScore: 85
  },
  {
    url: "https://www.btgpactual.com/blog",
    domain: "btgpactual.com",
    name: "BTG Pactual",
    category: "INVESTIMENTO",
    trustScore: 80
  },
  {
    url: "https://www.infomoney.com.br",
    domain: "infomoney.com.br",
    name: "InfoMoney",
    category: "MÍDIA",
    trustScore: 75
  },
  {
    url: "https://www.seudinheiro.com",
    domain: "seudinheiro.com",
    name: "Seu Dinheiro",
    category: "MÍDIA",
    trustScore: 70
  },
  {
    url: "https://www.flamengo.com.br/blog",
    domain: "flamengo.com.br",
    name: "Investimentos",
    category: "EDUCACIONAL",
    trustScore: 65
  },
  {
    url: "https://www.kaggle.com/datasets",
    domain: "kaggle.com",
    name: "Kaggle",
    category: "DATA",
    trustScore: 80
  },
  {
    url: "https://www.reclameaqui.com.br",
    domain: "reclameaqui.com.br",
    name: "Reclame Aqui",
    category: "REPUTACAO",
    trustScore: 60
  },
  {
    url: "https://www.e-investing.com.br",
    domain: "e-investing.com.br",
    name: "E-Investing",
    category: "EDUCACIONAL",
    trustScore: 70
  }
];

const SEARCH_TOPICS = [
  "controle financeiro pessoal",
  "como organizar finanças",
  "dívidas cartão crédito",
  "score crédito sérasa",
  "como melhorar score",
  "investimento renda fixa",
  "reserva emergência",
  "orçamento mensal",
  " Ends <",
  "educação financeira",
  "poupança investimentos",
  "juros compostos",
  "dívida bola neve",
  "planejamento financeiro",
  "contabilidade básica"
];

const BLOCKED_DOMAINS = new Set([
  "spam",
  "ads",
  "clickbait",
  "fake news",
  "pirata",
  "warez",
  "crack",
  "adult",
  "gambling"
]);

export class WebCrawler {
  private maxContentSize = 50 * 1024;
  private timeout = 10000;
  private maxRetries = 2;

  /**
   * Search for relevant content based on topics
   */
  async searchSources(topic: string, limit = 5): Promise<Source[]> {
    const sources = FINANCIAL_SOURCES.filter(s => {
      const trustThreshold = s.category === "OFICIAL" ? 70 : s.trustScore >= 75;
      if (!trustThreshold) return false;
      return true;
    });

    return sources.slice(0, limit);
  }

  /**
   * Fetch content from a URL
   */
  async fetchContent(url: string, retries = 0): Promise<RawContent | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FlyDeaBot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn("WebCrawler: HTTP error", { url, status: response.status });
        return null;
      }

      const html = await response.text();

      if (html.length > this.maxContentSize) {
        logger.warn("WebCrawler: Content too large", { url, size: html.length });
        return null;
      }

      const domain = new URL(url).hostname;

      return {
        url,
        domain,
        html,
        content: "",
        title: "",
        fetchedAt: new Date()
      };
    } catch (error: any) {
      if (retries < this.maxRetries && error.name === "AbortError") {
        logger.info("WebCrawler: Retrying", { url, retries: retries + 1 });
        return this.fetchContent(url, retries + 1);
      }

      logger.error("WebCrawler: Fetch error", { url, error: error.message });
      return null;
    }
  }

  /**
   * Get random search topics for daily learning
   */
  getRandomTopics(count: number): string[] {
    const shuffled = [...SEARCH_TOPICS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Check if domain is allowed
   */
  isDomainAllowed(domain: string): boolean {
    const lower = domain.toLowerCase();
    return !Array.from(BLOCKED_DOMAINS).some(blocked => lower.includes(blocked));
  }
}

export interface RawContent {
  url: string;
  domain: string;
  html: string;
  content: string;
  title: string;
  fetchedAt: Date;
}

export const webCrawler = new WebCrawler();