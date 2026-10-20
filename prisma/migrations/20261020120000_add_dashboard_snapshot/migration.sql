-- CreateTable
CREATE TABLE "DashboardSnapshot" (
    "key" TEXT NOT NULL,
    "data" JSONB,
    "refreshedAt" TIMESTAMP(3),
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "lastError" TEXT,

    CONSTRAINT "DashboardSnapshot_pkey" PRIMARY KEY ("key")
);
