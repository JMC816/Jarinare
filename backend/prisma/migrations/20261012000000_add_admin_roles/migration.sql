CREATE TABLE `admin_roles` (
  `role`        VARCHAR(20)  NOT NULL,
  `permissions` JSON         NOT NULL,
  `updatedAt`   DATETIME(3)  NOT NULL,
  PRIMARY KEY (`role`)
);

INSERT INTO `admin_roles` (`role`, `permissions`, `updatedAt`) VALUES
  ('user',        JSON_ARRAY(), NOW()),
  ('cs',          JSON_ARRAY('dashboard:view','user:view','report:view','reservation:view','membership:view','card:view','scheduler:view'), NOW()),
  ('marketer',    JSON_ARRAY('dashboard:view','membership:view','membership:manage','card:view','card:manage','board:create','notification:send'), NOW()),
  ('operator',    JSON_ARRAY('dashboard:view','user:view','user:suspend','report:view','report:resolve','board:delete','board:create','scheduler:view','scheduler:run','reservation:view'), NOW()),
  ('super_admin', JSON_ARRAY('user:view','user:suspend','user:delete','report:view','report:resolve','report:delete','board:delete','board:create','membership:view','membership:manage','card:view','card:manage','scheduler:view','scheduler:run','dashboard:view','notification:send','reservation:view','admin:manage'), NOW());
