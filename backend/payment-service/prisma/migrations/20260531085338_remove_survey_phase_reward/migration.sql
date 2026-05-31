/*
  Warnings:

  - The values [survey_allocation] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `phaseId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `rewardId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `surveyId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the `Phase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reward` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Survey` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('card_purchase', 'reward', 'commission', 'allocation', 'release', 'refund');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Phase" DROP CONSTRAINT "Phase_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_userId_fkey";

-- DropForeignKey
ALTER TABLE "Survey" DROP CONSTRAINT "Survey_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_rewardId_fkey";

-- DropIndex
DROP INDEX "Transaction_rewardId_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "phaseId",
DROP COLUMN "rewardId",
DROP COLUMN "surveyId",
ADD COLUMN     "externalRef" TEXT;

-- DropTable
DROP TABLE "Phase";

-- DropTable
DROP TABLE "Reward";

-- DropTable
DROP TABLE "Survey";

-- DropEnum
DROP TYPE "RewardStatus";

-- DropEnum
DROP TYPE "SurveyStatus";
