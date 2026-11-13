import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

/** POST /admin/scheduler/jobs/:name/run 요청 바디. */
export class RunJobDto {
  @ApiPropertyOptional({
    description: "시작일 (YYYYMMDD). train-time-sync 에만 사용.",
    example: "20261114",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: "startDate 는 YYYYMMDD 형식이어야 합니다." })
  startDate?: string;

  @ApiPropertyOptional({
    description: "종료일 (YYYYMMDD, 포함). train-time-sync 에만 사용.",
    example: "20261120",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: "endDate 는 YYYYMMDD 형식이어야 합니다." })
  endDate?: string;

  @ApiPropertyOptional({
    description: "일수 (endDate 미지정 시). train-time-sync 에만 사용.",
    example: 7,
  })
  @IsOptional()
  days?: number;
}

/** POST /admin/scheduler/jobs/:name/run 응답. */
export class RunJobResultDto {
  runId!: string;
  jobName!: string;
  status!: string;
}
