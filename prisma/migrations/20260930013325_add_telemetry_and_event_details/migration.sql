-- AlterTable
ALTER TABLE "Device" ADD COLUMN "activityLevel" REAL;
ALTER TABLE "Device" ADD COLUMN "detectorState" TEXT;
ALTER TABLE "Device" ADD COLUMN "rssi" INTEGER;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "details" TEXT;
ALTER TABLE "Event" ADD COLUMN "resolvedAt" DATETIME;
