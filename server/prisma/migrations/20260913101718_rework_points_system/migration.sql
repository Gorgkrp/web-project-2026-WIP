-- AlterTable
ALTER TABLE `mealrequest` ADD COLUMN `pickedUpAt` DATETIME(3) NULL,
    ADD COLUMN `reviewDeadline` DATETIME(3) NULL,
    ADD COLUMN `reviewPenaltyApplied` BOOLEAN NOT NULL DEFAULT false;
