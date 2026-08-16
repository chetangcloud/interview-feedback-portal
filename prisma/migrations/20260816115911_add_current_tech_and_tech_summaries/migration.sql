-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "current_technology_id" TEXT;

-- CreateTable
CREATE TABLE "interview_technology_summaries" (
    "id" TEXT NOT NULL,
    "interview_id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,
    "summary_text" TEXT NOT NULL,
    "generated_by" TEXT NOT NULL DEFAULT 'ai',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_technology_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_technology_summaries_interview_id_technology_id_key" ON "interview_technology_summaries"("interview_id", "technology_id");

-- AddForeignKey
ALTER TABLE "interview_technology_summaries" ADD CONSTRAINT "interview_technology_summaries_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_technology_summaries" ADD CONSTRAINT "interview_technology_summaries_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
