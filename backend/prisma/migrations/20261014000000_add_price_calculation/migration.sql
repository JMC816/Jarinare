-- train_trips: 운임 서버 계산을 위해 1인 성인 운임 추가
ALTER TABLE `train_trips` ADD COLUMN `adultcharge` INT NOT NULL DEFAULT 0;

-- card_discounts: 카드사별 할인율·페이백율 (어드민에서 관리)
CREATE TABLE `card_discounts` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `cardName`     VARCHAR(30)   NOT NULL,
  `discountRate` DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
  `paybackRate`  DECIMAL(5,4)  NOT NULL DEFAULT 0.0000,
  `isActive`     BOOLEAN       NOT NULL DEFAULT TRUE,
  `createdAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `card_discounts_cardName_key` (`cardName`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 초기 카드 데이터 (프론트 payModalConstants 기준)
INSERT INTO `card_discounts` (`cardName`, `discountRate`, `paybackRate`, `updatedAt`) VALUES
('국민', 0.0000, 0.0000, NOW()),
('신한', 0.1000, 0.0000, NOW()),
('삼성', 0.0250, 0.0000, NOW()),
('현대', 0.0000, 0.2000, NOW()),
('롯데', 0.0300, 0.0000, NOW()),
('농협', 0.0150, 0.0000, NOW()),
('하나', 0.0200, 0.0000, NOW()),
('BC',   0.0100, 0.0000, NOW());
