-- AlterTable
ALTER TABLE `Product` ADD COLUMN `seoDescription` VARCHAR(320) NULL,
    ADD COLUMN `seoKeywords` VARCHAR(320) NULL,
    ADD COLUMN `seoTitle` VARCHAR(120) NULL;
