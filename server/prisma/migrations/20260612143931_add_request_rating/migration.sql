/*
  Warnings:

  - You are about to drop the column `ratedAt` on the `listing` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `listing` DROP COLUMN `ratedAt`,
    DROP COLUMN `rating`;

-- AlterTable
ALTER TABLE `mealrequest` ADD COLUMN `ratedAt` DATETIME(3) NULL,
    ADD COLUMN `rating` INTEGER NULL;
