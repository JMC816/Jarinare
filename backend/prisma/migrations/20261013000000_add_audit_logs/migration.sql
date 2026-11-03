-- scheduler_run_log: 수동 실행 추적 컬럼 추가
ALTER TABLE `scheduler_run_log`
  ADD COLUMN `triggeredBy` BIGINT       NULL,
  ADD COLUMN `params`      JSON         NULL;

-- admin_audit_logs: 어드민 활동 감사 로그
CREATE TABLE `admin_audit_logs` (
  `id`         BIGINT        NOT NULL AUTO_INCREMENT,
  `actorIdx`   BIGINT        NOT NULL,
  `action`     VARCHAR(50)   NOT NULL,
  `targetType` VARCHAR(30)   NOT NULL,
  `targetId`   VARCHAR(64)   NOT NULL,
  `before`     JSON          NULL,
  `after`      JSON          NULL,
  `reason`     VARCHAR(255)  NULL,
  `ip`         VARCHAR(45)   NULL,
  `createdAt`  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `admin_audit_logs_actorIdx_createdAt_idx`              (`actorIdx`, `createdAt`),
  INDEX `admin_audit_logs_targetType_targetId_createdAt_idx`   (`targetType`, `targetId`, `createdAt`),
  INDEX `admin_audit_logs_action_createdAt_idx`                (`action`, `createdAt`)
);
