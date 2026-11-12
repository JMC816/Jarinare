import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Type } from "class-transformer";
import { PERMISSIONS } from "../../auth/permission.types";

export class CreateRoleDto {
  @ApiProperty({ example: "CS" })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({ example: "고객센터" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: ["user:read", "report:read"] })
  @IsArray()
  @IsIn(PERMISSIONS, { each: true })
  permissions!: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: "고객센터 운영" })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: ["user:read", "report:read", "report:resolve"] })
  @IsOptional()
  @IsArray()
  @IsIn(PERMISSIONS, { each: true })
  permissions?: string[];
}

export class AssignAdminDto {
  @ApiProperty({ example: 5, description: "일반 유저 idx" })
  @Type(() => Number)
  @IsInt()
  userIdx!: number;

  @ApiProperty({ example: 1, description: "부여할 adminRole id" })
  @Type(() => Number)
  @IsInt()
  roleId!: number;
}

export class UpdateAdminRoleDto {
  @ApiProperty({ example: 2, description: "변경할 adminRole id" })
  @Type(() => Number)
  @IsInt()
  roleId!: number;
}
