import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/** 카카오 인가 코드 교환 응답. */
export class KakaoTokenResponseDto {
  @ApiProperty({ description: "카카오 액세스 토큰" })
  access_token: string;

  @ApiProperty({ description: "카카오 OIDC ID 토큰" })
  id_token: string;

  @ApiProperty({ description: "토큰 타입", example: "bearer" })
  token_type: string;

  @ApiPropertyOptional({ description: "액세스 토큰 만료(초)" })
  expires_in?: number;
}

/** 카카오 로그인 응답. */
export class KakaoLoginResponseDto {
  @ApiProperty({ description: "JWT 액세스 토큰" })
  accessToken: string;
}
