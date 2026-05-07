-- AlterTable
ALTER TABLE `Product` ADD COLUMN `lowStockAlertSentAt` DATETIME(3) NULL,
                      ADD COLUMN `outOfStockAlertSentAt` DATETIME(3) NULL;
