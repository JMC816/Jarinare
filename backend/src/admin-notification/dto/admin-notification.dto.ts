import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";

export class SendNotificationDto {
  @ApiProperty({ example: "서비스 점검 안내", description: "알림 제목" })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: "11월 15일 02:00~04:00 점검 예정입니다." })
  @IsString()
  @MinLength(1)
  body!: string;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: "대상 유저 idx 목록. 비우면 전체 발송",
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  targetUserIdxList?: number[];
}
