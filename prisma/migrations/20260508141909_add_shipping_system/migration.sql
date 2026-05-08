-- AlterTable
ALTER TABLE `Order` ADD COLUMN `courierName` VARCHAR(191) NULL,
    ADD COLUMN `estimatedDelivery` DATETIME(3) NULL,
    ADD COLUMN `shipmentStatus` ENUM('pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'canceled') NULL,
    ADD COLUMN `shippingMethodId` VARCHAR(191) NULL,
    ADD COLUMN `shippingZoneId` VARCHAR(191) NULL,
    ADD COLUMN `trackingNumber` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ShippingZone` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `governorates` TEXT NOT NULL,
    `priceOverride` DECIMAL(10, 2) NOT NULL,
    `estimatedDaysMin` INTEGER NOT NULL DEFAULT 1,
    `estimatedDaysMax` INTEGER NOT NULL DEFAULT 3,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `brand` VARCHAR(191) NOT NULL DEFAULT 'both',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingZone_isActive_idx`(`isActive`),
    INDEX `ShippingZone_brand_idx`(`brand`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingMethod` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `estimatedDays` INTEGER NOT NULL DEFAULT 3,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `brand` VARCHAR(191) NOT NULL DEFAULT 'both',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingMethod_isActive_idx`(`isActive`),
    INDEX `ShippingMethod_brand_idx`(`brand`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_shipmentStatus_idx` ON `Order`(`shipmentStatus`);

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingMethodId_fkey` FOREIGN KEY (`shippingMethodId`) REFERENCES `ShippingMethod`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_shippingZoneId_fkey` FOREIGN KEY (`shippingZoneId`) REFERENCES `ShippingZone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
