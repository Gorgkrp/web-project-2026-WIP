/*
  Warnings:

  - You are about to drop the column `isBanned` on the `listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `listing` DROP COLUMN `isBanned`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false;
