import { SchedulerAlertService } from "./scheduler-alert.service";

function createPrismaMock(adminIdxs: bigint[]) {
  return {
    user: {
      findMany: jest.fn(() =>
        Promise.resolve(adminIdxs.map((idx) => ({ idx }))),
      ),
    },
  };
}

function createNotificationMock() {
  return {
    create: jest.fn(() => Promise.resolve()),
  };
}

describe("SchedulerAlertService", () => {
  it("어드민 수만큼 notification.create 를 호출한다", async () => {
    const prisma = createPrismaMock([1n, 2n, 3n]);
    const notification = createNotificationMock();
    const service = new SchedulerAlertService(
      prisma as never,
      notification as never,
    );

    await service.notifyAdminsOnFailure("station-sync", 42n, "외부 API 오류");

    expect(notification.create).toHaveBeenCalledTimes(3);
    expect(notification.create).toHaveBeenCalledWith(
      1n,
      "announcement",
      expect.objectContaining({
        title: "스케줄러 작업 실패",
        jobName: "station-sync",
        runId: "42",
      }),
    );
  });

  it("어드민이 없으면 notification.create 를 호출하지 않는다", async () => {
    const prisma = createPrismaMock([]);
    const notification = createNotificationMock();
    const service = new SchedulerAlertService(
      prisma as never,
      notification as never,
    );

    await service.notifyAdminsOnFailure("train-time-sync", 1n, "오류");

    expect(notification.create).not.toHaveBeenCalled();
  });

  it("notification.create 가 실패해도 예외를 밖으로 던지지 않는다", async () => {
    const prisma = createPrismaMock([1n]);
    const notification = { create: jest.fn(() => Promise.reject(new Error("DB 오류"))) };
    const service = new SchedulerAlertService(
      prisma as never,
      notification as never,
    );

    await expect(
      service.notifyAdminsOnFailure("seat-hold-expire", 9n, "타임아웃"),
    ).resolves.toBeUndefined();
  });

  it("errorMessage 가 200자를 초과하면 잘라서 저장한다", async () => {
    const prisma = createPrismaMock([1n]);
    const notification = createNotificationMock();
    const service = new SchedulerAlertService(
      prisma as never,
      notification as never,
    );
    const longMsg = "x".repeat(300);

    await service.notifyAdminsOnFailure("station-sync", 1n, longMsg);

    const payload = notification.create.mock.calls[0][2] as Record<string, unknown>;
    expect((payload.errorMessage as string).length).toBe(200);
  });
});
