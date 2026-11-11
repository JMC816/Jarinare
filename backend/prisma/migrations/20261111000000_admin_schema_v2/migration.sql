-- users: 어드민 역할·정지·멤버십 컬럼 추가
ALTER TABLE `users`
  ADD COLUMN `adminRoleId` BIGINT NULL,
  ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'active',
  ADD COLUMN `suspendedUntil` DATETIME(3) NULL,
  ADD COLUMN `suspendReason` VARCHAR(255) NULL,
  ADD COLUMN `membershipTierId` BIGINT NULL,
  ADD INDEX `users_status_idx` (`status`);

-- boards: 숨김·고정·노출 기간 컬럼 추가
ALTER TABLE `boards`
  ADD COLUMN `isHidden` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `isPinned` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `visibleFrom` DATETIME(3) NULL,
  ADD COLUMN `visibleUntil` DATETIME(3) NULL,
  ADD INDEX `boards_isPinned_type_idx` (`isPinned`, `type`);

-- comments: 숨김 컬럼 추가
ALTER TABLE `comments`
  ADD COLUMN `isHidden` BOOLEAN NOT NULL DEFAULT false;

-- admin_roles: 기존 테이블 교체 (PK 변경)
DROP TABLE IF EXISTS `admin_roles`;
CREATE TABLE `admin_roles` (
  `id`          BIGINT NOT NULL AUTO_INCREMENT,
  `code`        VARCHAR(30) NOT NULL,
  `name`        VARCHAR(50) NOT NULL,
  `permissions` JSON NOT NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `admin_roles_code_key` (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- users → admin_roles FK
ALTER TABLE `users`
  ADD CONSTRAINT `users_adminRoleId_fkey`
  FOREIGN KEY (`adminRoleId`) REFERENCES `admin_roles` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- card_discounts: 컬럼 추가 및 PK BigInt 변환
ALTER TABLE `card_discounts`
  ADD COLUMN `cardCode`     VARCHAR(30) NOT NULL DEFAULT '',
  ADD COLUMN `discountType` VARCHAR(10) NOT NULL DEFAULT 'rate',
  ADD COLUMN `value`        INT NOT NULL DEFAULT 0,
  ADD COLUMN `maxDiscount`  INT NULL,
  ADD COLUMN `minPayment`   INT NOT NULL DEFAULT 0,
  ADD COLUMN `startsAt`     DATETIME(3) NULL,
  ADD COLUMN `endsAt`       DATETIME(3) NULL,
  ADD INDEX `card_discounts_cardCode_isActive_idx` (`cardCode`, `isActive`);

-- cardCode 초기값: 기존 cardName 값 복사
UPDATE `card_discounts` SET `cardCode` = `cardName`;

-- card_discounts: unique 제약 제거 (cardName은 더 이상 unique 불필요)
ALTER TABLE `card_discounts` DROP INDEX `card_discounts_cardName_key`;

-- reports 테이블 생성
CREATE TABLE `reports` (
  `id`          BIGINT NOT NULL AUTO_INCREMENT,
  `reporterIdx` BIGINT NOT NULL,
  `targetType`  VARCHAR(20) NOT NULL,
  `targetId`    BIGINT NOT NULL,
  `reasonCode`  VARCHAR(30) NOT NULL,
  `detail`      VARCHAR(500) NULL,
  `status`      VARCHAR(20) NOT NULL DEFAULT 'RECEIVED',
  `action`      VARCHAR(30) NULL,
  `handlerIdx`  BIGINT NULL,
  `handlerMemo` VARCHAR(500) NULL,
  `handledAt`   DATETIME(3) NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `reports_reporterIdx_targetType_targetId_key` (`reporterIdx`, `targetType`, `targetId`),
  INDEX `reports_status_createdAt_idx` (`status`, `createdAt`),
  INDEX `reports_targetType_targetId_idx` (`targetType`, `targetId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- membership_tiers 테이블 생성
CREATE TABLE `membership_tiers` (
  `id`              BIGINT NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(30) NOT NULL,
  `sortOrder`       INT NOT NULL,
  `minTotalPaid`    INT NOT NULL DEFAULT 0,
  `minRideCount`    INT NOT NULL DEFAULT 0,
  `discountRate`    DECIMAL(5,2) NOT NULL DEFAULT 0,
  `pointRate`       DECIMAL(5,2) NOT NULL DEFAULT 0,
  `freeSeatChanges` INT NOT NULL DEFAULT 0,
  `isActive`        BOOLEAN NOT NULL DEFAULT true,
  `createdAt`       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- users → membership_tiers FK
ALTER TABLE `users`
  ADD CONSTRAINT `users_membershipTierId_fkey`
  FOREIGN KEY (`membershipTierId`) REFERENCES `membership_tiers` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;

-- scheduler_job_settings 테이블 생성
CREATE TABLE `scheduler_job_settings` (
  `name`      VARCHAR(64) NOT NULL,
  `isActive`  BOOLEAN NOT NULL DEFAULT true,
  `updatedBy` BIGINT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
