-- 기본 어드민 역할 INSERT (이미 존재하면 permissions 업데이트)
INSERT INTO `admin_roles` (`code`, `name`, `permissions`, `createdAt`, `updatedAt`) VALUES
  ('SUPER_ADMIN', '슈퍼 어드민', JSON_ARRAY(
    'dashboard:read','user:read','user:suspend','point:adjust','admin:manage',
    'report:read','report:resolve','membership:manage','discount:manage','board:manage',
    'reservation:read','reservation:manage','notification:send','scheduler:read','scheduler:run'
  ), NOW(), NOW()),
  ('OPERATOR', '운영자', JSON_ARRAY(
    'dashboard:read','user:read','user:suspend',
    'report:read','report:resolve',
    'board:manage',
    'reservation:read','reservation:manage',
    'scheduler:read','scheduler:run'
  ), NOW(), NOW()),
  ('CS', '고객지원', JSON_ARRAY(
    'dashboard:read','user:read',
    'report:read','report:resolve',
    'reservation:read'
  ), NOW(), NOW()),
  ('MARKETER', '마케터', JSON_ARRAY(
    'dashboard:read',
    'membership:manage','discount:manage',
    'board:manage','notification:send'
  ), NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name`        = VALUES(`name`),
  `permissions` = VALUES(`permissions`),
  `updatedAt`   = NOW();

-- 기존 role = 'super_admin' 사용자를 SUPER_ADMIN 역할에 연결
UPDATE `users`
SET `adminRoleId` = (SELECT `id` FROM `admin_roles` WHERE `code` = 'SUPER_ADMIN')
WHERE `role` = 'super_admin' AND `adminRoleId` IS NULL;
