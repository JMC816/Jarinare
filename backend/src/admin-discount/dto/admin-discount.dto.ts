import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateCardDiscountDto {
  @ApiProperty({ example: "SHINHAN" })
  @IsString()
  @MinLength(1)
  cardCode!: string;

  @ApiProperty({ example: "신한카드" })
  @IsString()
  @MinLength(1)
  cardName!: string;

  @ApiProperty({ enum: ["rate", "amount"], example: "rate" })
  @IsIn(["rate", "amount"])
  discountType!: string;

  @ApiProperty({ example: 1000, description: "rate: 1/10000 단위(1000=10%), amount: 원" })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ example: 5000, description: "최대 할인 금액" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 10000, description: "최소 결제 금액" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPayment?: number;

  @ApiPropertyOptional({ example: 0.03, description: "포인트 페이백율 (하위 호환)" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paybackRate?: number;

  @ApiPropertyOptional({ example: "2026-01-01T00:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsISO8601()
  endsAt?: string;
}

export class UpdateCardDiscountDto {
  @ApiPropertyOptional({ example: "신한카드 (개편)" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  cardName?: string;

  @ApiPropertyOptional({ enum: ["rate", "amount"] })
  @IsOptional()
  @IsIn(["rate", "amount"])
  discountType?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ example: 3000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 20000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPayment?: number;

  @ApiPropertyOptional({ example: 0.05 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  paybackRate?: number;

  @ApiPropertyOptional({ example: "2026-06-01T00:00:00.000Z" })
  @IsOptional()
  @IsISO8601()
  startsAt?: string;

  @ApiPropertyOptional({ example: "2026-12-31T23:59:59.000Z" })
  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
