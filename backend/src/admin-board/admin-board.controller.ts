import { Body, Controller, Delete, Get, Param, Patch, Query, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Request } from "express";
import { Permissions } from "../auth/decorators/permissions.decorator";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import { AdminBoardService } from "./admin-board.service";
import { AdminBoardListQueryDto, AdminUpdateBoardDto, AdminUpdateCommentDto } from "./dto/admin-board.dto";

@ApiBearerAuth()
@ApiTags("Admin - 게시판·콘텐츠")
@Controller("admin/boards")
export class AdminBoardController {
  constructor(private readonly adminBoard: AdminBoardService) {}

  @Get()
  @ApiOperation({ summary: "게시글 목록 (type·숨김·검색 필터)" })
  @Permissions("board:manage")
  listBoards(@Query() query: AdminBoardListQueryDto) {
    return this.adminBoard.listBoards(query);
  }

  @Patch(":id")
  @ApiOperation({ summary: "게시글 수정 (숨김·핀·노출 기간)" })
  @Permissions("board:manage")
  updateBoard(
    @Param("id") id: string,
    @Body() dto: AdminUpdateBoardDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminBoard.updateBoard(BigInt(id), dto, req.user, req.ip);
  }

  @Delete(":id")
  @ApiOperation({ summary: "게시글 삭제" })
  @Permissions("board:manage")
  deleteBoard(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminBoard.deleteBoard(BigInt(id), req.user, req.ip);
  }

  @Get(":boardId/comments")
  @ApiOperation({ summary: "댓글 목록" })
  @Permissions("board:manage")
  listComments(@Param("boardId") boardId: string) {
    return this.adminBoard.listComments(BigInt(boardId));
  }

  @Patch("comments/:id")
  @ApiOperation({ summary: "댓글 숨김 처리" })
  @Permissions("board:manage")
  updateComment(
    @Param("id") id: string,
    @Body() dto: AdminUpdateCommentDto,
    @Req() req: Request & { user: AuthUser },
  ) {
    return this.adminBoard.updateComment(BigInt(id), dto, req.user, req.ip);
  }

  @Delete("comments/:id")
  @ApiOperation({ summary: "댓글 삭제" })
  @Permissions("board:manage")
  deleteComment(@Param("id") id: string, @Req() req: Request & { user: AuthUser }) {
    return this.adminBoard.deleteComment(BigInt(id), req.user, req.ip);
  }
}
