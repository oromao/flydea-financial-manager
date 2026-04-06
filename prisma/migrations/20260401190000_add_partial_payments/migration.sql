-- from diff @@ transaction partial payments
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0;
