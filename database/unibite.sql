-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: unibite
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('22bf14af-bd8a-43e9-b8ba-1ead65a56aaf','1c3cc744d81b267b2f65b41ca5b1dafdfd2d87351984783748e1ceb8cf6d5274','2026-05-23 18:08:11.448','20260523180811_add_user_ban',NULL,NULL,'2026-05-23 18:08:11.375',1),('2c0cf5a7-9e67-4126-9b8e-cdac55b413f7','eb2f47971d0b17ab1e41396d11030bf763bdfffc1c0bf26c9c645fcef25ccf30','2026-05-20 12:50:57.409','20260520125057_init',NULL,NULL,'2026-05-20 12:50:57.363',1),('61897f05-4286-4b2d-9d06-d9b2cb765ecc','b99ceffe15779f46af9869fb45604cb3b1195358ddce78e43c80aeb2ffd3550a','2026-09-13 05:56:10.850','20260913055609_npx_prisma_migrate_dev_name_sync_latest_schema',NULL,NULL,'2026-09-13 05:56:10.807',1),('793a8889-67bf-4022-9e2f-32c4af0e59f1','28f6954e267b9d3d923190b98370bb069311d2be2842f707c4c51f010c52ade2','2026-06-08 14:51:50.607','20260608145150_add_meal_requests',NULL,NULL,'2026-06-08 14:51:50.390',1),('7b33d49c-858a-4ce9-b0c8-4b078ca7daf3','e0acefa9bb85e9e81cc15ba70343b6f5b47d50ec18e963a853df95bde1a3ca50','2026-05-23 18:14:08.590','20260523181408_add_user_ban',NULL,NULL,'2026-05-23 18:14:08.521',1),('82185698-1815-4b26-80b2-0ff3c673a56c','6d6ba9232497910b745acd1e403a10dab3692eb87f99406f6cc925199202ad26','2026-05-21 15:39:38.368','20260521153938_add_listings',NULL,NULL,'2026-05-21 15:39:38.224',1),('8653693b-ceea-4c32-867b-3036c60c45a8','b47f68e8858f89ab097c7d85ea0df5f0863939664ad97df58e8176e9f973281c','2026-06-12 14:39:32.272','20260612143931_add_request_rating',NULL,NULL,'2026-06-12 14:39:32.233',1),('a0490796-58df-4d40-8911-1d564accd351','90e3f6dfee89743e68709f6582e05bceb3ba10e9520a4bd38be233209c043b9a','2026-06-11 15:19:45.582','20260611151945_add_listing_expiration',NULL,NULL,'2026-06-11 15:19:45.556',1),('dfec43eb-18ac-4617-aaae-b990fb42bcba','47afdb4330e55d6da4d19bfd02f5e570f22866a9509aa43d5333875a9adb7354','2026-06-12 14:18:26.572','20260612141826_add_request_rating',NULL,NULL,'2026-06-12 14:18:26.539',1),('f4a8af2a-45d4-4a4a-8468-eaca5a75acf2','c32efa792c846f86017e1722ef0eb0940f094b40c233b520250cf7a78b417fff','2026-09-13 10:17:20.109','20260913101718_rework_points_system',NULL,NULL,'2026-09-13 10:17:20.061',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `listing`
--

DROP TABLE IF EXISTS `listing`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `listing` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `portions` int NOT NULL,
  `pickupLocation` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pickupTime` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` int NOT NULL,
  `expiresAt` datetime(3) DEFAULT NULL,
  `allergens` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Listing_userId_fkey` (`userId`),
  CONSTRAINT `Listing_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `listing`
--

LOCK TABLES `listing` WRITE;
/*!40000 ALTER TABLE `listing` DISABLE KEYS */;
INSERT INTO `listing` VALUES (12,'Carbonara','YK',0,'Estia Entrance','7-9.30','ACTIVE','2026-09-13 11:00:28.630',4,'2026-09-15 11:00:28.611','Milk, Eggs','/uploads/1789297228600-418854418.jpg');
/*!40000 ALTER TABLE `listing` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mealrequest`
--

DROP TABLE IF EXISTS `mealrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mealrequest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `status` enum('PENDING','APPROVED','REJECTED','PICKED_UP','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `listingId` int NOT NULL,
  `requesterId` int NOT NULL,
  `providerId` int NOT NULL,
  `ratedAt` datetime(3) DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `pickedUpAt` datetime(3) DEFAULT NULL,
  `reviewDeadline` datetime(3) DEFAULT NULL,
  `reviewPenaltyApplied` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `MealRequest_listingId_fkey` (`listingId`),
  KEY `MealRequest_requesterId_fkey` (`requesterId`),
  KEY `MealRequest_providerId_fkey` (`providerId`),
  CONSTRAINT `MealRequest_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `listing` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MealRequest_providerId_fkey` FOREIGN KEY (`providerId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `MealRequest_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mealrequest`
--

LOCK TABLES `mealrequest` WRITE;
/*!40000 ALTER TABLE `mealrequest` DISABLE KEYS */;
INSERT INTO `mealrequest` VALUES (6,'PICKED_UP','2026-09-13 11:01:00.859',12,6,4,'2026-09-13 11:01:33.622',5,'2026-09-13 11:01:16.384','2026-09-15 11:01:16.384',0);
/*!40000 ALTER TABLE `mealrequest` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('USER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `credits` int NOT NULL DEFAULT '5',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `isBanned` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Grg','grg@test.com','$2b$10$ap.vpu8uILVCuc7CJU3EDurKFYGz84Fi6vSxXu4l5mZ3uqz1XS/DO','USER',5,'2026-05-21 14:54:49.628',0),(2,'Test User','test2@test.com','$2b$10$s1nKKKFfPMf9vCHtGGuu0eFlnYKrut2xitqbu48ocVexMCxrqPuUW','USER',5,'2026-05-21 14:56:43.305',0),(4,'gorge','giorgoskarpouzos04@gmail.com','$2b$10$ciOa8gw3EEmvIj0CjPfKu.QUo1vwvH/5ri0Ab7MP51k/zL6pS3MvO','USER',8,'2026-05-22 15:37:22.647',0),(5,'Admin','admin@test.com','$2b$10$CQmsTiTV6bUa3nv4VJ012O0VRtQiOT079jKWnZJ5I8Qbc7PDe2BB6','ADMIN',9,'2026-05-23 17:10:10.441',0),(6,'tester2','tester@test.com','$2b$10$Bfj1qD.j/73GjsImN/0fJeWHA202XxLCwIm98UioiSkohESFwy9ai','USER',3,'2026-06-11 14:17:37.972',0),(7,'Γιώργος Καρπούζος','tester@test2.com','$2b$10$xppFDDx.LGknH1CG9NYsEuCUNs1jidGHbUYToFhUe541IcPo.KiSC','USER',5,'2026-09-13 05:46:55.059',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-13 16:21:28
