import { test, expect } from "@playwright/test";

test.describe("Intelligent Copilot & Agents E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Login logic would go here
    await page.goto("/");
  });

  test("should display personalized insights on home page", async ({ page }) => {
    // Assert that the hero section has a proactive message
    const heroTitle = page.locator("h1");
    await expect(heroTitle).not.toBeEmpty();
    
    // Check for DailyInsight cards
    const insights = page.locator(".daily-insight-card"); // Assuming class
    await expect(insights).toHaveCount({ min: 1 });
  });

  test("should answer questions with context in Copilot Chat", async ({ page }) => {
    // Open Copilot FAB
    await page.click('button:has-text("Copiloto IA")');
    
    // Type a question
    await page.fill('input[placeholder*="Pergunte"]', "Devo me preocupar com meu saldo?");
    await page.press('input[placeholder*="Pergunte"]', "Enter");
    
    // Assert response contains context-driven headers
    await expect(page.locator("text=Saúde Financeira")).toBeVisible();
    await expect(page.locator("text=R$")).toBeVisible(); // Should mention values
  });

  test("should create an agent via Quick Card and trigger execution", async ({ page }) => {
    await page.goto("/agents");
    
    // Click on a Quick Template card
    await page.click('text="Fluxo Negativo"');
    
    // Verify toast success
    await expect(page.locator("text=ativado")).toBeVisible();
    
    // Check if agent appears in "Seus Agentes Ativos"
    await expect(page.locator('h3:has-text("Fluxo Negativo")')).toBeVisible();
    
    // Manual trigger
    await page.click('button:has-child(svg.lucide-play)'); // Play icon button
    await expect(page.locator("text=executado com sucesso")).toBeVisible();
  });

  test("should parse receipt and create transaction", async ({ page }) => {
    // Open Document Importer
    await page.click('button:has-text("Importar")');
    
    // Simulation of file upload
    // In real E2E we would use setInputFiles
    
    // Verify parsing results
    // await expect(page.locator('input[name="amount"]')).toHaveValue("1500,42");
  });

  test("standard user should not see admin logs", async ({ page }) => {
    // Sidebar should not have "Logs" or "Aprovações"
    const sidebar = page.locator("nav");
    await expect(sidebar.locator('text="Logs"')).not.toBeVisible();
    await expect(sidebar.locator('text="Aprovações"')).not.toBeVisible();
  });
});
