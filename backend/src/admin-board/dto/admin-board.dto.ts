import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsISO8601, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class AdminBoardListQueryDto {
  @ApiPropertyOptional({ enum: ["notice", "event", "board", "review"] })
  @IsOptional()
  @IsIn(["notice", "event", "board", "review"])
  type?: string;

  @ApiPropertyOptional({ description: "제목·작성자 검색" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ["true", "false"], description: "숨김 여부 필터" })
  @IsOptional()
  @IsIn(["true", "false"])
  hidden?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}

export class AdminUpdateBoardDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  visibleFrom?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsISO8601()
  visibleUntil?: string;
}

export class AdminUpdateCommentDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}
