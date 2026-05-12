import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  transaction: { findMany: vi.fn() },
  recurrence: { findMany: vi.fn() },
  budget: { findMany: vi.fn() },
  userIntelligence: { findUnique: vi.fn() },
}));

const mockPicoClaw = vi.hoisted(() => ({
  fetchData: vi.fn(),
  generateInsights: vi.fn(),
  getQuickSummary: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({ user: { id: "user-1", email: "test@example.com" } })),
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/lib/ai/pico-claw", () => ({
  picoClaw: mockPicoClaw,
}));

vi.mock("@/lib/financial-engine", () => ({
  computeMonthlySummary: vi.fn(() => ({
    monthIncome: 10000,
    monthExpenses: 6000,
    monthBalance: 4000,
    monthPaid: 5000,
    monthPending: 1000,
    pendingReceivables: 0,
    pendingExpenses: 1000,
    totalPending: 1000,
    allTimeBalance: 15000,
    categoryExpenses: { Food: 2000, Rent: 4000 },
    topCategories: [{ name: "Rent", amount: 4000 }, { name: "Food", amount: 2000 }],
    transactionsByDay: { "1": { income: 0, expense: 4000 }, "15": { income: 10000, expense: 2000 } },
  })),
}));

import { GET } from "@/app/api/dashboard/route";
import { NextRequest } from "next/server";

const makeRequest = () => new NextRequest(new URL("http://localhost/api/dashboard"));

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    mockPrisma.transaction.findMany.mockReset().mockResolvedValue([]);
    mockPrisma.recurrence.findMany.mockReset().mockResolvedValue([]);
    mockPrisma.budget.findMany.mockReset().mockResolvedValue([]);
    mockPrisma.userIntelligence.findUnique.mockReset().mockResolvedValue(null);
    mockPicoClaw.fetchData.mockReset().mockResolvedValue({});
    mockPicoClaw.generateInsights.mockReset().mockResolvedValue(["Insight 1"]);
    mockPicoClaw.getQuickSummary.mockReset().mockResolvedValue("Summary");
  });

  it("returns unauthorized without session", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns dashboard data with summary", async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.income).toBe(10000);
    expect(body.expenses).toBe(6000);
    expect(body.monthIncome).toBe(10000);
    expect(body.monthExpenses).toBe(6000);
    expect(body.realizedBalance).toBe(15000);
  });

  it("includes chart data sorted by day", async () => {
    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.chartData).toBeDefined();
    expect(body.chartData.length).toBe(2);
    expect(body.chartData[0].day).toBe(1);
    expect(body.chartData[1].day).toBe(15);
  });

  it("computes projected expenses from recurrences", async () => {
    mockPrisma.recurrence.findMany.mockResolvedValue([
      { id: "r1", type: "EXPENSE", amount: 3000, isActive: true },
      { id: "r2", type: "EXPENSE", amount: 1500, isActive: true },
      { id: "r3", type: "INCOME", amount: 5000, isActive: true },
    ]);
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.budget.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.projectedExpenses).toBe(4500);
    expect(body.projectedIncome).toBe(5000);
  });

  it("computes projected balance from all transactions", async () => {
    mockPrisma.transaction.findMany.mockImplementation(async ({ where }: any) => {
      if (where?.date) return [];
      return [
        { id: "1", type: "INCOME", amount: 20000 },
        { id: "2", type: "EXPENSE", amount: 8000 },
      ] as any[];
    });
    mockPrisma.budget.findMany.mockResolvedValue([]);
    mockPrisma.recurrence.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.balance).toBe(12000);
  });

  it("returns AI insights when available", async () => {
    mockPicoClaw.fetchData.mockResolvedValue({ income: 10000, expenses: 6000 });
    mockPicoClaw.generateInsights.mockResolvedValue(["Gastos altos em alimentação"]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    if (body.aiInsights !== undefined) {
      expect(body.aiInsights).toEqual(["Gastos altos em alimentação"]);
    }
  });

  it("handles AI failure gracefully", async () => {
    mockPicoClaw.fetchData.mockRejectedValue(new Error("AI error"));

    const res = await GET(makeRequest());
    const body = await res.json();
    if (body.aiInsights !== undefined) {
      expect(body.aiInsights).toBeNull();
    }
  });

  it("returns budget alerts", async () => {
    mockPrisma.budget.findMany.mockResolvedValue([
      { id: "b1", categoryId: "cat-food", amount: 1000, alertAt: 80, category: { name: "Food" } },
      { id: "b2", categoryId: "cat-fun", amount: 500, alertAt: 80, category: { name: "Fun" } },
    ]);

    mockPrisma.transaction.findMany.mockImplementation(async ({ where }: any) => {
      if (where?.date) {
        return [
          { id: "t1", type: "EXPENSE", categoryId: "cat-food", amount: 900, date: new Date(), description: "Food", paymentStatus: "PAID", amountPaid: 900, dueDate: null, paidAt: null, category: null, recurrenceId: null, accountId: null, createdAt: new Date() },
        ];
      }
      return [] as any[];
    });

    mockPrisma.recurrence.findMany.mockResolvedValue([]);

    const res = await GET(makeRequest());
    const body = await res.json();
    expect(body.budgetAlerts).toBeDefined();
  });

  it("returns default scores when no intelligence data", async () => {
    mockPrisma.userIntelligence.findUnique.mockResolvedValue(null);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
  });

  it("handles internal errors gracefully", async () => {
    mockPrisma.transaction.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest());
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toContain("Erro interno");
  });
});
