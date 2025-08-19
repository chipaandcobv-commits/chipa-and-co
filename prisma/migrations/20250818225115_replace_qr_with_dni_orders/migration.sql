/*
  Warnings:

  - You are about to drop the column `isScanned` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `qrCode` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `scannedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `scannedBy` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `QRScan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[dni]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientDni` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dni` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QRScan" DROP CONSTRAINT "QRScan_orderId_fkey";

-- DropForeignKey
ALTER TABLE "QRScan" DROP CONSTRAINT "QRScan_userId_fkey";

-- DropIndex
DROP INDEX "Order_qrCode_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "isScanned",
DROP COLUMN "qrCode",
DROP COLUMN "scannedAt",
DROP COLUMN "scannedBy",
ADD COLUMN     "clientDni" TEXT NOT NULL DEFAULT '00000000',
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dni" TEXT NOT NULL DEFAULT '00000000';

-- Update existing users with unique DNI values
UPDATE "User" SET "dni" = CONCAT('USER', id) WHERE "dni" = '00000000';

-- Update existing orders with a valid client DNI
UPDATE "Order" SET "clientDni" = (SELECT "dni" FROM "User" LIMIT 1) WHERE "clientDni" = '00000000';

-- Remove default values
ALTER TABLE "Order" ALTER COLUMN "clientDni" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "dni" DROP DEFAULT;

-- DropTable
DROP TABLE "QRScan";

-- CreateIndex
CREATE UNIQUE INDEX "User_dni_key" ON "User"("dni");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientDni_fkey" FOREIGN KEY ("clientDni") REFERENCES "User"("dni") ON DELETE CASCADE ON UPDATE CASCADE;
