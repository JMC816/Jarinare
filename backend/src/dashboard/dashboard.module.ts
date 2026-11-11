import { Module } from "@nestjs/common";
import { TravelStatModule } from "../travel-stat/travel-stat.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TravelStatModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
