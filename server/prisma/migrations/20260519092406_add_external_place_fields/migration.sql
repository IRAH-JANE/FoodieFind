-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalSource" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateIndex
CREATE INDEX "Restaurant_externalSource_externalId_idx" ON "Restaurant"("externalSource", "externalId");
