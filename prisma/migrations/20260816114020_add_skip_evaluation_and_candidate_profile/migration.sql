-- AlterEnum
ALTER TYPE "Evaluation" ADD VALUE 'skipped';

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "primary_cloud" TEXT,
ADD COLUMN     "relevant_experience" DOUBLE PRECISION,
ADD COLUMN     "secondary_cloud" TEXT,
ADD COLUMN     "total_it_experience" DOUBLE PRECISION;
