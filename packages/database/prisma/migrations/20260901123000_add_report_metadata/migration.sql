-- AlterTable
ALTER TABLE "reports"
ADD COLUMN "category" TEXT,
ADD COLUMN "author" TEXT,
ADD COLUMN "cover_image_url" TEXT,
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "reference_date" DATE;

-- CreateTable
CREATE TABLE "report_sources" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_sources_report_id_position_key" ON "report_sources"("report_id", "position");

-- AddForeignKey
ALTER TABLE "report_sources" ADD CONSTRAINT "report_sources_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
