-- AlterTable
ALTER TABLE "ContactForm" ADD COLUMN     "dataset" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'sugerencia';
