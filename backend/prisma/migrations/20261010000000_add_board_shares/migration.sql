CREATE TABLE `board_shares` (
  `boardId` BIGINT NOT NULL,
  `userIdx` BIGINT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  INDEX `board_shares_userIdx_idx`(`userIdx`),
  PRIMARY KEY (`boardId`, `userIdx`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `board_shares` ADD CONSTRAINT `board_shares_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `board_shares` ADD CONSTRAINT `board_shares_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;
