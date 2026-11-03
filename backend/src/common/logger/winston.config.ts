import { WinstonModuleOptions } from "nest-winston";
import { utilities as nestWinstonUtils } from "nest-winston";
import * as winston from "winston";
import "winston-daily-rotate-file";

/**
 * 로그 파일을 저장할 디렉터리. 기본값은 프로젝트 루트의 `logs`.
 * 환경변수 LOG_DIR 로 변경할 수 있다.
 */
export const LOG_DIR = process.env.LOG_DIR ?? "logs";

// 파일에 기록할 로그 라인 포맷: [시간] [레벨] [컨텍스트] 메시지 (+ 스택)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const context = info.context ? ` [${info.context as string}]` : "";
    const stack = info.stack ? `\n${info.stack as string}` : "";
    return `[${String(info.timestamp)}] [${info.level.toUpperCase()}]${context} ${String(
      info.message,
    )}${stack}`;
  }),
);

// AUDIT 컨텍스트 로그만 통과시키는 필터
const auditOnly = winston.format((info) =>
  (info.context as string) === "AUDIT" ? info : false,
)();

// 감사 로그 파일 포맷: 한 줄 JSON (timestamp + 메시지 페이로드)
const auditFileFormat = winston.format.combine(
  winston.format.timestamp(),
  auditOnly,
  winston.format.printf((info) => {
    try {
      const payload = JSON.parse(info.message as string) as Record<string, unknown>;
      return JSON.stringify({ timestamp: info.timestamp, ...payload });
    } catch {
      return JSON.stringify({ timestamp: info.timestamp, message: info.message });
    }
  }),
);

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL ?? "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonUtils.format.nestLike("Backend", {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),

    // 압축/보관은 winston-daily-rotate-file 이 직접 관리한다.
    //  - zippedArchive: 회전된(어제까지의) 파일을 gzip 으로 압축(.log.gz)
    //  - maxFiles: 보관 기간. '37d' = 원본 7일 + 압축 30일에 해당하는 총 수명.
    //              (원하면 '30d' 등으로 조정)
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: "backend-%DATE%.log",
      datePattern: "YYYYMMDD",
      zippedArchive: true,
      maxFiles: process.env.LOG_MAX_FILES ?? "37d",
      level: process.env.LOG_LEVEL ?? "info",
      format: fileFormat,
    }),

    // AUDIT 전용 파일 — AUDIT 컨텍스트 로그만 JSON 한 줄씩 기록.
    // 개인정보 접속기록 보관 의무(1년 이상, 100만 명↑ 또는 정보통신서비스 제공자는 2년) 대비
    // 기본값 400일(13개월)로 두고, 환경변수 AUDIT_LOG_MAX_FILES 로 조정 가능.
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: "audit-%DATE%.log",
      datePattern: "YYYYMMDD",
      zippedArchive: true,
      maxFiles: process.env.AUDIT_LOG_MAX_FILES ?? "400d",
      level: "info",
      format: auditFileFormat,
    }),
  ],
};
