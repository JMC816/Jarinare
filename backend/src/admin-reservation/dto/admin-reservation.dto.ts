import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class ReservationListQueryDto {
  @ApiPropertyOptional({ description: "유저 idx·이름·orderId 검색" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ["active", "canceled"], description: "active=활성, canceled=취소" })
  @IsOptional()
  @IsIn(["active", "canceled"])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}

export class SeatChangeListQueryDto {
  @ApiPropertyOptional({ enum: ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"] })
  @IsOptional()
  @IsIn(["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
}
