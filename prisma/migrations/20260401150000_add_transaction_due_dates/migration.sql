-- Add due date and paid at tracking to transactions
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
