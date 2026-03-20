/*
  Warnings:

  - A unique constraint covering the columns `[unitId]` on the table `Council` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Council` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Council` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CouncilType" AS ENUM ('NATIONAL', 'REGIONAL', 'THEMATIC');

-- CreateEnum
CREATE TYPE "CouncilSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgendaItemStatus" AS ENUM ('OPEN', 'IN_DISCUSSION', 'RESOLVED', 'DEFERRED');

-- CreateEnum
CREATE TYPE "NominationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InternalVoteStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "InternalVoteChoice" AS ENUM ('YES', 'NO', 'ABSTAIN');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('COUNCIL_INTERNAL', 'PUBLIC');

-- CreateEnum
CREATE TYPE "MessageReactionType" AS ENUM ('THUMBS_UP', 'THUMBS_DOWN', 'QUESTION');

-- AlterTable
ALTER TABLE "Council" ADD COLUMN     "scopeDescription" TEXT,
ADD COLUMN     "type" "CouncilType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedByCouncilId" TEXT;

-- CreateTable
CREATE TABLE "CouncilSession" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "status" "CouncilSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "location" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilAgendaItem" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "AgendaItemStatus" NOT NULL DEFAULT 'OPEN',
    "order" INTEGER NOT NULL DEFAULT 0,
    "proposalId" TEXT,
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouncilAgendaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CouncilRepresentative" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "since" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "until" TIMESTAMP(3),

    CONSTRAINT "CouncilRepresentative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateNomination" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "nominatedById" TEXT,
    "voteSessionId" TEXT,
    "status" "NominationStatus" NOT NULL DEFAULT 'PENDING',
    "statement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateNomination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalVote" (
    "id" TEXT NOT NULL,
    "councilId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InternalVoteStatus" NOT NULL DEFAULT 'OPEN',
    "endsAt" TIMESTAMP(3),
    "outcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalBallot" (
    "id" TEXT NOT NULL,
    "internalVoteId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "choice" "InternalVoteChoice" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalBallot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "councilId" TEXT,
    "type" "ChannelType" NOT NULL DEFAULT 'COUNCIL_INTERNAL',
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelMembership" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChannelMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "editedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "internalVoteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageReaction" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MessageReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouncilSession_councilId_scheduledAt_idx" ON "CouncilSession"("councilId", "scheduledAt");

-- CreateIndex
CREATE INDEX "CouncilAgendaItem_sessionId_order_idx" ON "CouncilAgendaItem"("sessionId", "order");

-- CreateIndex
CREATE INDEX "CouncilRepresentative_councilId_idx" ON "CouncilRepresentative"("councilId");

-- CreateIndex
CREATE INDEX "CandidateNomination_councilId_status_idx" ON "CandidateNomination"("councilId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateNomination_councilId_candidateId_voteSessionId_key" ON "CandidateNomination"("councilId", "candidateId", "voteSessionId");

-- CreateIndex
CREATE INDEX "InternalVote_councilId_status_idx" ON "InternalVote"("councilId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InternalBallot_internalVoteId_voterId_key" ON "InternalBallot"("internalVoteId", "voterId");

-- CreateIndex
CREATE INDEX "Channel_councilId_idx" ON "Channel"("councilId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMembership_channelId_userId_key" ON "ChannelMembership"("channelId", "userId");

-- CreateIndex
CREATE INDEX "Message_channelId_createdAt_idx" ON "Message"("channelId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageReaction_messageId_userId_type_key" ON "MessageReaction"("messageId", "userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Council_unitId_key" ON "Council"("unitId");

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilSession" ADD CONSTRAINT "CouncilSession_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilAgendaItem" ADD CONSTRAINT "CouncilAgendaItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CouncilSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilAgendaItem" ADD CONSTRAINT "CouncilAgendaItem_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilRepresentative" ADD CONSTRAINT "CouncilRepresentative_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouncilRepresentative" ADD CONSTRAINT "CouncilRepresentative_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNomination" ADD CONSTRAINT "CandidateNomination_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateNomination" ADD CONSTRAINT "CandidateNomination_voteSessionId_fkey" FOREIGN KEY ("voteSessionId") REFERENCES "VoteSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalVote" ADD CONSTRAINT "InternalVote_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalBallot" ADD CONSTRAINT "InternalBallot_internalVoteId_fkey" FOREIGN KEY ("internalVoteId") REFERENCES "InternalVote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_councilId_fkey" FOREIGN KEY ("councilId") REFERENCES "Council"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembership" ADD CONSTRAINT "ChannelMembership_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMembership" ADD CONSTRAINT "ChannelMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_internalVoteId_fkey" FOREIGN KEY ("internalVoteId") REFERENCES "InternalVote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageReaction" ADD CONSTRAINT "MessageReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
