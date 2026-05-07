CREATE TABLE `CustomerOtpCode` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `codeHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `attempts` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE INDEX `CustomerOtpCode_email_idx` ON `CustomerOtpCode`(`email`);
CREATE INDEX `CustomerOtpCode_expiresAt_idx` ON `CustomerOtpCode`(`expiresAt`);

CREATE TABLE `CustomerSession` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `CustomerSession_tokenHash_key` ON `CustomerSession`(`tokenHash`);
CREATE INDEX `CustomerSession_email_idx` ON `CustomerSession`(`email`);
CREATE INDEX `CustomerSession_expiresAt_idx` ON `CustomerSession`(`expiresAt`);
