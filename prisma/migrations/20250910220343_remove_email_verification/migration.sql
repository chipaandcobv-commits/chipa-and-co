/*
  Warnings:

  - You are about to drop the column `emailVerificationExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerificationExpires",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "isEmailVerified";
