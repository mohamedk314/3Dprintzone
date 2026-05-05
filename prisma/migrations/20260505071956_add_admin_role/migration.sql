-- AlterTable
ALTER TABLE `AdminUser` ADD COLUMN `role` ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE INDEX `AdminUser_role_idx` ON `AdminUser`(`role`);
