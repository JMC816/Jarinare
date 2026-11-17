-- cs, operator, marketer 계정을 각 adminRole에 연결
UPDATE `users`
SET `adminRoleId` = (SELECT `id` FROM `admin_roles` WHERE `code` = 'CS')
WHERE `role` = 'cs' AND `adminRoleId` IS NULL;

UPDATE `users`
SET `adminRoleId` = (SELECT `id` FROM `admin_roles` WHERE `code` = 'OPERATOR')
WHERE `role` = 'operator' AND `adminRoleId` IS NULL;

UPDATE `users`
SET `adminRoleId` = (SELECT `id` FROM `admin_roles` WHERE `code` = 'MARKETER')
WHERE `role` = 'marketer' AND `adminRoleId` IS NULL;
