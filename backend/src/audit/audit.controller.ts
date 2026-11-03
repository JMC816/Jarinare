import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Permissions } from "../auth/decorators/permissions.decorator";
import { AuditService } from "./audit.service";
import {
  AuditLogDetailDto,
  AuditLogListResponseDto,
  AuditLogQueryDto,
} from "./dto/audit-log.dto";

@ApiTags("admin-audit")
@ApiBearerAuth()
@Controller("admin/audit-logs")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Permissions("admin:manage")
  @Get()
  @ApiOperation({
    summary: "어드민 활동 로그 목록",
    description: "actor=, targetType=&targetId=, action= 필터 지원",
  })
  @ApiOkResponse({ type: AuditLogListResponseDto })
  list(@Query() query: AuditLogQueryDto): Promise<AuditLogListResponseDto> {
    return this.auditService.list(query);
  }

  @Permissions("admin:manage")
  @Get(":id")
  @ApiOperation({ summary: "어드민 활동 로그 상세 (변경 전·후 값 포함)" })
  @ApiOkResponse({ type: AuditLogDetailDto })
  get(@Param("id") id: string): Promise<AuditLogDetailDto> {
    if (!/^\d+$/.test(id)) throw new BadRequestException("id는 숫자여야 합니다.");
    return this.auditService.get(id);
  }
}
