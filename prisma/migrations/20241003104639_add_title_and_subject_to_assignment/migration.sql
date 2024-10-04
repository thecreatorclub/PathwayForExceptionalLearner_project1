/*
  Warnings:

  - Added the required column `subject` to the `Assignment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
