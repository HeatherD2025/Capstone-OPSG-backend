-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "dateAdded" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dateAdded" SET DATA TYPE DATE;
