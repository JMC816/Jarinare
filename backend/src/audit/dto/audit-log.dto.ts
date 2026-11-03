import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class AuditLogQueryDto {
  @ApiPropertyOptional({ description: "어드민 idx 필터" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  actor?: number;

  @ApiPropertyOptional({ description: "대상 타입 필터 (user, card_discount ...)" })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: "대상 ID 필터" })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ description: "작업 코드 필터 (user.suspend ...)" })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: "페이지 (1부터)", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: "페이지당 건수 (1~200)", default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class AuditLogItemDto {
  @ApiProperty({ example: "1" })
  id!: string;

  @ApiProperty({ example: 1 })
  actorIdx!: number;

  @ApiProperty({ example: "user.suspend" })
  action!: string;

  @ApiProperty({ example: "user" })
  targetType!: string;

  @ApiProperty({ example: "42" })
  targetId!: string;

  @ApiPropertyOptional({ nullable: true })
  reason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  ip!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class AuditLogDetailDto extends AuditLogItemDto {
  @ApiPropertyOptional({ nullable: true, description: "변경 전 값" })
  before!: unknown;

  @ApiPropertyOptional({ nullable: true, description: "변경 후 값" })
  after!: unknown;
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogItemDto] })
  items!: AuditLogItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  totalPages!: number;
}
