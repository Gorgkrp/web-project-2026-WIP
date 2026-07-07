-- CreateTable
CREATE TABLE `MealRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'PICKED_UP', 'NO_SHOW') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `listingId` INTEGER NOT NULL,
    `requesterId` INTEGER NOT NULL,
    `providerId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MealRequest` ADD CONSTRAINT `MealRequest_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `Listing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealRequest` ADD CONSTRAINT `MealRequest_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealRequest` ADD CONSTRAINT `MealRequest_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
