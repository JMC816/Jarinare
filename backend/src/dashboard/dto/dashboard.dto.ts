// @role: entities/dto
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches } from "class-validator";

const YYYYMMDD = /^\d{8}$/;

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: "20261101", description: "조회 시작일 YYYYMMDD (기본: 오늘)" })
  @IsOptional()
  @Matches(YYYYMMDD, { message: "from 은 YYYYMMDD 형식이어야 합니다." })
  from?: string;

  @ApiPropertyOptional({ example: "20261130", description: "조회 종료일 YYYYMMDD (기본: 오늘)" })
  @IsOptional()
  @Matches(YYYYMMDD, { message: "to 는 YYYYMMDD 형식이어야 합니다." })
  to?: string;
}
