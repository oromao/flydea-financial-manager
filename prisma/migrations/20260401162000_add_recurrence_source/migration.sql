-- Track recurrence origin on generated transactions
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "recurrenceId" TEXT,
ADD COLUMN IF NOT EXISTS "recurrenceDate" TIMESTAMP(3);
