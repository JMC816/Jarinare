CREATE TABLE `board_reads` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `boardId` BIGINT NOT NULL,
  `userIdx` BIGINT NOT NULL,
  `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `board_reads_boardId_userIdx_key`(`boardId`, `userIdx`),
  INDEX `board_reads_userIdx_idx`(`userIdx`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `board_reads` ADD CONSTRAINT `board_reads_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `board_reads` ADD CONSTRAINT `board_reads_userIdx_fkey` FOREIGN KEY (`userIdx`) REFERENCES `users`(`idx`) ON DELETE RESTRICT ON UPDATE CASCADE;
