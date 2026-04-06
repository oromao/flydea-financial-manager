-- CreateTable "Revenue"
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "emissionDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PARCELADO',
    "status" TEXT NOT NULL DEFAULT 'EMITTED',
    "categoryId" TEXT,
    "observations" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable "RevenueInstallment"
CREATE TABLE "RevenueInstallment" (
    "id" TEXT NOT NULL,
    "revenueId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "receivedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevenueInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Revenue_userId_emissionDate_idx" ON "Revenue"("userId", "emissionDate");

-- CreateIndex
CREATE INDEX "Revenue_userId_status_idx" ON "Revenue"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "RevenueInstallment_revenueId_installmentNumber_key" ON "RevenueInstallment"("revenueId", "installmentNumber");

-- CreateIndex
CREATE INDEX "RevenueInstallment_revenueId_dueDate_idx" ON "RevenueInstallment"("revenueId", "dueDate");

-- CreateIndex
CREATE INDEX "RevenueInstallment_status_dueDate_idx" ON "RevenueInstallment"("status", "dueDate");

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL;

-- AddForeignKey
ALTER TABLE "RevenueInstallment" ADD CONSTRAINT "RevenueInstallment_revenueId_fkey" FOREIGN KEY ("revenueId") REFERENCES "Revenue"("id") ON DELETE CASCADE;
