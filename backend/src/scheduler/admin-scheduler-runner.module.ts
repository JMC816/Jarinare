import { Module } from "@nestjs/common";
import { AuditModule } from "../audit/audit.module";
import { StationsModule } from "../stations/stations.module";
import { TrainsModule } from "../trains/trains.module";
import { SeatModule } from "../seat/seat.module";
import { NotificationModule } from "../notification/notification.module";
import { SchedulerModule } from "./scheduler.module";
import { AdminSchedulerRunnerService } from "./admin-scheduler-runner.service";
import { AdminSchedulerRunnerController } from "./admin-scheduler-runner.controller";

/**
 * 스케줄러 잡 수동 실행 모듈.
 * SchedulerModule 은 도메인 모듈을 import 하면 순환 의존이 생기므로
 * 도메인 모듈을 사용하는 수동 실행 기능을 별도 모듈로 분리한다.
 */
@Module({
  imports: [
    AuditModule,
    SchedulerModule,
    StationsModule,
    TrainsModule,
    SeatModule,
    NotificationModule,
  ],
  controllers: [AdminSchedulerRunnerController],
  providers: [AdminSchedulerRunnerService],
})
export class AdminSchedulerRunnerModule {}
