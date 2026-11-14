import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from "class-validator";
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

export class CreateReportDto {
  @ApiProperty({ enum: ["board", "comment", "review", "user"] })
  @IsIn(["board", "comment", "review", "user"])
  targetType!: string;

  @ApiProperty({ description: "신고 대상 ID" })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  targetId!: number;

  @ApiProperty({ enum: ["spam", "abuse", "obscene", "etc"] })
  @IsIn(["spam", "abuse", "obscene", "etc"])
  reasonCode!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  detail?: string;
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

export class RejectReportDto {
  @ApiPropertyOptional({ example: "신고 사유 불충분" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  memo?: string;
}
