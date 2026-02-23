-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('PENDING', 'PROCESSED', 'FLAGGED', 'SAFE', 'REVIEWED');

-- CreateEnum
CREATE TYPE "RiskFlag" AS ENUM ('SAFE', 'RISK');

-- CreateEnum
CREATE TYPE "ReviewDecision" AS ENUM ('VALIDATED', 'REJECTED');

-- CreateTable
CREATE TABLE "supervisors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supervisors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fellows" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fellows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "fellowId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "transcript" TEXT NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "summary" TEXT NOT NULL,
    "contentScore" INTEGER NOT NULL,
    "contentRating" TEXT NOT NULL,
    "contentJustification" TEXT NOT NULL,
    "facilitationScore" INTEGER NOT NULL,
    "facilitationRating" TEXT NOT NULL,
    "facilitationJustification" TEXT NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "safetyRating" TEXT NOT NULL,
    "safetyJustification" TEXT NOT NULL,
    "riskFlag" "RiskFlag" NOT NULL,
    "riskQuote" TEXT,
    "riskExplanation" TEXT,
    "aiModel" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL DEFAULT 'v1',
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "supervisorId" TEXT NOT NULL,
    "decision" "ReviewDecision" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contentOverride" INTEGER,
    "facilitationOverride" INTEGER,
    "safetyOverride" INTEGER,
    "riskOverride" "RiskFlag",
    "note" TEXT,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supervisors_email_key" ON "supervisors"("email");

-- CreateIndex
CREATE INDEX "sessions_fellowId_idx" ON "sessions"("fellowId");

-- CreateIndex
CREATE INDEX "sessions_groupId_idx" ON "sessions"("groupId");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "analyses_sessionId_key" ON "analyses"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_sessionId_key" ON "reviews"("sessionId");

-- CreateIndex
CREATE INDEX "reviews_supervisorId_idx" ON "reviews"("supervisorId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_fellowId_fkey" FOREIGN KEY ("fellowId") REFERENCES "fellows"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "supervisors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
