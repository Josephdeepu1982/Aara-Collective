/*
  Warnings:

  - You are about to drop the column `customerId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `line1` on the `Address` table. All the data in the column will be lost.
  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentStatus` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Address" DROP CONSTRAINT "Address_customerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_shippingAddressId_fkey";

-- DropIndex
DROP INDEX "public"."Order_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "customerId",
DROP COLUMN "line1",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "postalCode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Order" ALTER COLUMN "shippingAddressId" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "discountCents" DROP DEFAULT,
ALTER COLUMN "shippingCents" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "public"."Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
