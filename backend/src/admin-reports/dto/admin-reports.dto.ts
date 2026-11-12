import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class ReportListQueryDto {
  @ApiPropertyOptional({ enum: ["RECEIVED", "REVIEWING", "RESOLVED", "REJECTED"] })
  @IsOptional()
  @IsIn(["RECEIVED", "REVIEWING", "RESOLVED", "REJECTED"])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}

export class ResolveReportDto {
  @ApiProperty({ enum: ["RESOLVED", "REJECTED"] })
  @IsIn(["RESOLVED", "REJECTED"])
  status!: string;

  @ApiPropertyOptional({ enum: ["hide", "warn", "suspend"] })
  @IsOptional()
  @IsIn(["hide", "warn", "suspend"])
  action?: string;

  @ApiPropertyOptional({ example: "욕설 포함 게시글 확인 후 숨김 처리" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  memo?: string;
}
