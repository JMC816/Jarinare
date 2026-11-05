-- season_events: 계절별 이벤트 할인 (어드민에서 역 목록·할인율·기간 관리)
CREATE TABLE `season_events` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `name`         VARCHAR(50)   NOT NULL,
  `discountRate` DECIMAL(5,4)  NOT NULL DEFAULT 0.1000,
  `startMonth`   TINYINT       NOT NULL,
  `endMonth`     TINYINT       NOT NULL,
  `stations`     JSON          NOT NULL,
  `isActive`     BOOLEAN       NOT NULL DEFAULT TRUE,
  `createdAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 초기 데이터 (프론트 seasonStations.ts 기준)
INSERT INTO `season_events` (`name`, `discountRate`, `startMonth`, `endMonth`, `stations`, `updatedAt`) VALUES
('봄',   0.1000, 3,  5,  '["남춘천","양평","곡성","구례구","순천","청평","가평","평창","진부","풍기","영주"]', NOW()),
('여름', 0.1000, 6,  8,  '["강릉","정동진","묵호","동해","삼척","부산","울산","포항","여수EXPO","목포","장항","대천"]', NOW()),
('가을', 0.1000, 9,  11, '["안동","제천","단양","영월","태백","원주","남원","밀양","청도","홍성"]', NOW()),
('겨울', 0.1000, 12, 2,  '["횡성","둔내","평창","진부","강릉","태백","민둥산","고한","사북","정선","아우라지"]', NOW());
