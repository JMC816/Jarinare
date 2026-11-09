// @role: features/seat
// @rule: 운행편(영화의 "상영 회차") 등록·조회만 담당
import { HttpStatus, Injectable } from "@nestjs/common";
import type { TrainTrip } from "../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AppException } from "../common/errors/app.exception";
import { ErrorCode } from "../common/errors/error-code";
import { isUniqueViolation } from "./seat-db.util";
import { TrainsService } from "../trains/trains.service";
import type { UpsertTripDto } from "./dto/seat.dto";

export interface TripDto {
  tripId: number;
  trainNo: string;
  trainType: string;
  depPlaceId: string;
  arrPlaceId: string;
  depPlandTime: string;
  arrPlandTime: string;
  depName: string;
  arrName: string;
  adultcharge: number;
}

export const toTripDto = (t: TrainTrip): TripDto => ({
  tripId: Number(t.id),
  trainNo: t.trainNo,
  trainType: t.trainType,
  depPlaceId: t.depPlaceId,
  arrPlaceId: t.arrPlaceId,
  depPlandTime: t.depPlandTime,
  arrPlandTime: t.arrPlandTime,
  depName: t.depName,
  arrName: t.arrName,
  adultcharge: t.adultcharge,
});

@Injectable()
export class TripService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trains: TrainsService,
  ) {}

  /**
   * 열차 시간 조회 결과로 운행편을 찾거나 만든다.
   *
   * adultcharge 는 stations_times 캐시에서 trainNo + depPlandTime 으로 찾아 서버가 직접 설정한다.
   * 운임을 찾지 못하거나 0(매진 표시)이면 예매를 거부한다.
   *
   * 같은 열차를 여러 사람이 동시에 처음 열면 둘 다 "없음" 을 보고 INSERT 한다.
   * MySQL 에서 Prisma upsert 는 조회-후-삽입이라 이 경합을 못 막으므로,
   * 먼저 INSERT 하고 UNIQUE 에 걸리면 이긴 쪽이 만든 행을 읽는다.
   */
  async upsert(dto: UpsertTripDto): Promise<TripDto> {
    const adultcharge = await this.resolveAdultcharge(dto);

    const key = {
      trainNo: dto.trainNo,
      depPlaceId: dto.depPlaceId,
      arrPlaceId: dto.arrPlaceId,
      depPlandTime: dto.depPlandTime,
    };
    try {
      return toTripDto(
        await this.prisma.trainTrip.create({ data: { ...dto, adultcharge } }),
      );
    } catch (e) {
      if (!isUniqueViolation(e)) throw e;
    }
    // 운임은 시간에 따라 바뀔 수 있으므로 충돌 시에도 갱신한다
    const updated = await this.prisma.trainTrip.update({
      where: { trainNo_depPlaceId_arrPlaceId_depPlandTime: key },
      data: { adultcharge },
    });
    return toTripDto(updated);
  }

  /**
   * stations_times 캐시에서 해당 열차의 adultcharge 를 조회한다.
   * 캐시 미스 시 외부 API 를 호출하며, 운임이 없거나 0 이면 예매를 거부한다.
   */
  private async resolveAdultcharge(dto: UpsertTripDto): Promise<number> {
    const trains = await this.trains.getTrainTimes({
      depPlaceId: dto.depPlaceId,
      arrPlaceId: dto.arrPlaceId,
      depPlandTime: dto.depPlandTime.slice(0, 8),
    });

    const trainNoNum = Number(dto.trainNo);
    const depTimeNum = Number(dto.depPlandTime);
    // 외부 API depplandtime은 14자리(YYYYMMDDHHmmSS)로 오는 경우가 있어 12자리로 정규화
    const toYYYYMMDDHHmm = (t: number) =>
      String(t).length > 12 ? Math.floor(t / 100) : t;
    const matched = trains.find(
      (t) =>
        t.trainno === trainNoNum &&
        toYYYYMMDDHHmm(t.depplandtime) === depTimeNum,
    );

    if (!matched || matched.adultcharge === 0) {
      throw new AppException(
        ErrorCode.TRAIN_FARE_UNAVAILABLE,
        "운임 정보를 확인할 수 없거나 매진된 열차입니다.",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return matched.adultcharge;
  }

  async get(tripId: number | bigint): Promise<TrainTrip> {
    const trip = await this.prisma.trainTrip.findUnique({
      where: { id: BigInt(tripId) },
    });
    if (!trip) {
      throw new AppException(
        ErrorCode.TRIP_NOT_FOUND,
        "운행편을 찾을 수 없습니다.",
        HttpStatus.NOT_FOUND,
      );
    }
    return trip;
  }
}
