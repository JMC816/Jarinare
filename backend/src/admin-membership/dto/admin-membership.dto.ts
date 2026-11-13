import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateMembershipTierDto {
  @ApiProperty({ example: "골드" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: 1, description: "정렬 순서" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder!: number;

  @ApiPropertyOptional({ example: 500000, description: "최소 누적 결제 금액" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minTotalPaid?: number;

  @ApiPropertyOptional({ example: 10, description: "최소 탑승 횟수" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRideCount?: number;

  @ApiPropertyOptional({ example: 5.0, description: "할인율 (%)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @ApiPropertyOptional({ example: 2.0, description: "포인트 적립율 (%)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pointRate?: number;

  @ApiPropertyOptional({ example: 2, description: "무료 좌석 변경 횟수" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  freeSeatChanges?: number;
}

export class UpdateMembershipTierDto {
  @ApiPropertyOptional({ example: "플래티넘" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: 1000000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minTotalPaid?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minRideCount?: number;

  @ApiPropertyOptional({ example: 10.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @ApiPropertyOptional({ example: 3.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pointRate?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  freeSeatChanges?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
