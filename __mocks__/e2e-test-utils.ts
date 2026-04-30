import { test, expect } from "@playwright/test";

export const waitStrategies = {
  forNavigation: async (page: Page) => {
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  },
  
  forSelector: async (page: Page, selector: string, timeout = 5000) => {
    await page.waitForSelector(selector, { state: "visible", timeout });
  },
  
  forResponse: async (page: Page, urlPattern: string | RegExp) => {
    await page.waitForResponse(urlPattern, { timeout: 10000 });
  },
  
  forApi: async (page: Page, endpoint: string) => {
    await page.waitForResponse(
      response => response.url().includes(endpoint) && response.status() === 200,
      { timeout: 15000 }
    );
  },
  
  forDataLoaded: async (page: Page, containerSelector: string) => {
    await page.waitForSelector(containerSelector);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForFunction(() => {
      const container = document.querySelector(containerSelector);
      return container && container.children.length > 0;
    });
  },
};

export async function waitForPageStable(page: Page, maxWait = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    const loading = await page.locator('[data-loading="true"]').count();
    if (loading === 0) break;
    await page.waitForTimeout(500);
  }
}

export async function retryUntil<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e as Error;
      if (i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  
  throw lastError;
}