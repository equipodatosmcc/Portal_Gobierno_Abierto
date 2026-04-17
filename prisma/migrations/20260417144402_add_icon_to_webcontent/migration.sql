/*
  Warnings:

  - Added the required column `updatedAt` to the `ContactForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "WebContent" ADD COLUMN     "icon" TEXT;
