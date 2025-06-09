/*
  Warnings:

  - You are about to drop the column `dateAdded` on the `admins` table. All the data in the column will be lost.
  - You are about to drop the column `dateUpdated` on the `admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "dateAdded",
DROP COLUMN "dateUpdated";
