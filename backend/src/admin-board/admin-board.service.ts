import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { AuditService } from "../audit/audit.service";
import type { AuthUser } from "../auth/interfaces/auth-user.interface";
import type { AdminBoardListQueryDto, AdminUpdateBoardDto, AdminUpdateCommentDto } from "./dto/admin-board.dto";

const PAGE_SIZE = 20;

function serializeBoard(b: Record<string, unknown>) {
  return {
    ...b,
    id: (b.id as bigint).toString(),
    authorIdx: (b.authorIdx as bigint).toString(),
    liked: (b.liked as bigint).toString(),
  };
}

function serializeComment(c: Record<string, unknown>) {
  return {
    ...c,
    id: (c.id as bigint).toString(),
    boardId: (c.boardId as bigint).toString(),
    authorIdx: (c.authorIdx as bigint).toString(),
    liked: (c.liked as bigint).toString(),
    parentId: c.parentId ? (c.parentId as bigint).toString() : null,
  };
}

@Injectable()
export class AdminBoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ── 게시글 ────────────────────────────────────────────

  async listBoards(query: AdminBoardListQueryDto) {
    const page = query.page ?? 1;
    const skip = (page - 1) * PAGE_SIZE;

    const where: Record<string, unknown> = {};
    if (query.type) where.type = query.type;
    if (query.hidden !== undefined) where.isHidden = query.hidden === "true";
    if (query.q) {
      where.OR = [
        { title: { contains: query.q } },
      ];
    }

    const [total, boards] = await this.prisma.$transaction([
      this.prisma.board.count({ where }),
      this.prisma.board.findMany({
        where,
        skip,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          type: true,
          title: true,
          authorIdx: true,
          liked: true,
          viewCount: true,
          isHidden: true,
          isPinned: true,
          visibleFrom: true,
          visibleUntil: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      data: boards.map((b) => serializeBoard(b as unknown as Record<string, unknown>)),
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  }

  async updateBoard(id: bigint, dto: AdminUpdateBoardDto, actor: AuthUser, ip: string | undefined) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new AppException(ErrorCode.POST_NOT_FOUND, "게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = {
      isHidden: board.isHidden,
      isPinned: board.isPinned,
      visibleFrom: board.visibleFrom,
      visibleUntil: board.visibleUntil,
    };

    const updated = await this.prisma.board.update({
      where: { id },
      data: {
        ...(dto.isHidden !== undefined ? { isHidden: dto.isHidden } : {}),
        ...(dto.isPinned !== undefined ? { isPinned: dto.isPinned } : {}),
        ...(dto.visibleFrom !== undefined ? { visibleFrom: new Date(dto.visibleFrom) } : {}),
        ...(dto.visibleUntil !== undefined ? { visibleUntil: new Date(dto.visibleUntil) } : {}),
      },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "board.update",
      targetType: "board",
      targetId: id.toString(),
      before,
      after: dto,
      ip,
    });

    return serializeBoard(updated as unknown as Record<string, unknown>);
  }

  async deleteBoard(id: bigint, actor: AuthUser, ip: string | undefined) {
    const board = await this.prisma.board.findUnique({ where: { id } });
    if (!board) throw new AppException(ErrorCode.POST_NOT_FOUND, "게시글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.board.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "board.delete",
      targetType: "board",
      targetId: id.toString(),
      before: { title: board.title, type: board.type },
      ip,
    });

    return { success: true };
  }

  // ── 댓글 ──────────────────────────────────────────────

  async listComments(boardId: bigint) {
    const comments = await this.prisma.comment.findMany({
      where: { boardId },
      orderBy: { createdAt: "asc" },
    });
    return comments.map((c) => serializeComment(c as unknown as Record<string, unknown>));
  }

  async updateComment(id: bigint, dto: AdminUpdateCommentDto, actor: AuthUser, ip: string | undefined) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new AppException(ErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    const before = { isHidden: comment.isHidden };
    const updated = await this.prisma.comment.update({
      where: { id },
      data: { ...(dto.isHidden !== undefined ? { isHidden: dto.isHidden } : {}) },
    });

    this.audit.log({
      actorIdx: actor.idx,
      action: "comment.update",
      targetType: "comment",
      targetId: id.toString(),
      before,
      after: dto,
      ip,
    });

    return serializeComment(updated as unknown as Record<string, unknown>);
  }

  async deleteComment(id: bigint, actor: AuthUser, ip: string | undefined) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new AppException(ErrorCode.COMMENT_NOT_FOUND, "댓글을 찾을 수 없습니다.", HttpStatus.NOT_FOUND);

    await this.prisma.comment.delete({ where: { id } });

    this.audit.log({
      actorIdx: actor.idx,
      action: "comment.delete",
      targetType: "comment",
      targetId: id.toString(),
      before: { boardId: comment.boardId.toString() },
      ip,
    });

    return { success: true };
  }
}
