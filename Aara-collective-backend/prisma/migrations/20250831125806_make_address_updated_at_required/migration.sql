/*
  Warnings:

  - Made the column `updatedAt` on table `Address` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Address" ALTER COLUMN "updatedAt" SET NOT NULL;
