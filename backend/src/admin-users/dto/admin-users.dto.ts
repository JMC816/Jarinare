// @role: entities/dto
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class AdminUserListQueryDto {
  @ApiPropertyOptional({ description: "이메일·이름·idx 검색" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ["active", "suspended", "withdrawn"] })
  @IsOptional()
  @IsIn(["active", "suspended", "withdrawn"])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;
}

export class SuspendUserDto {
  @ApiProperty({ example: "2026-12-31T23:59:59.000Z", description: "정지 종료 일시 (ISO 8601)" })
  @IsISO8601()
  until!: string;

  @ApiProperty({ example: "불건전 게시글 작성" })
  @IsString()
  @MinLength(1)
  reason!: string;
}

export class AdjustPointDto {
  @ApiProperty({ example: 1000, description: "양수=지급, 음수=차감" })
  @IsInt()
  amount!: number;

  @ApiProperty({ example: "이벤트 보상" })
  @IsString()
  @MinLength(1)
  reason!: string;
}

export class UpdateMembershipDto {
  @ApiPropertyOptional({ description: "멤버십 등급 ID. null 이면 등급 해제.", nullable: true })
  @IsOptional()
  @IsInt()
  membershipTierId!: number | null;
}
