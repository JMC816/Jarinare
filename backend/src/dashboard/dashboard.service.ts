// @role: features/dashboard
// @rule: 어드민 대시보드 집계 쿼리만 담당
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ACTIVE } from "../seat/seat.constants";
import { TravelStatService } from "../travel-stat/travel-stat.service";

function toDateRange(from?: string, to?: string): { start: Date; end: Date } {
  const kstNow = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = kstNow.toISOString().slice(0, 10).replace(/-/g, "");
  const f = from ?? todayStr;
  const t = to ?? todayStr;
  const start = new Date(`${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}T00:00:00+09:00`);
  const end = new Date(`${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}T23:59:59+09:00`);
  return { start, end };
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly travelStats: TravelStatService,
  ) {}

  async getSummary(from?: string, to?: string) {
    const { start, end } = toDateRange(from, to);
    const now = new Date();
    const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 오래된 작업 감지: job별 마지막 성공 시각과 최대 허용 경과시간(ms)
    const STALE_THRESHOLDS: Record<string, number> = {
      "station-sync":        26 * 60 * 60 * 1000,   // 26시간 (일 1회)
      "train-time-sync":     26 * 60 * 60 * 1000,   // 26시간 (일 1회)
      "notification-rotate": 33 * 24 * 60 * 60 * 1000, // 33일 (월 1회)
      "notification-drop":   33 * 24 * 60 * 60 * 1000, // 33일 (월 1회)
      "seat-change-expire":  10 * 60 * 1000,         // 10분 (분 1회)
      "seat-hold-expire":    10 * 60 * 1000,         // 10분 (분 1회)
    };

    const [
      reservationStats,
      cancelStats,
      newUsers,
      activeUsers,
      seatChangeStats,
      pendingReports,
      schedulerFailures,
      lastSuccessLogs,
      popularDestinations,
    ] = await Promise.all([
      // 기간 내 예매 수·매출 (활성)
      this.prisma.reservation.aggregate({
        where: { createdAt: { gte: start, lte: end }, canceledAt: ACTIVE },
        _count: { id: true },
        _sum: { price: true },
      }),

      // 기간 내 취소 수
      this.prisma.reservation.count({
        where: {
          canceledAt: { gt: ACTIVE, gte: start, lte: end },
        },
      }),

      // 기간 내 신규 가입
      this.prisma.user.count({
        where: { createdAt: { gte: start, lte: end } },
      }),

      // 활성 사용자 (기간 내 예매 or 로그인한 유저)
      this.prisma.user.count({
        where: {
          status: "active",
          updatedAt: { gte: start, lte: end },
        },
      }),

      // 좌석 변경 요청 수·수락률
      this.prisma.seatChangeRequest.groupBy({
        by: ["status"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),

      // 미처리 신고 수
      this.prisma.report.count({
        where: { status: { in: ["RECEIVED", "REVIEWING"] } },
      }),

      // 최근 24시간 스케줄러 실패 수
      this.prisma.schedulerRunLog.count({
        where: { status: "FAILED", startedAt: { gte: h24ago } },
      }),

      // job별 마지막 성공 로그
      this.prisma.schedulerRunLog.findMany({
        where: {
          jobName: { in: Object.keys(STALE_THRESHOLDS) },
          status: "SUCCESS",
        },
        orderBy: { runId: "desc" },
        distinct: ["jobName"],
        select: { jobName: true, endedAt: true },
      }),

      // 인기 목적지 top 5
      this.travelStats.list(),
    ]);

    const totalReservations = reservationStats._count.id;
    const totalRevenue = reservationStats._sum.price ?? 0;
    const totalForCancel = totalReservations + cancelStats;
    const cancelRate = totalForCancel > 0
      ? Math.round((cancelStats / totalForCancel) * 100 * 10) / 10
      : 0;

    const lastSuccessMap = new Map(
      lastSuccessLogs.map((l) => [l.jobName, l.endedAt]),
    );
    const staleJobs = Object.entries(STALE_THRESHOLDS)
      .filter(([jobName, maxMs]) => {
        const lastSuccess = lastSuccessMap.get(jobName);
        if (!lastSuccess) return true; // 한 번도 성공한 적 없음
        return now.getTime() - lastSuccess.getTime() > maxMs;
      })
      .map(([jobName]) => jobName);

    const changeTotal = seatChangeStats.reduce((s, g) => s + g._count.id, 0);
    const changeAccepted = seatChangeStats.find((g) => g.status === "ACCEPTED")?._count.id ?? 0;
    const changeAcceptRate = changeTotal > 0
      ? Math.round((changeAccepted / changeTotal) * 100 * 10) / 10
      : 0;

    return {
      period: { from: from ?? "today", to: to ?? "today" },
      reservations: {
        count: totalReservations,
        revenue: Number(totalRevenue),
        cancelCount: cancelStats,
        cancelRate,
      },
      users: {
        newCount: newUsers,
        activeCount: activeUsers,
      },
      seatChanges: {
        total: changeTotal,
        acceptRate: changeAcceptRate,
      },
      pendingReports,
      scheduler: {
        failures24h: schedulerFailures,
        staleJobs,
      },
      popularDestinations: popularDestinations.slice(0, 5).map((s) => ({
        destination: s.destination,
        count: s.totalCount,
      })),
    };
  }

  async getDailyReservations(from?: string, to?: string) {
    const { start, end } = toDateRange(from, to);

    const rows = await this.prisma.orderHistory.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        isReturn: false,
      },
      select: { createdAt: true, finalPrice: true },
    });

    // KST 기준 시간대별 집계
    const byHour: Record<number, { count: number; revenue: number }> = {};
    for (let h = 0; h < 24; h++) byHour[h] = { count: 0, revenue: 0 };

    for (const row of rows) {
      const kstHour = new Date(row.createdAt.getTime() + 9 * 60 * 60 * 1000).getUTCHours();
      byHour[kstHour].count += 1;
      byHour[kstHour].revenue += row.finalPrice;
    }

    return {
      period: { from: from ?? "today", to: to ?? "today" },
      hourly: Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        count: byHour[h].count,
        revenue: byHour[h].revenue,
      })),
    };
  }
}
