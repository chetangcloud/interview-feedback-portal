-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('positive', 'negative');

-- CreateTable
CREATE TABLE "note_suggestions" (
    "id" TEXT NOT NULL,
    "technology_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL,
    "text" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "note_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "note_suggestions_technology_id_category_idx" ON "note_suggestions"("technology_id", "category");

-- AddForeignKey
ALTER TABLE "note_suggestions" ADD CONSTRAINT "note_suggestions_technology_id_fkey" FOREIGN KEY ("technology_id") REFERENCES "technologies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
