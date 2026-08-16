-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('structured', 'freehand');

-- AlterTable
ALTER TABLE "interview_technologies" ADD COLUMN     "freehand_notes" TEXT;

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "mode" "InterviewMode" NOT NULL DEFAULT 'structured';
