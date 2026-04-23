import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntelligentCopilot } from "@/components/copilot/intelligent-copilot";
import "@testing-library/jest-dom";

// Mock Next.js hooks
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/dashboard"),
}));

// Mock toast
vi.mock("@/components/ui/toast", () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock framer-motion (it can cause issues in jsdom)
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("IntelligentCopilot Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear fetch mock
    global.fetch = vi.fn();
    
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("should render the copilot button", () => {
    render(<IntelligentCopilot />);
    // Look for Brain icon or some specific part of the button
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should open the chat when clicked", async () => {
    render(<IntelligentCopilot />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    expect(screen.getByText(/Sou seu copiloto financeiro inteligente/)).toBeInTheDocument();
  });

  it("should send a message and show the response", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: "Aqui está seu saldo de R$ 1000", context: { totalBalance: 1000 } }),
    });

    render(<IntelligentCopilot />);
    fireEvent.click(screen.getByText(/Copiloto/i)); // Open it

    const input = screen.getByPlaceholderText(/Pergunte sobre suas finanças/i);
    fireEvent.change(input, { target: { value: "Qual meu saldo?" } });
    
    const form = screen.getByRole("textbox").closest("form");
    if (!form) throw new Error("Form not found");
    fireEvent.submit(form);

    // User message should appear
    await waitFor(() => {
      expect(screen.getByText("Qual meu saldo?")).toBeInTheDocument();
    });

    // Assistant message should appear after fetch
    await waitFor(() => {
      expect(screen.getByText(/saldo de R\$ 1000/i)).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
