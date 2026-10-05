-- DropTable
DROP TABLE IF EXISTS `comment_likes`;

-- AlterTable
ALTER TABLE `comments` ADD COLUMN `likedById` JSON NOT NULL DEFAULT (JSON_ARRAY());
