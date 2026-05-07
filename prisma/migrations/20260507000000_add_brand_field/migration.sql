-- Add brand field to Category
ALTER TABLE `Category` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT '3dprintzone';
CREATE INDEX `Category_brand_idx` ON `Category`(`brand`);

-- Add brand field to Product
ALTER TABLE `Product` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT '3dprintzone';
CREATE INDEX `Product_brand_idx` ON `Product`(`brand`);

-- Add brand field to Order
ALTER TABLE `Order` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT '3dprintzone';
CREATE INDEX `Order_brand_idx` ON `Order`(`brand`);

-- Cart: drop old unique constraint on sessionId, add brand, add composite unique
ALTER TABLE `Cart` DROP INDEX `Cart_sessionId_key`;
ALTER TABLE `Cart` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT '3dprintzone';
CREATE UNIQUE INDEX `Cart_sessionId_brand_key` ON `Cart`(`sessionId`, `brand`);
CREATE INDEX `Cart_sessionId_idx` ON `Cart`(`sessionId`);

-- Wishlist: drop old unique constraint on sessionId, add brand, add composite unique
ALTER TABLE `Wishlist` DROP INDEX `Wishlist_sessionId_key`;
ALTER TABLE `Wishlist` ADD COLUMN `brand` VARCHAR(191) NOT NULL DEFAULT '3dprintzone';
CREATE UNIQUE INDEX `Wishlist_sessionId_brand_key` ON `Wishlist`(`sessionId`, `brand`);
CREATE INDEX `Wishlist_sessionId_idx` ON `Wishlist`(`sessionId`);
