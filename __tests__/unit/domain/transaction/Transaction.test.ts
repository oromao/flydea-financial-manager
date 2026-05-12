import { describe, it, expect } from "vitest";
import { Transaction } from "@/domain/transaction/entities/Transaction";
import { UserId } from "@/domain/shared/value-objects/UserId";
import { TransactionType } from "@/domain/transaction/value-objects/TransactionType";
import { PaymentStatus } from "@/domain/transaction/value-objects/PaymentStatus";
import { Money } from "@/domain/shared/value-objects/Money";
import { ValidationError } from "@/domain/shared/errors/DomainError";

describe("Transaction entity", () => {
  const makeProps = () => ({
    id: "tx-1",
    userId: UserId.create("user-1"),
    type: TransactionType.create("EXPENSE"),
    description: "Compra no mercado",
    amount: Money.create(150.50),
    categoryId: "cat-1",
    date: new Date(2026, 2, 15),
    paymentStatus: PaymentStatus.create("PAID"),
  });

  describe("create", () => {
    it("creates a valid transaction", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      expect(tx.getId()).toBe("tx-1");
      expect(tx.getDescription()).toBe("Compra no mercado");
      expect(tx.getAmount().getValue()).toBe(150.50);
      expect(tx.getPaymentStatus().isPaid()).toBe(true);
      expect(tx.getAmountPaid().getValue()).toBe(150.50);
    });

    it("sets amountPaid to zero when pending", () => {
      const tx = Transaction.create(
        "tx-2",
        UserId.create("user-1"),
        TransactionType.create("EXPENSE"),
        "Bill",
        Money.create(500),
        "cat-1",
        new Date(),
        PaymentStatus.create("PENDING")
      );
      expect(tx.getAmountPaid().isZero()).toBe(true);
    });

    it("trims description", () => {
      const tx = Transaction.create(
        "tx-1",
        UserId.create("user-1"),
        TransactionType.create("EXPENSE"),
        "  Compras  ",
        Money.create(100),
        "cat-1",
        new Date(),
        PaymentStatus.create("PAID")
      );
      expect(tx.getDescription()).toBe("Compras");
    });

    it("throws on empty description", () => {
      expect(() => Transaction.create(
        "tx-1", makeProps().userId, makeProps().type, "",
        makeProps().amount, "cat-1", new Date(), makeProps().paymentStatus
      )).toThrow(ValidationError);
    });

    it("throws on whitespace-only description", () => {
      expect(() => Transaction.create(
        "tx-1", makeProps().userId, makeProps().type, "   ",
        makeProps().amount, "cat-1", new Date(), makeProps().paymentStatus
      )).toThrow(ValidationError);
    });

    it("throws on empty categoryId", () => {
      expect(() => Transaction.create(
        "tx-1", makeProps().userId, makeProps().type, "Test",
        makeProps().amount, "", new Date(), makeProps().paymentStatus
      )).toThrow(ValidationError);
    });
  });

  describe("restore", () => {
    it("restores a persisted transaction", () => {
      const now = new Date();
      const tx = Transaction.restore(
        "tx-1", UserId.create("user-1"),
        TransactionType.create("EXPENSE"), "Restored",
        Money.create(100), "cat-1", new Date(),
        PaymentStatus.create("PAID"), Money.create(100),
        now, now, new Date(), new Date(), "acc-1", "https://url.com"
      );
      expect(tx.getId()).toBe("tx-1");
      expect(tx.getAccountId()).toBe("acc-1");
      expect(tx.getAttachmentUrl()).toBe("https://url.com");
      expect(tx.getDueDate()).toBeInstanceOf(Date);
      expect(tx.getPaidAt()).toBeInstanceOf(Date);
    });
  });

  describe("markAsPaid", () => {
    it("marks a pending transaction as paid", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      tx.markAsPending();
      expect(tx.getPaymentStatus().isPending()).toBe(true);

      const paidAmount = Money.create(150.50);
      const paidAt = new Date();
      tx.markAsPaid(paidAmount, paidAt);
      expect(tx.getPaymentStatus().isPaid()).toBe(true);
      expect(tx.getAmountPaid().getValue()).toBe(150.50);
      expect(tx.getPaidAt()).toEqual(paidAt);
    });

    it("throws when marking as paid with zero amount", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      expect(() => tx.markAsPaid(Money.zero(), new Date())).toThrow(ValidationError);
    });
  });

  describe("markAsPending", () => {
    it("marks a paid transaction as pending", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      tx.markAsPending();
      expect(tx.getPaymentStatus().isPending()).toBe(true);
      expect(tx.getAmountPaid().isZero()).toBe(true);
      expect(tx.getPaidAt()).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates transaction fields", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      const newDate = new Date(2026, 3, 1);
      tx.update(
        "Updated description",
        Money.create(200),
        "cat-2",
        newDate,
        undefined,
        "acc-2",
        "https://example.com/doc.pdf"
      );
      expect(tx.getDescription()).toBe("Updated description");
      expect(tx.getAmount().getValue()).toBe(200);
      expect(tx.getCategoryId()).toBe("cat-2");
      expect(tx.getDate()).toEqual(newDate);
      expect(tx.getAccountId()).toBe("acc-2");
      expect(tx.getAttachmentUrl()).toBe("https://example.com/doc.pdf");
    });

    it("throws on empty description during update", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      expect(() => tx.update("", Money.create(100), "cat-1", new Date())).toThrow(ValidationError);
    });
  });

  describe("isOwnedBy", () => {
    it("checks ownership correctly", () => {
      const tx = Transaction.create(...Object.values(makeProps()));
      expect(tx.isOwnedBy(UserId.create("user-1"))).toBe(true);
      expect(tx.isOwnedBy(UserId.create("user-2"))).toBe(false);
    });
  });
});
