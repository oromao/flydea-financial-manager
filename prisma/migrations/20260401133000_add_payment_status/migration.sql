-- Add payment status tracking for transactions
ALTER TABLE "Transaction"
ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'PAID';
