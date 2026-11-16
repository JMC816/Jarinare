// @role: entities/dto
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Matches, registerDecorator, ValidationOptions } from "class-validator";

const YYYYMMDD = /^\d{8}$/;

function isCalendarDate(value: string): boolean {
  const y = +value.slice(0, 4), m = +value.slice(4, 6), d = +value.slice(6, 8);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function IsValidDate(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: "isValidDate",
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} 가 유효하지 않은 날짜입니다.`, ...options },
      validator: { validate: (v: unknown) => typeof v === "string" && isCalendarDate(v) },
    });
  };
}

export class DashboardQueryDto {
  @ApiPropertyOptional({ example: "20261101", description: "조회 시작일 YYYYMMDD (기본: 오늘)" })
  @IsOptional()
  @Matches(YYYYMMDD, { message: "from 은 YYYYMMDD 형식이어야 합니다." })
  @IsValidDate()
  from?: string;

  @ApiPropertyOptional({ example: "20261130", description: "조회 종료일 YYYYMMDD (기본: 오늘)" })
  @IsOptional()
  @Matches(YYYYMMDD, { message: "to 는 YYYYMMDD 형식이어야 합니다." })
  @IsValidDate()
  to?: string;
}
