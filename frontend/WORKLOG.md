# WORKLOG

## 2026-11-14 — 결제 모달 화면 금액 표시 오류 수정

### 작업 개요

서버가 최종 금액을 재계산하므로 돈이 새는 건 아니지만, 화면 표시 금액과 실제 결제 금액이 어긋나는 경우 4건을 수정했다.

---

### 프론트엔드

**미리보기 실패 처리**
- 기존 `.catch(() => {})` → 실패 시 `preview` 초기화 + 에러 문구 표시
- 미리보기 로딩 중·실패 시 결제 버튼 비활성화

**응답 순서 꼬임 방지**
- 포인트 입력 시 글자마다 요청 나가던 문제 → 300ms debounce 적용
- `cancelled` 플래그로 stale 응답 무시 (useEffect cleanup)

**포인트·계절 할인 역산 제거**
- 기존: 입력값(`value`)으로 직접 계산 → 서버 차감 한도와 어긋남
- 수정: `preview.usedPoint`, `preview.seasonDiscountAmount` 서버 응답값 사용

---

### 백엔드

**`seasonDiscountAmount` 응답 추가**
- `PriceCalcResult`에 `seasonDiscountAmount` 필드 추가
- 프론트가 역산 없이 서버 계산값을 그대로 쓸 수 있게

**KST 경계 테스트 추가**
- 기존 테스트는 매달 15일 고정 → UTC/KST 경계 미검증
- UTC 11/30 15:00 (= KST 12/1 00:00) 겨울 할인 적용 케이스 추가

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `seat/price-calculation.service.ts` | seasonDiscountAmount 필드 추가 |
| `seat/seat.service.spec.ts` | KST 경계 테스트 추가 |
| `TicketReserve/api/reservationApi.ts` | PricePreviewResult 타입 필드 추가 |
| `TicketReserve/hooks/usePayModal.ts` | debounce·에러 처리·서버값 사용 |
| `TicketReserve/ui/PayModal.tsx` | 에러 문구·버튼 비활성화·서버값 표시 |

---

### 현재 상태

- 전체 테스트 169개 통과
- 프론트 빌드 성공

---

## 2026-11-14 — 어드민 API 누락 엔드포인트 추가 · 경로 스펙 통일

### 작업 개요

API 목록 스펙과 현재 구현을 대조해 누락된 엔드포인트 5개를 추가하고, 경로 불일치 3건을 스펙 기준으로 정정했다.

---

### 백엔드

**경로 정정**

- `/admin/membership` → `/admin/membership-tiers`
- `/admin/discounts` → `/admin/card-discounts`
- `POST /admin/notifications/send` → `broadcast`

**누락 엔드포인트 추가**

- `POST /reports` — 사용자 신고 접수 (로그인 필수, 중복 신고 방지)
- `POST /admin/reports/:id/reject` — 신고 거절 (기존 resolve에서 분리)
- `PATCH /admin/users/:idx/membership` — 회원 멤버십 등급 직접 변경·해제
- `GET /card-discounts/active` — 활성 카드 할인 공개 조회 (사용자 결제 화면용, @Public)
- `DELETE /admin/seat-holds/:id` — 좌석 선점 강제 해제

**`/users/me` 응답 개선**

- `adminRole: { id, code, name } | null` 추가 — 프론트 메뉴 노출 판단용

---

### 프론트엔드

- `UserProfile` 타입에 `adminRole` 필드 추가

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `admin-membership/admin-membership.controller.ts` | 경로 변경 |
| `admin-discount/admin-discount.controller.ts` | 경로 변경 |
| `admin-discount/admin-discount.module.ts` | CardDiscountsController 추가 |
| `admin-discount/admin-discount.service.ts` | listActiveDiscounts() 추가 |
| `admin-notification/admin-notification.controller.ts` | send → broadcast |
| `admin-reports/admin-reports.controller.ts` | /reject 엔드포인트 추가 |
| `admin-reports/admin-reports.module.ts` | ReportsController 추가 |
| `admin-reports/admin-reports.service.ts` | createReport, rejectReport 추가 |
| `admin-reports/dto/admin-reports.dto.ts` | CreateReportDto, RejectReportDto 추가 |
| `admin-reservation/admin-reservation.module.ts` | AdminSeatHoldsController 추가 |
| `admin-reservation/admin-reservation.service.ts` | deleteSeatHold() 추가 |
| `admin-users/admin-users.controller.ts` | /membership 엔드포인트 추가 |
| `admin-users/admin-users.service.ts` | updateMembership() 추가 |
| `admin-users/dto/admin-users.dto.ts` | UpdateMembershipDto 추가 |
| `users/dto/user-response.dto.ts` | adminRole 필드 추가 |
| `users/users.service.ts` | toProfile() adminRole 포함 |
| `frontend/.../useCurrentUser.ts` | AdminRole 타입·필드 추가 |

---

### 현재 상태

- 전체 테스트 168개 통과
- 프론트 빌드 성공
- 추가된 API 전체 프론트 미구현 상태 (백엔드만 완성)

---

## 2026-11-14 — @Cron 실행 로그 DB 저장 · notification-drop SUPER_ADMIN 가드 추가

### 작업 개요

스케줄러 백엔드 추가 스펙 4번·5번을 구현했다. @Cron 기반 잡들이 `scheduler_run_log`에 기록되지 않던 문제를 해결하고, 알림 파티션 삭제에 SUPER_ADMIN 전용 실행 가드를 추가했다.

---

### 백엔드

**@Cron 실행 로그 추가**

- `notification.service.ts` — `runWithLog()` 헬퍼 추가, `runDropOldPartitionCron` / `runCreateNextMonthPartitionCron` private 래퍼로 분리. 성공/실패 모두 `scheduler_run_log`에 기록
- `seat-hold.service.ts` — `purgeExpired()` 로직 분리 (throws), `runPurgeExpiredCron()` private 래퍼에서 실패 시에만 로그 기록
- `seat-change.service.ts` — 동일 패턴 적용

**notification-drop SUPER_ADMIN 가드**

- `run-job.dto.ts` — `confirm?: boolean` 필드 추가
- `admin-scheduler-runner.controller.ts` — `notification-drop` 실행 시 `adminRoleCode !== 'SUPER_ADMIN'` → 403, `confirm !== true` → 400

**테스트**

- `scheduler-alert.service.spec.ts` — 4개 테스트 (어드민 수만큼 알림 발송, 없으면 미발송, 발송 실패 시 예외 전파 안 함, 200자 초과 truncate)

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/notification/notification.service.ts` | runWithLog() 헬퍼, private cron 래퍼 2개 |
| `src/seat/seat-hold.service.ts` | purgeExpired() 분리, cron 래퍼 실패 로그 |
| `src/seat/seat-change.service.ts` | expireStale() 분리, cron 래퍼 실패 로그 |
| `src/scheduler/dto/run-job.dto.ts` | confirm 필드 추가 |
| `src/scheduler/admin-scheduler-runner.controller.ts` | notification-drop 가드 추가 |
| `src/scheduler/scheduler-alert.service.spec.ts` | 신규 — 4개 테스트 |

---

### 현재 상태

- 모든 @Cron 잡 실행 결과 scheduler_run_log 기록 완료
- notification-drop: SUPER_ADMIN + confirm: true 없이 실행 불가
- 전체 테스트 15개 통과

---

## 2026-11-14 — 어드민 스케줄러 프론트엔드 구현

### 작업 개요

어드민 스케줄러 관리 화면을 구현했다. `/admin/scheduler` 접속 시 작업 목록·실행 로그 두 탭으로 구성된 PC 전용 페이지가 표시된다.

---

### 프론트엔드

- **`features/Admin/Scheduler/api/schedulerAdminApi.ts`** — 잡 목록·수동 실행·실행 로그·취소·재실행·설정 변경·대시보드 API 호출
- **`features/Admin/Scheduler/hooks/useSchedulerJobs.ts`** — 잡 목록 조회. RUNNING/PENDING 잡 있으면 5초 폴링
- **`features/Admin/Scheduler/hooks/useSchedulerRuns.ts`** — 실행 로그 조회·취소·재실행
- **`features/Admin/Scheduler/ui/JobListTab.tsx`** — 작업 목록 테이블. 행마다 [지금 실행] 버튼·활성 토글. 실행 중이면 버튼 잠금
- **`features/Admin/Scheduler/ui/RunLogsTab.tsx`** — 실행 로그 테이블. 상태·작업·건수 필터. 행 클릭 시 오류·결과 상세 펼침. PENDING → [취소], FAILED/CANCELLED → [재실행]
- **`features/Admin/Scheduler/ui/RunJobModal.tsx`** — 수동 실행 확인 모달. train-time-sync는 기간(startDate/endDate) 입력 UI 포함
- **`pages/Admin/Scheduler/ui/AdminSchedulerPage.tsx`** — 메인 페이지. 24h 실패·오래된 잡 경고 배너, 탭 전환
- **`app/routes.tsx`** — `/admin/scheduler` 라우트 추가

---

## 2026-11-14 — 스케줄러 화면 스펙 백엔드 구현 (1~5번)

### 작업 개요

스케줄러 화면 스펙에 따른 백엔드 기능 5가지를 구현했다. 순환 의존 문제를 별도 모듈로 분리해 해결했다.

---

### 백엔드

- **`SchedulerJobsService.listJobs()`** — `GET /admin/scheduler/jobs`. SchedulerRegistry + 마지막 실행 로그 + 활성 설정을 합쳐 6개 잡 목록 반환
- **`AdminSchedulerRunnerModule`** (새 모듈) — SchedulerModule이 도메인 모듈을 직접 import하면 순환 의존이 생기므로 별도 모듈로 분리
  - `POST /admin/scheduler/jobs/:name/run` — 6개 잡 수동 실행. train-time-sync는 startDate/endDate/days 받음. 큐에 적재 후 runId 반환
  - `POST /admin/scheduler/runs/:runId/retry` — FAILED·CANCELLED 상태 잡만 재실행 허용. 원본 params 복원 후 재적재
- **`DashboardService.getSummary()`** — `scheduler.failures24h` + `scheduler.staleJobs` 추가. 마지막 성공 시각이 임계값(분 잡 10분·일 잡 26시간·월 잡 33일) 초과 시 staleJobs에 포함
- **`SchedulerAlertService`** (새 서비스) — 잡 실패 시 `adminRoleId != null`인 모든 어드민에게 `announcement` 타입 알림 발송. `JobQueueService`에 `@Optional()` 주입
- **모듈 exports 확장** — `StationsModule`, `TrainsModule`, `SeatModule`에서 sync 서비스 export 추가

### 테스트

- **`scheduler-alert.service.spec.ts`** (4개) — 어드민 수만큼 알림 발송, 어드민 없으면 미발송, 발송 실패 시 예외 전파 안 함, 에러 메시지 200자 초과 시 truncate
- **`job-queue.service.spec.ts`** 추가 (2개) — 잡 실패 시 `notifyAdminsOnFailure` 호출, alert 없어도 정상 동작

---

## 2026-11-14 — 어드민 메뉴 5~10번 구현

### 작업 개요

멤버십·카드 할인·게시판·예매·알림·스케줄러 어드민 API를 구현했다. 전체 10개 메뉴 백엔드 완성.

---

### 백엔드

- **`AdminMembershipModule`** — 멤버십 등급 CRUD (`GET/POST /admin/membership`, `PATCH/DELETE /admin/membership/:id`). 보유 회원 있으면 삭제 거부
- **`AdminDiscountModule`** — 카드 할인 CRUD (`GET/POST /admin/discounts`, `PATCH/DELETE /admin/discounts/:id`). `discountType=rate`면 `discountRate` 자동 동기화
- **`AdminBoardModule`** — 게시글 목록·숨김·핀·삭제, 댓글 목록·숨김·삭제. `board.service.ts`에 `isHidden: { not: true }` 필터 추가 (숨긴 게시글 일반 조회 차단). DTO 클래스명 충돌(`BoardListQueryDto`, `UpdateCommentDto`) → `Admin` 접두사로 분리
- **`AdminReservationModule`** — 예매 목록·상세·강제 취소, 좌석 변경 요청 목록
- **`AdminNotificationModule`** — `POST /admin/notifications/send`. 특정 유저 or 전체 `announcement` 타입 알림 발송
- **`AdminSchedulerController`** — 기존 컨트롤러에 `GET /admin/scheduler/settings`, `PATCH /admin/scheduler/settings/:name` 추가. `upsert`로 잡 활성화·비활성화 설정 관리
- **`notification.types.ts`** — `announcement` 타입 추가

---

## 2026-11-13 — 어드민 메뉴 2·3·4번 구현

### 작업 개요

어드민 회원 관리, 역할·권한 관리, 신고 처리 API를 구현했다. 모든 엔드포인트에 `PermissionsGuard` + 감사 로그가 연결돼 있다.

---

### 백엔드

- **`AdminUsersModule`** — `GET /admin/users`, `GET /admin/users/:idx(?full=1)`, `POST /admin/users/:idx/suspend`, `POST /admin/users/:idx/unsuspend`, `POST /admin/users/:idx/force-logout`, `POST /admin/users/:idx/points` 구현. 목록·상세 기본 마스킹, `?full=1`이면 원문 + 감사 로그 기록
- **`AdminRolesModule`** — `GET /admin/roles`, `POST /admin/roles`, `PATCH /admin/roles/:id`, `DELETE /admin/roles/:id`, `GET /admin/admins`, `POST /admin/admins`, `PATCH /admin/admins/:idx`, `DELETE /admin/admins/:idx` 구현. 역할 수정·삭제 시 `RolePermissionsService` 캐시 즉시 무효화
- **`AdminReportsModule`** — `GET /admin/reports`, `GET /admin/reports/:id`, `POST /admin/reports/:id/resolve` 구현. `action=hide` 선택 시 board·comment `isHidden` 자동 처리
- **`permission.types.ts`** — `PERMISSIONS` 배열 추가 (역할 생성 시 유효 권한 검증용)
- 모든 어드민 컨트롤러에 `@ApiBearerAuth()` 추가

---

## 2026-11-11 — 대시보드 API · 권한 시스템 연결

### 작업 개요

어드민 대시보드 집계 API 2개를 추가했다. JWT에 `adminRoleCode`를 포함시켜 `PermissionsGuard`가 `admin_roles.code` 기준으로 권한을 판단하도록 연결했다. Permission 타입도 스펙 기준으로 정비했다.

---

### 백엔드

- **`DashboardModule`** — `GET /admin/dashboard/summary`, `GET /admin/dashboard/reservations/daily` 추가. 예매 수·매출·취소율·신규 가입·활성 사용자·좌석 변경 수락률·미처리 신고·스케줄러 실패·인기 목적지 집계
- **`AuthService.generateTokenPair`** — `adminRoleId`로 `admin_roles.code` 조회 후 JWT에 `adminRoleCode` 포함
- **`JwtAuthGuard`** — JWT payload에서 `adminRoleCode` 추출해 `AuthUser`에 포함
- **`PermissionsGuard`** — `user.adminRoleCode ?? user.role`로 권한 조회
- **`UsersService`** — `adminRole` relation include 후 `adminRole.code`로 permissions 조회
- **`permission.types.ts`** — 스펙 기준으로 정비 (`board:create/delete` → `board:manage` 등)

---

## 2026-11-11 — 어드민 스키마 v2

### 작업 개요

어드민 메뉴 구축을 위한 기반 스키마를 추가했다. 역할·정지·멤버십·신고·스케줄러 설정 등 새 테이블 4개와 기존 테이블 컬럼을 확장했다.

---

### 백엔드

- **`AdminRole`** — PK `role String @id` → `id BigInt @id` + `code String @unique` + `name` 구조로 변경
- **`User`** — `adminRoleId`, `status`, `suspendedUntil`, `suspendReason`, `membershipTierId` 컬럼 추가
- **`Board`** — `isHidden`, `isPinned`, `visibleFrom`, `visibleUntil` 추가
- **`Comment`** — `isHidden` 추가
- **`CardDiscount`** — `cardCode`, `discountType`, `value`, `maxDiscount`, `minPayment`, `startsAt`, `endsAt` 추가 (기존 `discountRate`·`paybackRate` 유지)
- **신규 테이블** — `reports`, `membership_tiers`, `scheduler_job_settings`
- **`RolePermissionsService`** — `row.role` → `row.code` 수정, 테스트 mock 동일하게 수정

---

## 2026-11-10 — 예매 시점 운임 재확인

### 작업 개요

예매 확정(`reservation.create`) 시 DB에 저장된 `adultcharge`를 그대로 쓰던 방식을, 공공 API 캐시(`stations_times`)에서 운임을 재조회 후 DB를 갱신하는 방식으로 변경했다. 마이그레이션 기본값(0)이나 조작된 금액으로 0원 예매가 가능했던 취약점을 차단한다. 단위 테스트도 함께 업데이트했다.

---

### 백엔드

- **`TripService.verifyAndRefreshFare`** — 예매 시점에 공공 API 캐시에서 운임 재조회, DB 갱신. 캐시 미스·adultcharge=0이면 422
- **`ReservationService.create`** — 단순 `adultcharge <= 0` 가드 → `verifyAndRefreshFare` 호출로 교체. 재조회된 `adultcharge`·`arrName`으로 금액 계산
- **단위 테스트 업데이트** — `verifyAndRefreshFare` mock으로 교체, 36개 통과

---

## 2026-11-10 — 카드 검증 강화 · 계절 판단 KST 기준

### 작업 개요

계절 할인 월 판단을 `new Date().getMonth()` → KST(+9) 기준으로 변경했다. UTC 서버에서 월이 바뀌는 순간 틀린 월로 판단하는 버그 수정. 카드 검증도 강화해 신용카드 결제 시에만 카드 할인을 적용하고, 등록되지 않은 카드명은 0원 할인이 아니라 400으로 거부하도록 변경했다.

---

### 백엔드

- **`PriceCalculationService`** — `new Date().getMonth()` → `Date.now() + 9h` UTC 기준으로 KST 월 계산
- **`PriceCalculationService`** — `paymentMethod` 파라미터 추가. `신용카드`일 때만 카드 할인 적용
- **`PriceCalculationService`** — 없는 카드명이면 할인 0 대신 400 `INVALID_CARD` 반환
- **`ErrorCode.INVALID_CARD` 추가**
- **`PricePreviewDto`** — `paymentMethod` 필드 추가
- **`ReservationService`** — `create`·`previewPrice` 호출 시 `paymentMethod` 전달
- **단위 테스트 업데이트** — `getMonth` mock → `Date.now` mock, 없는 카드 400·비신용카드 할인 무시 케이스 추가

---

### 프론트엔드

- **`reservationApi.ts`** — `fetchPricePreview` DTO에 `paymentMethod` 추가
- **`usePayModal.ts`** — 미리보기 호출 시 `paymentMethod` 전달

---

## 2026-11-10 — 결제 금액 미리보기 API · 화면 금액 서버 동기화

### 작업 개요

기존 결제 모달은 하드코딩된 `CARD_LIST`·`seasonStations`·10%로 금액을 직접 계산했다. 어드민에서 할인율·카드 목록을 바꿔도 화면은 옛 값을 보여줬고, 서버는 계절 할인을 자동 적용하는 반면 화면은 사용자가 선택해야 적용돼 표시 금액과 실제 결제 금액이 달랐다. 포인트 체크 해제 시 화면에서만 금액이 빠지는 버그도 있었다. 이번 작업으로 결제 전 미리보기 API를 추가하고, 화면은 그 값을 그대로 표시하도록 변경했다.

---

### 백엔드

- **`PricePreviewDto` 추가** (`tripId`, `seatCount`, `selectedCard?`, `usedPoint?`)
- **`ReservationService.previewPrice()` 추가** — trip에서 `adultcharge`·`arrName` 꺼내 `PriceCalculationService.calculate()` 호출
- **`POST /api/seats/price-preview` 엔드포인트 추가**

---

### 프론트엔드

- **`reservationApi.ts`** — `fetchPricePreview` 추가
- **`usePayModal.ts`** — 직접 계산 제거. 카드·포인트·체크 변경 시 미리보기 API 호출 후 반환값 표시. 포인트 체크 해제 시 `usedPoint: 0`으로 재조회해 버그 수정
- **`PayModal.tsx`** — 계절 할인 드롭다운 제거 (서버 자동 적용), `seasonDiscountApplied: true`이면 배너 표시

---

## 2026-11-10 — PriceCalculationService 단위 테스트 추가

### 작업 개요

계절 할인·카드 할인·포인트·페이백 계산 로직과 조작 시도 케이스를 단위 테스트로 커버했다.

---

### 테스트 케이스 (`seat.service.spec.ts`)

- 계절 할인 대상 역·기간 — 할인 적용
- 계절 할인 비대상 역 — 할인 미적용
- 겨울 기간 경계(12·1·2월) — 모두 적용, 3월은 미적용
- 카드 할인·페이백 — 계절 할인 후 카드 할인, 최종가에 페이백 계산
- 포인트가 잔여 금액 초과 — finalPrice 0, 실제 차감은 잔여 금액만
- [조작] adultcharge 0 → basePrice·finalPrice 0
- [조작] 계절 할인 대상 아닌 역 → 할인 미적용
- [조작] 없는 카드명 → 카드 할인 0, 페이백 0

---

## 2026-11-10 — depName·arrName 서버 검증 (계절 할인 조작 차단)

### 작업 개요

기존에는 프론트가 `depName`·`arrName`을 요청에 포함해 보냈고 서버가 그대로 저장했다. 계절 할인은 `trip.arrName`으로 판단하기 때문에, 부산행 열차인데 `arrName: "강릉"`으로 보내면 강릉 계절 할인을 받을 수 있는 취약점이 있었다. 이번 작업으로 `depName`·`arrName`도 `stations_times` 캐시에서 서버가 직접 채우도록 변경했다.

---

### 백엔드

- **`UpsertTripDto`에서 `depName`·`arrName` 제거** — 보내면 400 거부
- **`TripService.resolveAdultcharge` → `resolveFromCache`로 확장** — `adultcharge`와 함께 `depplacename`·`arrplacename`도 캐시에서 반환
- upsert 충돌 시 `adultcharge`·`depName`·`arrName` 모두 갱신

---

### 프론트엔드

- **`reservationApi.ts`** — `upsertTrip` DTO에서 `depName`·`arrName` 제거
- **`useSeatQueryData.ts`** — `upsertTrip` 호출·guard·dependency array에서 `depName`·`arrName` 제거

---

## 2026-11-10 — adultcharge 서버 검증 · 불필요한 upsert 제거

### 작업 개요

기존에는 프론트가 열차 조회 API 응답에서 `adultcharge`를 꺼내 `POST /api/seats/trips` 요청에 포함했다. 서버가 프론트 전달값을 그대로 저장하기 때문에 `adultcharge: 0`을 보내면 0원 예매가 가능했고, `train_trips`는 모든 사용자가 공유하는 테이블이라 한 명이 덮어쓰면 그 열차 전체 요금이 바뀌는 문제가 있었다. 이번 작업으로 서버가 `stations_times` 캐시에서 직접 운임을 조회·검증하도록 변경했다.

---

### 백엔드

- **`UpsertTripDto`에서 `adultcharge` 제거** — 프론트가 운임을 전달하지 않도록 차단
- **`TripService.resolveAdultcharge` 추가** — `stations_times` 캐시에서 `trainNo + depPlandTime`으로 열차 찾아 `adultcharge` 반환. 못 찾거나 0이면 422 `TRAIN_FARE_UNAVAILABLE` 반환 (매진 열차 예매 거부)
- **`TrainsModule` export 추가, `SeatModule`에 import** — `TripService`에서 `TrainsService` 주입 가능하도록
- **`ErrorCode.TRAIN_FARE_UNAVAILABLE` 추가**
- 외부 API `depplandtime`이 14자리(YYYYMMDDHHmmSS)로 오는 경우 12자리로 정규화해 비교

---

### 프론트엔드

- **`reservationApi.ts` · `useSeatQueryData.ts`** — `upsertTrip` 호출에서 `adultcharge` 제거
- **`useTicketLists.ts`** — `useSeatQueryData()` 전체 호출 대신 `getCachedAllSeats` · `useAllSeatsInfo` 직접 사용. 티켓 목록 페이지 진입 시 불필요한 `upsertTrip` 호출 제거
- **`trainDataStore.ts`** — `selectStartTime` · `selectEndTime` · `selectTrainType` · `tripId`를 sessionStorage persist 대상에서 제외. 새로고침 시 stale 열차 데이터로 `upsertTrip`이 발동돼 422가 반복되던 문제 수정

---

## 2026-11-08 — 모바일 UI 전면 정비 (헤더·배경색 통일, 게시판 카드 개선, 상세 페이지 아이콘)

### 작업 개요

모바일 전체 페이지의 헤더·배경색을 PC 버전에 맞게 통일하고, 게시판 허브 페이지의 통합게시판 카드 UI를 PC 스타일로 개선했다. 각 게시판 상세 페이지(자유·공지·이벤트)의 좋아요·즐겨찾기 버튼을 이모지에서 SVG 아이콘으로 교체·연결했다.

---

### 헤더·배경색 통일 (전체 모바일 페이지)

- **헤더**: 모든 모바일 페이지 헤더에 `bg-white/80 backdrop-blur-md` 적용 — PC 버전과 동일한 반투명 블러 헤더
- **메인 배경**: `bg-gray-100` → `bg-gray-50` 통일
- **구분선**: `mt-2 border-b` 패턴 → `h-2 bg-white/80 border-b border-gray-200/50` 로 변경 — 헤더 배경색이 구분선까지 이어지도록
- **대상 파일**: `BackWardPageButton`, `HomePage`, `BoardPage`, `BoardListPage`, `NoticeListPage`, `EventListPage`, `FavoriteListPage`, `NotificationPage`, `MenuPage`, `HistoryPage`, `TravelReviewListPage`, `NoticeDetailPage`, `BoardDetailPage`, `EventDetailPage`, `NoticeWritePage`, `EventWritePage`, `BoardWritePage`

---

### BoardPage — 통합게시판 카드 UI 개선

- 단순 카테고리 버튼 4개 → PC `Board.tsx` 위젯 스타일의 게시글 목록으로 교체
- `usePCBoardPage` 훅 재사용: 필터 탭(전체/공지/이벤트/자유) + 페이징 데이터 공유
- 게시글 행: 카테고리 뱃지(`CAT_STYLE_MAP`) + 제목 + 댓글수 + `[NEW]` 뱃지(`useBoardRead`) + 날짜
- 카드 외부로 "통합게시판" 제목 + "더보기" 버튼 분리
- `shrink-0` + `flex-1 overflow-y-auto` 구조로 헤더 높이 고정 (카드 높이 증가 시 헤더 수축 버그 수정)
- 계절 할인 배너(`SeasonBanner`) 위치를 여행후기 위로 이동
- `SeasonBanner` 메인 제목 `text-xs` → `text-base font-black` 으로 확대

---

### 게시판 상세 페이지 — 좋아요·즐겨찾기 아이콘 교체

- **BoardDetailPage**: 이모지(❤️/🤍, ⭐/☆) → HeartIcon·StarIcon SVG, 활성 시 각각 빨간/노란색 fill
- **NoticeDetailPage**: 플레이스홀더 이모지 제거 + `useBoardDetailPage` 연결 → 실제 좋아요·즐겨찾기 동작
- **EventDetailPage**: 없던 좋아요·즐겨찾기 바 신규 추가 + `useBoardDetailPage` 연결

---

### HistoryPage — 내부 텍스트 크기 증가

- 탭 버튼, 월 네비게이션, 날짜 라벨, 카드 내 역명/금액/포인트 텍스트: `text-xs` → `text-sm`, `text-sm` → `text-base`
- 필터 모달 라벨·버튼 동일하게 한 단계 상향

---

## 2026-11-06 — 결제 금액 서버 계산 (카드 할인 · 계절 이벤트 · 포인트)

### 작업 개요

결제 금액 계산 주체를 프론트 → 서버로 이전했다. 기존에는 프론트가 최종 금액을 계산해 서버로 전달했기 때문에 요청 조작으로 할인을 임의로 늘릴 수 있었다. 이번 작업으로 프론트는 카드사·포인트만 전달하고, 서버가 DB 값으로 직접 계산해 반환한다.

---

### 백엔드

**DB 스키마 + 마이그레이션**

- `20261014000000_add_price_calculation`
  - `train_trips.adultcharge INT DEFAULT 0` 컬럼 추가 — 성인 1인 기준 운임 저장
  - `card_discounts` 테이블 신규: `cardName`, `discountRate`, `paybackRate`, `isActive` + 초기 카드 8종 삽입
- `20261015000000_add_season_events`
  - `season_events` 테이블 신규: `name`, `discountRate`, `startMonth`, `endMonth`, `stations(JSON)`, `isActive` + 초기 계절 4종 삽입

**PriceCalculationService 신규 (`seat/price-calculation.service.ts`)**

- `calculate()`: 기준운임(adultcharge × 좌석수) → 계절 이벤트 할인 → 카드 할인 → 포인트 차감 → 페이백 계산
- `season_events` DB 조회: 현재 월 + 목적지역 일치 시 할인율 자동 적용 (겨울처럼 월 경계 넘는 경우 처리)
- `card_discounts` DB 조회: selectedCard 이름으로 discountRate·paybackRate 조회
- 하드코딩 상수 없음 — 모든 할인율 DB 관리

**CreateReservationDto 변경 (`seat/dto/seat.dto.ts`)**

- `totalPrice`, `paybackPoint` 제거 — 서버가 계산하므로 불필요
- `UpsertTripDto`에 `adultcharge` 추가

**TripService 업데이트 (`seat/trip.service.ts`)**

- `TripDto`·`toTripDto`에 `adultcharge` 추가
- `upsert()` 충돌 시 `adultcharge` 갱신 (운임 변동 반영)

**ReservationService 업데이트 (`seat/reservation.service.ts`)**

- `PriceCalculationService` 주입
- `create()`: `dto.totalPrice` 대신 `PriceCalculationService.calculate()` 결과 사용

---

### 프론트엔드

- `reservationApi.ts`: `upsertTrip`에 `adultcharge` 추가, `createReservation`에서 `totalPrice`·`paybackPoint` 제거
- `useSeatQueryData.ts`: `selectPay` 추가, `upsertTrip`·`createReservation` 호출 업데이트, `createSelectedSeats` 시그니처 변경 `(usedPoint, selectedCard, paymentMethod)`
- `usePayModal.ts`: `handlePay`에서 `selectedCard`·`paymentMethod` 전달

---

## 2026-11-03 — 어드민 감사 로그 시스템 구축 (AuditService · Winston · DB)

### 작업 개요

어드민 활동 감사 로그 시스템을 구축했다. 할인율·포인트·정지·권한 변경 등 민감한 어드민 작업을 Winston `AUDIT` 컨텍스트로 파일에 기록하고, 동시에 `admin_audit_logs` DB 테이블에도 저장해 어드민 화면에서 검색·조회할 수 있도록 했다. 스케줄러에는 수동 실행 어드민 추적 컬럼을 추가했다.

---

### 백엔드

**DB 스키마 + 마이그레이션 (`20261013000000_add_audit_logs`)**

- `admin_audit_logs` 테이블 신규: `actorIdx`, `action`, `targetType`, `targetId`, `before/after(JSON)`, `reason`, `ip`, `createdAt` + 인덱스 3개
- `scheduler_run_log` 컬럼 추가: `triggeredBy BIGINT?` (수동 실행 어드민 idx), `params JSON?` (실행 파라미터)

**Winston AUDIT 전용 transport (`winston.config.ts`)**

- `context === 'AUDIT'` 필터만 통과하는 `DailyRotateFile` 추가
- 파일명: `audit-%DATE%.log`, 포맷: JSON 한 줄
- 기본 보관 400일 (`AUDIT_LOG_MAX_FILES` env로 조정 가능)
- 개인정보 접속기록 보관 의무(1년↑, 100만명↑/정통사업자 2년) 주석 포함

**AuditService (`audit/audit.service.ts`)**

- `log(entry)` — Winston AUDIT 기록 + DB fire-and-forget (DB 실패해도 작업 안 막음)
- `list(query)` — actor·targetType·targetId·action 필터, 페이지네이션
- `get(id)` — before/after 포함 상세 조회
- `@Cron("5 0 1 * *")` — 매월 1일 1년 지난 행 자동 삭제

**AuditController (`GET /admin/audit-logs`)**

- `GET /admin/audit-logs` — 목록 (actor=, targetType=, targetId=, action= 필터)
- `GET /admin/audit-logs/:id` — 상세 (변경 전·후 값 포함)
- `@Permissions("admin:manage")` 보호

**Scheduler 업데이트**

- `EnqueueParams`: `triggeredBy?`, `params?` 필드 추가
- `JobQueueService.enqueue()`: 수동 실행 정보 DB 저장
- `SchedulerRunLogService`: `get(runId)` 메서드 추가, `triggeredBy` 필터/반환 추가
- `AdminSchedulerController`: `GET /admin/scheduler/runs/:runId` 상세 엔드포인트 추가
- `SchedulerRunQueryDto`: `triggeredBy` 필터 추가

---

## 2026-11-03 — 권한 시스템 정리 · useHasPermission 훅 · Firebase 잔존 코드 제거

### 작업 개요

오전 작업(권한 DB 마이그레이션)에 이어 오후에는 코드 품질 정리를 진행했다. 미사용 `isAdminRole` 제거, `useHasPermission` 공용 훅 도입, `RolesGuard` 삭제, `ROLE_PERMISSIONS` 코드 제거, Firebase 마이그레이션 후 남은 잔존 주석 및 테스트 값 정리.

---

### 백엔드

**RolesGuard 제거**

- `roles.guard.ts`, `roles.decorator.ts` 삭제 — `PermissionsGuard`로 완전 대체
- `auth.module.ts`에서 `APP_GUARD` 등록 제거

**ROLE_PERMISSIONS / hasPermission 제거**

- `permission.types.ts`: `ROLE_PERMISSIONS`, `ALL_PERMISSIONS`, `hasPermission()` 삭제
- `Permission` 타입 유니온만 유지 — 런타임 권한 데이터는 `admin_roles` DB가 단일 진실 공급원
- `permission.types.spec.ts` 삭제 — 테스트 대상 없어짐
- `permissions.guard.spec.ts`: `ROLE_PERMISSIONS` import 제거 → `TEST_PERMISSIONS` 인라인 정의

**Firebase 잔존 정리**

- `env.validation.spec.ts`: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` 3개 제거
- `kakao.controller.ts`: Swagger 설명 "Firebase Custom Token 발급" → "JWT 액세스 토큰 발급"
- `kakao-response.dto.ts`: `KakaoTokenResponseDto` 주석의 Firebase OAuthProvider 언급 제거

---

### 프론트엔드

**useHasPermission 훅 신규**

- `features/Auth/hooks/useHasPermission.ts`: 권한 코드 1개를 받아 boolean 반환
- `useCurrentUser`에서 `isAdminRole()` 미사용으로 삭제
- 6개 파일의 `user?.permissions?.includes('board:create') ?? false` 반복 → `useHasPermission('board:create')` 한 줄로 교체
  - `EventListPage.tsx`, `PCUnifiedWritePage.tsx`, `EventWritePage.tsx`, `NoticeWritePage.tsx`
  - `usePCEventListPage.ts`, `usePCNoticeListPage.ts`

---

## 2026-11-03 — 권한 시스템 3종 개선: :view 권한 추가 · permissions API · DB 마이그레이션

### 작업 개요

역할·권한 구조를 정적 코드 수준에서 DB 기반으로 격상했다. 대시보드·멤버십·카드·스케줄러에 조회용 `:view` 권한을 추가하고, `/api/users/me`에 `permissions` 목록을 내려 프론트가 role 하드코딩 없이 권한 코드만 보도록 교체했다. 마지막으로 `ROLE_PERMISSIONS` 정적 매핑을 `admin_roles` DB 테이블로 이전해 코드 배포 없이 역할별 권한 변경이 가능하도록 했다.

---

### 백엔드

**① `:view` 권한 추가 (`permission.types.ts`)**

- `dashboard:view`, `membership:view`, `card:view`, `scheduler:view` 4개 권한 코드 신규 추가
- `cs` 역할: `:view` 계열 7개 권한 부여 (dashboard, user, report, reservation, membership, card, scheduler)
- `marketer` 역할: `dashboard:view`, `membership:view`, `card:view` 추가
- `operator` 역할: `dashboard:view`, `scheduler:view` 추가

**② `/api/users/me` permissions 응답 추가**

- `UserProfileDto`: `permissions: string[]` 필드 추가 (`role` enum도 5단계로 수정)
- `users.service.ts`: `toProfile()` 시그니처에 `permissions` 파라미터 추가
- `getMe()`, `updateProfile()`, `updateNotificationSettings()`, `toProfilePublic()` 모두 `RolePermissionsService`에서 권한 조회 후 주입

**③ 권한 DB 마이그레이션 (`admin_roles` 테이블)**

- `RolePermissionsModule` / `RolePermissionsService` 신규
  - DB에서 읽고 60초 TTL 인메모리 캐시
  - `getPermissions(role)`, `hasPermission(role, permission)`, `invalidate()` 제공
- `schema.prisma`: `AdminRole` 모델 추가
- 마이그레이션 `20261012000000_add_admin_roles`: 테이블 생성 + 5개 역할 시드
- `PermissionsGuard`: 비동기로 전환, `RolePermissionsService.getPermissions()` 사용
- `board.service.ts`, `comment.service.ts`: 정적 `hasPermission()` → `await this.rolePermissions.hasPermission()`
- `AuthModule`, `BoardModule`, `CommentModule`, `UsersModule`: `RolePermissionsModule` import 추가
- `oauth.controller.ts`: `toProfilePublic()` async 전환에 따른 `await` 추가
- 스펙 업데이트: `permissions.guard.spec.ts` (async 전환 + mock 주입), `users.service.spec.ts` (mock 주입)

---

### 프론트엔드

**role 하드코딩 → permissions 기반 교체**

- `UserProfile` 타입: `permissions: string[]` 필드 추가
- 6개 파일에서 `user?.role === 'super_admin' || user?.role === 'operator' || user?.role === 'marketer'` 제거
  - `EventListPage.tsx`, `PCUnifiedWritePage.tsx`, `EventWritePage.tsx`, `NoticeWritePage.tsx`
  - `usePCEventListPage.ts`, `usePCNoticeListPage.ts`
  - → `user?.permissions?.includes('board:create') ?? false` 로 통일

---

## 2026-11-02 — 역할·권한 구조 도입 · viewCount 중복 수정 · 공유 버튼 구현

### 작업 개요

어드민 기반 작업의 첫 단계로 역할·권한 구조를 새로 구축했다. 기존 `"user"` / `"admin"` 2단계 role을 5단계(`user`, `cs`, `marketer`, `operator`, `super_admin`)로 확장하고, 권한 코드 단위로 API를 제어하는 `@Permissions()` 데코레이터와 `PermissionsGuard`를 도입했다. 함께 viewCount 이중 증가 버그를 수정하고 게시글 공유 버튼을 구현했다.

---

### 백엔드

**역할·권한 구조 신규 도입**

- `UserRole` 타입 확장: `user | cs | marketer | operator | super_admin`
- `permission.types.ts` 신규: 14개 권한 코드 정의 + `ROLE_PERMISSIONS` 정적 매핑 + `hasPermission()` 헬퍼
- `permissions.decorator.ts` 신규: `@Permissions('report:resolve')` 형태 데코레이터
- `permissions.guard.ts` 신규: 전역 가드로 등록, 권한 코드 단위 접근 제어
- `auth.module.ts`: `PermissionsGuard` APP_GUARD 전역 등록
- `jwt-auth.guard.ts`: role 값 그대로 통과 (기존 `"admin" → "admin"` 하드코딩 제거)
- 기존 `@Roles("admin")` 전체 교체
  - `admin-scheduler.controller.ts`, `admin-stations.controller.ts`, `admin-trains.controller.ts` → `@Permissions("scheduler:run")`
  - `notification-admin.controller.ts` → `@Permissions("admin:manage")`
- `board.service.ts`, `comment.service.ts` 어드민 권한 체크: `"admin"` → `"super_admin" || "operator"`
- `users.service.ts` `ensureUser` role 타입 `UserRole`로 통일
- 마이그레이션 `20261011000000_update_user_roles`: 기존 DB의 `role = 'admin'` → `'super_admin'`

**댓글 목록 전용 API 신규 (`GET /api/comment?boardId=xxx`)**

- `CommentService.getByBoardId()` 추가 — viewCount 변경 없이 댓글만 조회
- `CommentController`에 `@Public()` + `@Get()` 엔드포인트 연결

**viewCount 이중 증가 버그 수정**

- 원인: `commentsApi.ts`가 댓글 조회를 위해 `getBoardDetailApi` 재호출 → `getDetail` 두 번 실행
- 수정: `commentsApi.ts`를 새 `/api/comment` 엔드포인트 호출로 교체

---

### 프론트엔드

**역할 기반 어드민 판별 교체**

- `useCurrentUser.ts`: `UserRole` 타입 추가, `isAdminRole()` 헬퍼 추가
- `VITE_ADMIN_EMAIL` 이메일 비교 5곳 → `user.role` 기반으로 교체
  - `usePCNoticeListPage.ts`, `usePCEventListPage.ts`, `PCUnifiedWritePage.tsx`, `NoticeWritePage.tsx`, `EventWritePage.tsx`
  - 공지/이벤트 작성 권한: `super_admin | operator | marketer`

**viewCount StrictMode 이중 호출 방지**

- `BoardDetailPage.tsx`, `EventDetailPage.tsx`, `PCNoticeDetailPage.tsx`
- `useRef(false)` 플래그로 `useEffect` 두 번째 실행 차단 → 개발/배포 모두 +1 증가

**게시글 공유 버튼 구현**

- `usePCBoardDetailPage.ts`: `handleShare` (클립보드 복사) + `copied` 상태 추가
- `PCBoardDetailPage.tsx`: 공유 버튼 onClick 연결, 복사 완료 시 2초간 초록색 "복사됨" 표시

---

## 2026-11-01 — 결제/포인트 내역 페이지 신규 · 모바일 UI 개선 배치 · FSD 위반 수정

### 작업 개요

모바일 전용 UI 개선 2차 배치. 배경색 전면 통일, 메뉴 페이지 레이아웃 정리, 추천여행지 카드 개선, 좌석 선택 UI PC 스타일 통일, 결제/포인트 내역 신규 페이지 구현, 필터 모달 3섹션 구조화까지 진행했다. 마지막에 FSD 규칙 검사를 수행하고 이번 세션에서 도입한 위반 2건을 수정했다.

---

### 프론트엔드

**모바일 배경색 통일 (`bg-gray-100` → `bg-gray-50`)**

- 잔존하던 `bg-gray-100` 배경을 전 모바일 페이지에서 `bg-gray-50`으로 통일
- 대상: NotificationPage, SettingPage, TravelReviewListPage, TravelReviewPage, TicketSeatChangePage, BoardPage, TrainCheckPage, SeatCheckPage, MenuPage

**메뉴 페이지 개선 (`MenuPage.tsx`, `MenuConstants.ts`)**

- 메뉴 아이템 카드 배경 제거, 아이콘 제거 (마이페이지·승차권반환)
- 게시판 카테고리 소제목 제거, 서브 아이템을 최상위 레벨로 평탄화
- 구분선 `border-b border-gray-100` 추가
- 결제/포인트 내역 항목(`/history`) 추가

**MyPage 결제/포인트 내역 카드 제거 (`MyPage.tsx`)**

- 마이페이지에 있던 결제/포인트 내역 카드 및 관련 state·import 전체 제거
- `/history` 페이지로 분리함에 따라 중복 제거

**추천여행지 개선 (`RecommendDestination.tsx`)**

- `DESTINATIONS`의 `image` 필드를 카드 배경으로 적용 (linear-gradient 오버레이 포함)
- 카드 `rounded-2xl` → `rounded-xl` (덜 둥글게)
- 카드 클릭 시 `CITY_HIGHLIGHTS`의 특징 4가지 수직 나열 (emoji + 제목 + 설명)
- 방문통계(`detailStat`) 섹션 제거

**SeasonBanner PC 크기 복구 (`SeasonBanner.tsx`)**

- 배너를 모바일 사이즈로 줄였던 이전 변경이 PC에도 영향을 줬던 문제 수정
- `lg:` 접두어로 PC 원본 크기 복구, 모바일은 축소 유지

**SeatCheckList PC 스타일 통일 (`SeatCheckList.tsx`)**

- 좌석 크기 44×44px, `rounded-md border border-gray-200`, 중앙 정렬 레이아웃으로 재작성
- 열 헤더(A B / C D), 행 번호, 좌우 그룹 구조 PC와 동일하게 통일
- `isLocksLoaded` 상태 확인 후 클릭 허용

**SeatCheckMenu 위치 이동 (`SeatCheckPage.tsx`, `SeatCheckMenu.tsx`)**

- 호차 선택 버튼을 별도 행에서 "TRAIN SELECTION" 소제목 줄 오른쪽으로 이동
- "호차 선택" 레이블 제거, 버튼만 `h-[28px]` 콤팩트 형태로 유지

**결제/포인트 내역 페이지 신규 생성**

- `src/pages/History/ui/HistoryPage.tsx` 신규 생성
- `src/pages/History/hooks/useHistoryFilter.ts` 신규 생성 (FSD 분리)
- `src/app/routes.tsx`에 `/history` 라우트 추가 (PublicHomeLayout 하위)
- 구성: 결제/포인트 탭 전환 · 월별 네비게이션 · 날짜별 카드 그룹핑 · 플로팅 필터 버튼

**HistoryPage 필터 모달 3섹션 구조화**

- 기존 단순 기간 선택 → 3섹션으로 확장
  - **조회 기간**: 전체 / 1개월 / 3개월 / 직접설정 (6개월 제거)
  - **거래 유형**: 탭별 분기 — 결제 내역: 전체/구매/반환, 포인트 내역: 전체/적립/사용
  - **거래 내역 정렬**: 최신순 / 과거순
- 탭 전환 시 거래 유형 필터 자동 초기화
- 버튼 스타일: PC 통합게시판 세그먼트 탭과 동일한 `rounded-sm bg-gray-100 p-1` 형식 적용
- 플로팅 버튼에 현재 적용된 필터 조합 요약 표시 (예: `3개월 · 구매 · 최신순`)

---

### FSD 규칙 검사 및 수정

이번 세션에서 도입한 위반 2건 수정. 기존 코드의 위반 3건은 별도 확인 후 처리 예정.

| 파일 | 위반 | 수정 |
| --- | --- | --- |
| `widgets/TicketReserve/ui/SeatCheckList.tsx` | `@/widgets/layouts/ui/LoadingScreen` cross-slice import | `loading.png` 인라인 스피너로 교체 |
| `pages/History/ui/HistoryPage.tsx` | `dateKey`, `dateLabel`, `groupByDate`, `applyPeriodFilter`, `handleApply` 등 비즈니스 로직이 ui 파일에 포함 | `hooks/useHistoryFilter.ts`로 분리 |
| `pages/History/ui/HistoryPage.tsx` | `formatMonthDay` 미사용 import | 제거 |

기존 위반 (미수정):

| 파일 | 위반 내용 |
| --- | --- |
| `pages/Menu/constants/MenuConstants.ts` | constants 파일에서 `useCurrentUser()` hook 호출 |
| `widgets/TicketReserve/ui/SeatCheckMenu.tsx` | `@/widgets/model/ReserveStore` 동일 레이어 cross-slice import |
| `pages/TicketReserve/ui/SeatCheckPage.tsx` | ui 파일에서 `reservationApi` 직접 호출 |

---

**수정 파일**

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/History/ui/HistoryPage.tsx` | 신규 — 결제/포인트 내역 페이지 |
| `src/pages/History/hooks/useHistoryFilter.ts` | 신규 — 필터 상태·로직 훅 |
| `src/app/routes.tsx` | `/history` 라우트 추가 |
| `src/pages/Menu/constants/MenuConstants.ts` | 결제/포인트 내역 메뉴 항목 추가 |
| `src/pages/Menu/ui/MenuPage.tsx` | 아이템 배경·아이콘 제거, 구분선 추가 |
| `src/pages/Mypage/ui/MyPage.tsx` | 결제/포인트 내역 카드 및 관련 state 제거 |
| `src/widgets/TicketReserve/ui/RecommendDestination.tsx` | 실제 이미지 적용, 특징 카드, 방문통계 제거 |
| `src/widgets/Season/ui/SeasonBanner.tsx` | lg: 접두어로 PC 원본 크기 복구 |
| `src/widgets/TicketReserve/ui/SeatCheckList.tsx` | PC 스타일 좌석 UI 재작성, 인라인 스피너 |
| `src/widgets/TicketReserve/ui/SeatCheckMenu.tsx` | 호차 선택 버튼 컴팩트화 |
| `src/pages/TicketReserve/ui/SeatCheckPage.tsx` | SeatCheckMenu TRAIN SELECTION 줄로 이동 |

---

## 2026-11-01 — 모바일 UI 전반 개선 (NavBar 아이콘, 헤더 통일, 반환 카드 재설계)

### 작업 개요

모바일 전용 UI를 전면 개선했다. PC는 일절 건드리지 않았으며, PC 레이아웃 분기(`lg:hidden` / `lg:block`)를 통해 PC 화면에는 영향 없도록 유지했다. 주요 작업은 NavBar 아이콘 교체, 헤더 위치·구조 통일, 승차권 반환 카드 재설계 및 반환 플로우 모달화, 이벤트 카드 크기 축소, 왕복 버튼 제거다.

---

### 프론트엔드

**NavBar 아이콘 교체**

- PNG 이미지 기반 아이콘 → PC 사이드바와 동일한 인라인 SVG로 교체
- 활성: `#2563eb`, 비활성: `#9ca3af`
- HomeIcon(4분할 사각), BoardIcon(말풍선), UserIcon(사람), MenuIcon(햄버거), KeyIcon(열쇠)
- `NavBarConstants`, `NavBarHook` 의존성 제거

**홈 내 승차권 카드 너비 수정**

- `<div className="mb-[20px]">` → `<div className="mb-[20px] w-full">` — 카드가 가로 공간을 채우지 않던 문제 수정

**알림 페이지 개선**

- 설정 아이콘·`Link` import 제거
- 알림 목록, 안내 텍스트, 모두읽음 버튼 모두 `px-[28px]` 패딩 적용

**왕복 버튼 제거 (`ReserveWay.tsx`)**

- `isRoundTrip` state, 왕복 버튼, 관련 `useState`·캘린더 import 제거
- 항상 편도(가는날 + 인원) 레이아웃만 표시

**이벤트 카드 높이 축소 (`Event.tsx`)**

- GiftIcon 크기 72 → 48
- EventCardTop 패딩 `py-10` → `py-4`
- 카드 패딩·마진 전반 축소

**메뉴 페이지 뒤로가기 버튼 추가 (`MenuPage.tsx`)**

- 기존 제목 텍스트 → `useBackButton` 훅 + backward 이미지 버튼 + "메뉴" 텍스트로 교체

**승차권 반환 카드 재설계 (`MiniTicket.tsx`)**

- `onReturnPC` prop 유무로 PC/모바일 레이아웃 분기
  - PC(`onReturnPC` 있음): 기존 넓은 카드 레이아웃 그대로 유지
  - 모바일(`onReturnPC` 없음): 2행 구조 — 상단(뱃지·날짜·인원), 하단(여정 + 반환하기 버튼)
- 반환하기 클릭 → `setSeatsReturnData(groups)` + `openModal('ReturnModal')` 호출
- `<Modal />` 모바일 전용으로 MiniTicket 내부에서 렌더

**반환 플로우 모달화**

- 기존 별도 반환 페이지(`TicketReturnPage`) 대신 모달로 처리
- 라우팅 제거, MiniTicket에서 직접 모달 오픈

**헤더 구조 전체 통일**

알림 페이지 헤더(`flex w-full items-center px-[28px] pt-[20px]` + 내부 `flex items-center gap-3` 래퍼)를 기준으로 전 페이지 통일.

| 파일 | 변경 내용 |
| --- | --- |
| `BackWardPageButton.tsx` | `ml-3` 제거 → 내부 `flex items-center gap-3` 래퍼 추가 |
| `EventListPage.tsx` | `bg-white shadow-sm pb-4 px-[27px]` 제거 → `px-[28px]` + 내부 래퍼 |
| `BoardListPage.tsx` | 동일 |
| `NoticeListPage.tsx` | 동일 |
| `FavoriteListPage.tsx` | 동일 |
| `MenuPage.tsx` | outer `gap-3` 제거 → `w-full` 추가 + 내부 래퍼 |
| `BoardDetailPage.tsx` | `border-b bg-white px-4 pb-4 pl-[28px] pr-[27px]` 제거 → `px-[28px]` + 내부 래퍼 (justify-between 유지) |
| `EventDetailPage.tsx` | 동일 |
| `NoticeDetailPage.tsx` | 가운데 정렬용 spacer 제거 → `px-[28px]` + 내부 래퍼 |
| `TravelReviewPage.tsx` | `gap-3 pb-4` 외부 div에서 제거 → 내부 래퍼 추가 (blue 배경 유지) |

---

## 2026-10-30 — 실시간 인기지수 조회수 포함 + 상세 페이지 중복 호출 버그 수정

### 작업 개요

실시간 인기지수 산정에 조회수(`viewCount`)를 추가했다. 기존에 `b.views`로 잘못 참조해 `undefined`로 계산되던 버그를 수정해 실제 조회수가 인기지수에 반영되도록 했다. 또한 이벤트·공지 상세 페이지에서 `useEffect` 재실행 시 `getBoardDetailApi`와 `markRead`가 중복 호출되던 버그를 `useRef(hasFetched)` 패턴으로 수정했다.

---

### 백엔드

**실시간 인기지수 조회수 반영**

- `getTopPosts` 스코어 계산에 `viewCount` 추가 — 기존 `b.views` (undefined) → `b.viewCount` 오타 수정
- 최종 인기지수: `liked + shareCount + bookmarkCount + viewCount`

**수정 파일**

| 파일 | 변경 내용 |
| --- | --- |
| `src/board/board.service.ts` | getTopPosts 스코어 계산에 viewCount 추가 (b.views → b.viewCount 수정) |

---

### 프론트엔드

**상세 페이지 중복 API 호출 버그 수정**

- `EventDetailPage`, `PCNoticeDetailPage`에 `useRef(hasFetched)` 패턴 추가 — 재렌더 시 `getBoardDetailApi`·`markRead` 중복 실행 방지
- `BoardDetailPage`는 기존에 이미 적용되어 있었음

**인기지수 툴팁 텍스트 업데이트**

- 산정 기준 툴팁에 "조회 수" 항목 추가

**수정 파일**

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/Board/ui/EventDetailPage.tsx` | hasFetched ref 추가, 중복 API 호출 방지 |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx` | hasFetched ref 추가, 중복 API 호출 방지 |
| `src/pages/Board/ui/PCBoardPage.tsx` | 툴팁 산정 기준에 조회 수 항목 추가 |

---

## 2026-10-26 — 즐겨찾기 기능 구현 + 실시간 인기 지수 기준 변경

### 작업 개요

자유게시판 즐겨찾기 기능을 백엔드 DB 방식으로 구현했다. 게시물 상세 페이지에 즐겨찾기 버튼을 추가하고 클릭 시 optimistic update로 즉각 색이 반영된다. 게시판 허브 카테고리에 즐겨찾기 항목과 카운트를 추가했으며, 즐겨찾기 목록 페이지를 공지사항 리스트 UI 기반으로 구현했다. 실시간 인기 게시물 기준을 조회수에서 `좋아요 + 공유 수 + 즐겨찾기 수` 합산 인기지수로 변경했고, 공유와 즐겨찾기 모두 1인 1회로 제한했다. 인기 카드에 ⓘ 툴팁 아이콘을 추가해 산정 기준을 표시한다.

---

### 백엔드

**즐겨찾기**

- `board_bookmarks(boardId, userIdx)` 테이블 생성 — 복합 PK로 1인 1회 보장
- `POST /board/bookmarks` 토글, `GET /board/bookmarks/me` ID 목록, `GET /board/bookmarks/posts` 전체 목록 엔드포인트 추가
- `toggleBookmark` — 이미 존재하면 삭제(해제), 없으면 생성(추가)
- `getBookmarkedPosts` — bookmark 기준으로 board 조인 후 `BoardListItemDto` 형태 반환

**실시간 인기 지수**

- `boards` 테이블에 `shareCount INT DEFAULT 0` 컬럼 추가
- `board_shares(boardId, userIdx)` 테이블 생성 — 공유 1인 1회 제한
- `POST /board/share/:boardId` (인증 필수) — 첫 공유만 `shareCount +1`, 이미 공유한 유저는 early return
- `getTopPosts` 스코어 계산 변경: `liked + shareCount + bookmarkCount` 기준 정렬 후 상위 N개 반환

**수정 파일**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/schema.prisma` | BoardBookmark·BoardShare 모델 추가, Board에 shareCount·bookmarks·shares 릴레이션 추가, User에 boardBookmarks·boardShares 릴레이션 추가 |
| `prisma/migrations/20261008000000_add_board_bookmarks/` | board_bookmarks 테이블 생성 SQL |
| `prisma/migrations/20261009000000_add_board_share_count/` | boards.shareCount 컬럼 추가 SQL |
| `prisma/migrations/20261010000000_add_board_shares/` | board_shares 테이블 생성 SQL |
| `src/board/dto/board-request.dto.ts` | BookmarkBoardDto 추가 |
| `src/board/board.service.ts` | toggleBookmark·getBookmarkIds·getBookmarkedPosts·incrementShare 추가, getTopPosts 인기지수 기반으로 변경 |
| `src/board/board.controller.ts` | 즐겨찾기 3개·공유 엔드포인트 추가 |

---

### 프론트엔드

**즐겨찾기**

- `useBookmark` 훅 — `bookmarkIds` 쿼리 캐시를 직접 수정하는 optimistic update, 실패 시 이전 값으로 롤백
- PC 상세 페이지 기존 비활성 ★ 버튼 연결 (`StarIcon` filled prop 추가), 모바일 상세 페이지 ⭐/☆ 버튼 추가
- 즐겨찾기 목록 페이지 `/board/favorites` 신규 구현 — 공지사항 리스트 UI 동일 구조
- 게시판 허브 카테고리에 즐겨찾기 항목 추가, `bookmarkIds.length`로 카운트 실시간 반영

**실시간 인기 지수**

- `TopPost.views` → `TopPost.score` 타입 변경
- PC 상세 공유 버튼 클릭 시 `incrementShareApi` 호출 (로그인 유저만)
- 실시간 인기 카드 서브텍스트 `조회 N` → `인기지수 N` 변경
- 제목 옆 ⓘ 아이콘 추가 — 호버 시 산정 기준 툴팁 표시 (좋아요 수 / 공유 수 1인 1회 / 즐겨찾기 수 1인 1회)

**수정 파일**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/Board/api/bookmarkApi.ts` | 신규 — 즐겨찾기 토글·ID 목록·게시물 목록 API |
| `src/features/Board/api/topViewedPostApi.ts` | TopPost.views → score 타입 변경, incrementShareApi 추가 |
| `src/features/Board/hooks/useBookmark.ts` | 신규 — optimistic update 즐겨찾기 훅 |
| `src/pages/Board/constants/boardPageConstants.ts` | CAT_STYLE_MAP review 항목 추가, BOARD_CATEGORIES 즐겨찾기 추가 |
| `src/pages/Board/hooks/usePCBoardDetailPage.ts` | isBookmarked·handleBookmark 추가, 공유 시 incrementShareApi 호출 |
| `src/pages/Board/hooks/useBoardDetailPage.ts` | isBookmarked·handleBookmark 추가 |
| `src/pages/Board/hooks/usePCFavoriteListPage.ts` | 신규 — 즐겨찾기 목록 페이지 상태·로직 훅 |
| `src/pages/Board/ui/PCFavoriteListPage.tsx` | 신규 — PC 즐겨찾기 목록 UI |
| `src/pages/Board/ui/FavoriteListPage.tsx` | 신규 — 모바일+PC 즐겨찾기 목록 래퍼 |
| `src/pages/Board/ui/PCBoardDetailPage.tsx` | StarIcon filled prop 추가, 즐겨찾기 버튼 연결 |
| `src/pages/Board/ui/BoardDetailPage.tsx` | 모바일 즐겨찾기 버튼 추가 |
| `src/pages/Board/ui/PCBoardPage.tsx` | 즐겨찾기 카운트 반영, ⓘ 툴팁 아이콘, 인기지수 표시 |
| `src/pages/Board/ui/BoardPage.tsx` | 모바일 즐겨찾기 항목 추가 |
| `src/app/routes.tsx` | /board/favorites 라우트 추가 |

---

## 2026-10-21 — 검표(inspected) 기능 구현 + QR 페이로드 reservationId 추가 + 좌석변경 비활성화

### 작업 개요

승무원 QR 검표 기능을 구현했다. 예매 테이블에 `inspected` 컬럼을 추가하고, QR 페이로드에 `reservationId`를 인코딩해 QR 페이지 접속 시 자동으로 검표 처리(0→1)가 이루어지도록 했다. 검표 완료된 좌석 또는 운행 중인 열차의 좌석변경 버튼을 비활성화했다. 검표완료된 좌석에 교환 신청도 차단했다. 내 티켓 QR 패널의 "승차권 보기" 버튼을 QR 코드 이미지로 교체했다.

---

### 구현 내용

**검표 컬럼 추가**

- `reservations` 테이블에 `inspected Boolean @default(false)` 컬럼 추가
- 마이그레이션: `20261006000000_add_inspected_to_reservations`
- `listMine` 응답 `TicketDto`에 `inspected` 필드 포함 → 프론트 `SeatType.inspected`로 매핑

**QR 페이로드 reservationId 인코딩**

- `encodeTicketNumeric` 포맷 끝에 `reservationIds: 10*n` 추가
- `decodeTicketNumeric` — tail 이후 seatCount개만큼 10자리씩 추출
- `useTicketDetail.ts` — `seats.map(s => s.reservationId ?? 0)` 전달, base64 fallback `rids` 필드도 추가
- `KTX-산천` 열차 타입 `TRAIN_TYPE_TO_CODE` 매핑 누락 추가 (`'02'`)

**검표 PATCH API**

- `PATCH /api/seats/reservations` — `{ reservationIds: number[] }` 받아 `inspected = true` 업데이트
- `InspectReservationDto` 추가
- `reservation.service.ts` — `inspect()` 메서드: `WHERE id IN (...) AND userIdx = me AND canceledAt = ACTIVE`
- `TicketViewPage.tsx` — mount 시 `rids` 추출 후 PATCH 호출

**좌석변경 비활성화**

- `PCTicketItem.tsx` — `status === 'running'` 또는 `groups.some(g => g.inspected)` 조건 시 버튼 회색 비활성화
- `seat-change.service.ts` — 교환 신청 시 `occupants.some(o => o.inspected)` 체크 → `SEAT_ALREADY_RESERVED` 에러 "검표가 완료된 좌석은 변경 신청할 수 없습니다."

**QR 코드 UI 교체**

- `TicketCard.tsx` — "승차권 보기" 버튼 → `StyledQRCode size={180}` 교체
- `PCTicketItem.tsx` QR 패널 — "승차권 보기" 버튼 → `StyledQRCode size={120}` 교체

---

### 수정 파일 목록

**백엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/schema.prisma` | Reservation에 `inspected Boolean @default(false)` 추가 |
| `prisma/migrations/20261006000000_add_inspected_to_reservations/` | 마이그레이션 SQL |
| `src/seat/dto/seat.dto.ts` | `InspectReservationDto` 추가 |
| `src/seat/reservation.service.ts` | `TicketDto.inspected` 추가, `inspect()` 메서드 추가 |
| `src/seat/seat.controller.ts` | `PATCH reservations` 엔드포인트 추가 |
| `src/seat/seat-change.service.ts` | 교환 신청 시 `inspected` 체크 추가 |

**프론트엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `src/entities/Seat/types/seatType.ts` | `inspected?: boolean` 추가 |
| `src/features/TicketReserve/api/reservationApi.ts` | `TicketDto.inspected`, `SeatType.inspected` 매핑 추가 |
| `src/shared/constants/ticketEncoding.ts` | `reservationIds` 인코딩/디코딩, `KTX-산천` 매핑 추가 |
| `src/features/TicketChange/hooks/useTicketDetail.ts` | `reservationIds` QR 페이로드 전달 |
| `src/pages/TicketChange/ui/TicketViewPage.tsx` | mount 시 PATCH 호출, `rids` 디코딩 |
| `src/pages/TicketList/ui/PCTicketItem.tsx` | 좌석변경 버튼 비활성화 조건, QR 코드 이미지 교체 |
| `src/widgets/TicketChange/ui/TicketCard.tsx` | QR 코드 이미지 교체 |

---

## 2026-10-20 — PCWelcomeTour 완전 독립 목업 + 내 티켓 PC 개선 + 기차종류 필터 수정

### 작업 개요

PCWelcomeTour의 목업 데이터 주입 방식을 Zustand 스토어 직접 쓰기에서 각 소비 훅 내 `isTourActive` 조건부 오버라이드 방식으로 전환해 투어 종료 후 실제 상태에 데모 데이터가 잔존하지 않도록 완전히 격리했다. 열차조회 기차종류 필터가 일부 종류에서 작동하지 않던 원인을 분석하고 클라이언트 사이드 필터링으로 수정했다. 결제 이벤트 선택을 네이티브 `<select>`에서 커스텀 드롭다운으로 교체했다. 내 티켓 PC 페이지에서 지도 패널 높이 제한 해제, 지도 줌 리셋 버그 수정, QR 코드 크기 확대, 좌석변경 버튼 UI 개선을 수행했다.

---

### 구현 내용

**PCWelcomeTour 완전 독립 목업**

- 기존: `injectDemoData(step)` 함수가 `trainDataStore`(sessionStorage persist)에 데모값 직접 write → 투어 종료 후에도 데모 데이터 잔존
- 변경: `injectDemoData` 전체 제거, 각 소비 훅에서 `isTourActive ? 하드코딩값 : 실제값` 패턴으로 완전 격리
- `usePCHomePage.ts` — 투어 중 `startStationForView='서울'`, `endStationForView='부산'`, `startDayForView=내일`, `adult=1`, `kid=0`, `isSearchDisabled=false`
- `usePCTrainCheckPage.ts` — 투어 중 `trainTypeForView='KTX'`, `startTimeForView='06시 이후'`, `selectedDate=내일`, train 필터 전체 bypass
- `useSeatQueryData.ts` — 투어 중 API 호출 skip, DEMO_LOCKS 로컬 상수 주입 (`setLocks + setIsLocksLoaded`)
- `usePayModal.ts` — 투어 초기값 `selectPay=59800`, `point=5000`, `checked=true`, `value=3000`, `selectedPaymentMethod='신용카드'`, `selectedCard='국민'`
- `PCWelcomeTour.tsx` — `window.addEventListener('resize', measure)` 추가 → 해상도 변경 시 spotlight 재계산, 버블 너비 `w-96 max-w-[90vw]`

**열차조회 기차종류 필터 수정**

- 원인: 백엔드 DB 캐시 키에 `trainGradeCode` 미포함 → 기차 종류 파라미터를 보내도 항상 전체 목록 반환
- 수정: `PCTrainCheckConstants.ts` — `TRAIN_OPTIONS`에 `gradeName` 필드 추가 (API의 `traingradename` 값과 매핑)
  - KTX-산천A/B: `gradeName: 'KTX-산천'`, ITX-새마을호: `gradeName: 'ITX-새마을'` (label과 다른 케이스 명시)
- `usePCTrainCheckPage.ts` — 클라이언트 사이드 필터링 추가: `trainTime.filter(t => t.traingradename === selectedGradeName)`

**결제 이벤트 드롭다운 커스텀**

- 기존: 네이티브 `<select>` 사용 → OS별 스타일 불일치
- `usePayModal.ts` — `isEventOpen` 상태, `eventDropdownRef`, `handleToggleEventDropdown`, `handleSelectEvent` 추가
- 외부 클릭 감지: `document.addEventListener('mousedown', handleOutside)` + `isEventOpen` 의존 useEffect
- `PayModal.tsx` — 커스텀 드롭다운 렌더링: 선택 안함(검은 텍스트) / 계절 할인(시즌 색상 + 이모지), `border-current`로 선택 시 테두리 색상 유지

**내 티켓 지도 패널 높이 수정**

- 기존: 지도 뷰에서도 `lowerPanelHeight` 제약이 걸려 지도가 작게 표시
- `PCTicketItem.tsx` — `routeView !== 'map'`일 때만 height 제약 적용, 지도 뷰는 `height: 300` 고정

**지도 줌 리셋 버그 수정**

- 원인 1: `useTicketDetail`의 `segmentStations` useMemo 의존성이 `[seats]`(배열 레퍼런스) → 부모 재렌더 시 `groups` 새 참조 → `segmentStations` 새 배열 → `RouteMap` memo 미적중 → kakao Map 재초기화
- 수정 1: 의존성을 `[s.trainType, s.startStationForView, s.endStationForView]` (실제 값)으로 변경
- 원인 2: `parseDateTime` 결과가 매 렌더마다 새 Date 객체 생성 → `RouteCard` useEffect `[departure, arrival]` 매초 재실행
- 수정 2: `parseDateTime` 결과를 `useMemo([s.startTime, dur])`로 memoize

**QR 코드 크기 수정**

- 기존: `size={120}` → 한글 포함 URL ~250자 인코딩 시 모듈당 ~1.5px → 카메라 인식 불가
- `TicketCard.tsx` — `size={200}` (모듈당 ~2.5px 이상 확보)

**좌석변경 버튼 UI 개선**

- `PCTicketItem.tsx` — 구간/QR 토글과 동일 너비(`w-full`), 파란 배경, `py-2`, `text-[13px] font-bold`
- 텍스트 "좌석 변경" → "좌석변경 + chevron-right SVG 아이콘"으로 교체
- 구간/QR 버튼도 동일하게 `text-[13px]`로 크기 통일

---

### 수정 파일 목록

**프론트엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `src/widgets/Tour/ui/PCWelcomeTour.tsx` | injectDemoData 제거, resize listener 추가, 버블 반응형 너비 |
| `src/pages/TicketReserve/hooks/usePCHomePage.ts` | 투어 중 역/날짜/인원 오버라이드 |
| `src/pages/TicketReserve/hooks/usePCTrainCheckPage.ts` | 투어 오버라이드, 클라이언트 사이드 기차종류 필터 |
| `src/pages/TicketReserve/constants/PCTrainCheckConstants.ts` | TRAIN_OPTIONS에 gradeName 필드 추가 |
| `src/features/TicketReserve/hooks/useSeatQueryData.ts` | 투어 중 API skip + DEMO_LOCKS 주입 |
| `src/widgets/TicketReserve/hooks/usePayModal.ts` | 투어 초기값, 커스텀 이벤트 드롭다운 상태/핸들러 |
| `src/widgets/TicketReserve/ui/PayModal.tsx` | 네이티브 select → 커스텀 드롭다운 UI |
| `src/pages/TicketList/ui/PCTicketItem.tsx` | 지도 패널 height 조건 수정, 좌석변경 버튼 파란 배경·아이콘·크기 |
| `src/features/TicketChange/hooks/useTicketDetail.ts` | segmentStations 의존성 실제 값으로 변경, departure/arrival memoize |
| `src/widgets/TicketChange/ui/TicketCard.tsx` | QR 코드 size 120 → 200 |

**백엔드**

없음

---

## 2026-10-14 — 내 승차권 PC UI 개선 (PCTicketItem)

### 작업 개요

내 승차권 PC 페이지(`PCTicketItem.tsx`)의 레이아웃 및 스타일을 전반적으로 개선했다. 상단바 영역 분리, 우측 패널 수직 가운데 정렬, 아래쪽 정차역/QR 패널 높이 일치, HorizontalTimeline 시각 개선이 주요 내용이다.

---

### 구현 내용

**프론트엔드**

**상단바 구조 개선**

- 기존: CSS gradient(`linear-gradient`)로 좌측만 파란색 처리 → ticketNo 위치 문제 및 우측 흰색 덧칠 문제 발생
- 변경: 카드 전체를 `flex-row`로 재구조화 — 좌측 컬럼(`flex-1 flex-col`)에 파란 헤더 + 날짜/노선 포함, 우측 패널(`w-40`)은 헤더 없이 카드 전체 높이 차지
- 파란 헤더: `width: calc(100% - 161px)` 고정 → 우측 패널 영역은 헤더 미적용
- ticketNo를 헤더 오른쪽 끝(`justify-between`)에 배치, `text-white/60` 색상

**우측 패널 수직 가운데 정렬**

- 기존: `justify-center`만으로는 헤더 높이가 포함된 전체 카드 높이 기준 센터링 불가
- 수정: 카드 구조를 `flex-row`로 변경해 우측 패널이 헤더 포함 전체 높이를 가져가도록 구조 수정
- 내부 아이템(좌석·탭·좌석변경)을 wrapper로 묶고 `my-auto` 적용 → 전체 카드 높이 기준 수직 가운데 정렬

**날짜/노선 섹션 높이 조정**

- `py-2` → `py-5`로 변경해 상단 콘텐츠 높이 확장

**아래쪽 패널 높이 통일**

- 정차역 뷰: `routeView === 'stations'`일 때 패널 외부에 `height: 136px` 적용 → QR 패널(`p-5` + `h-24` = 136px)과 동일한 높이
- 지도 뷰: 조건부 적용이므로 기존 300px 유지

**HorizontalTimeline 시각 개선**

- 출발/도착 소제목을 시간 옆 인라인 배치(`flex gap-0.5`), 색상 파란색으로 통일
- 처음·끝역 마커: `border-blue bg-blue` 유지
- 중간역 마커: `border-gray-300` → `border-blue bg-white` (passed 여부 무관 통일)
- 연결선: `bg-gray-200` → `bg-blue`, 원과의 간격 추가(`calc(50% + 10px)` offset)
- 역명과 마커 사이 여백: `mt-2` → `mt-3`
- 위쪽 카드 노선 오른쪽 원: `border-gray-400` → `border-blue`

---

### 수정 파일 목록

**프론트엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/TicketList/ui/PCTicketItem.tsx` | 카드 구조 flex-row 재편, 헤더 영역 분리, 우측 패널 my-auto 센터링, 패널 높이 통일, HorizontalTimeline 스타일 전면 개선 |

**백엔드**

없음

---

## 2026-10-13 — 좌석변경 상대방 좌석 선택 수정 + 로그아웃 리다이렉트 수정 + 여행통계 백엔드 연동

### 작업 개요

좌석변경 페이지에서 상대방 좌석 클릭 시 변경 타깃 지정이 안 되던 버그, 타깃 hold 시 409 에러, 로그아웃 후 공개 페이지 접근 불가 버그를 수정했다. 여행통계 조회를 Firestore에서 백엔드 API로 교체했다.

---

### 구현 내용

**좌석변경 상대방 좌석 선택 수정**

- 기존: `createAt` 기반 그룹 매칭 로직이 백엔드 좌석 상태 API의 `createAt: 0` 하드코딩으로 인해 `mySeatsNotInThisTicket` 교집합이 항상 비어있지 않아 조기 return → `setSeatsChangeTarget` 미실행
- 수정: 그룹 매칭 블록 전체를 제거하고 `userId === 'me'` → no-op, `userId === 'other'` → 해당 좌석 직접 타깃 지정으로 교체
- `eachSeat` 필터에 `trainNoId === trainNo` 조건 추가 — 다른 호차 동일 번호 좌석 간섭 방지
- 단일 좌석 예매(`mySeats.length === 1`)이면 `isSeatsChangeTarget = true` → 변경 요청 버튼 활성화

**좌석변경 상대방 좌석 hold 409 수정**

- 기존: `seatsChangeTarget` 설정 시 `useMixSeats` effect가 `lockSeat` 호출 → 상대방 예약 좌석은 이미 reserved 상태라 409 Conflict
- 수정: `lockSeat` 호출 전 `seatsChangeInfo.some(s => s.seatId === r)` 으로 점유 여부 확인 → 점유 좌석은 hold 스킵

**로그아웃 후 공개 페이지 접근 불가 수정**

- 원인 1: `/oauth/logout` 응답이 401이면 인터셉터가 refresh 시도 → refresh 실패 → `window.location.href = '/auth/login'` 강제 이동, `navigate('/')` 덮어씀
- 수정 1: 인터셉터 401 재시도 조건에 `original.url?.includes('/oauth/logout')` 추가 — 로그아웃 요청은 retry 없이 바로 reject
- 원인 2: 로그아웃 후 in-flight API 요청이 401 받으면 인터셉터가 refresh 시도 → 쿠키 삭제됐으므로 실패 → `/auth/login` 리다이렉트
- 수정 2: 인터셉터에서 `localStorage.getItem(ACCESS_TOKEN_KEY)` 없으면 (= 로그아웃 상태) refresh 시도 자체 차단

**여행통계 백엔드 연동**

- `useTravelStatic.ts`: Firestore `travelStats` 컬렉션 조회 → `GET /api/travel-stats` 교체
- 백엔드 응답 구조가 기존 `StatItem` 타입과 동일해 데이터 변환 로직 불필요
- `useSaveReserveStat.ts` 삭제 — 미사용 + 백엔드가 예매 완료 시 자동으로 `TravelStatService.recordReservation()` 집계

---

### 수정 파일 목록

**프론트엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/TicketChange/hooks/useSeatsSelect.ts` | 상대방 좌석 직접 타깃 지정, `eachSeat` trainNoId 필터, `useSeatsGroupInfo` import 제거 |
| `src/features/TicketChange/hooks/useMixSeats.ts` | `lockSeat` 전 `isOccupied` 체크 추가 — 점유 좌석 hold 스킵 |
| `src/shared/api/backendClient.ts` | `/oauth/logout` retry 제외 조건 추가, 토큰 없으면 refresh 차단 |
| `src/widgets/TicketReserve/hooks/useTravelStatic.ts` | Firestore → `GET /api/travel-stats` 교체 |
| ~~`src/features/TicketReserve/hooks/useSaveReserveStat.ts`~~ | 삭제 (백엔드 자동 집계로 대체) |

---

## 2026-10-09 — Firebase auth → JWT 전환 (좌석예매·좌석변경·마이페이지) + 포인트 API URL 수정

### 작업 개요

Firebase `auth.currentUser` 를 참조하던 좌석예매·좌석변경·내 승차권 관련 코드를 JWT 기반으로 전면 전환했다. 좌석예매·변경 PC 레이아웃 버그, 로딩 화면 위치 버그, 좌석 선택 blocked 버그를 수정했다. 포인트/주문 API URL에 `/api/` prefix 누락을 수정하고, `PCMyPage`의 React hooks 규칙 위반을 수정했다.

---

### 구현 내용

**Firebase auth → JWT 전환**

- `auth.currentUser` 는 소셜 로그인(JWT 전환 후) 시 항상 null — 모든 참조를 `localStorage.getItem(ACCESS_TOKEN_KEY)` 체크로 교체
- `userId` 마커 컨벤션 도입: `'me'` = 내 좌석, `'other'` = 다른 사람 좌석 (기존 Firebase UID 대체)
- `useSeatQueryData.ts`: `auth.currentUser` → JWT 토큰 체크, `userId: s.state === 'MINE' ? 'me' : 'other'`
- `SeatCheckList.tsx`: Firebase auth 의존 제거, hooks 규칙 위반(`useResetSeatsState` 조건부 호출) 수정, `isLocked = id in locks` 단순화
- `useAllSeatsInfo.ts`: `prefetchAllSeats`의 `!user` 차단 → JWT 토큰 체크로 교체, `orderDtoToSeatTypes(orders, 'me')`
- `useTicketLists.ts`: Firebase auth 제거, `item.userId === 'me'` 필터로 교체
- `usePCSeatCheckPage.ts`, `usePCSeatChangePage.ts`: `auth` import, `const user`, `user` 반환값 제거

**좌석예매 PC 레이아웃 수정**

- `PCSeatCheckPage.tsx`: `overflow-x-hidden` → `overflow-x-auto`, `px-96` → `mx-auto max-w-[900px] min-w-[700px] px-6 pb-16 pt-6` — 화면 축소 시 좌석 잘림 방지
- `SeatCheckPage.tsx`: 모바일 컨테이너에 `min-w-[375px]` 추가

**좌석변경 페이지 수정**

- `PCSeatChangePage.tsx`: 로딩 화면 가운데 정렬 (`flex min-h-screen items-center justify-center` 래퍼 추가), PC 레이아웃 동일하게 적용
- `SeatChangePage.tsx`: 모바일 `min-w-[375px]` 추가
- `SeatChangeList.tsx`: Firebase auth 제거, `'me'`/`'other'` 마커, `isLocked = id in locks`
- `useSeatsSelect.ts`: `eachSeat.length > 0` 가드 추가 — 빈 좌석 클릭 시 그룹 매칭이 잘못 실행되어 hold 차단되던 버그 수정

**포인트 API URL 수정**

- `pointApi.ts`: `/orders/me` → `/api/orders/me`, `/points/history` → `/api/points/history` (prefix 누락으로 404 발생)

**PCMyPage React hooks 규칙 위반 수정**

- `PCMyPage.tsx`: `useBackendNotificationStore()`, `useQueryClient()` 가 조건부 return 이후에 호출되던 문제 → 조건부 return 이전으로 이동

---

### 수정 파일 목록

**프론트엔드**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/TicketReserve/hooks/useSeatQueryData.ts` | `auth.currentUser` → JWT 토큰 체크, `'me'`/`'other'` 마커 |
| `src/widgets/TicketReserve/ui/SeatCheckList.tsx` | Firebase auth 제거, hooks 위반 수정, `isLocked` 단순화 |
| `src/features/TicketReserve/hooks/useAllSeatsInfo.ts` | `prefetchAllSeats` Firebase → JWT 전환 |
| `src/features/TicketList/hooks/useTicketLists.ts` | Firebase auth 제거, `userId === 'me'` 필터 |
| `src/pages/TicketReserve/hooks/usePCSeatCheckPage.ts` | `auth` import, `user` 제거 |
| `src/pages/TicketReserve/ui/PCSeatCheckPage.tsx` | Firebase auth 제거, PC 레이아웃 수정 |
| `src/pages/TicketReserve/ui/SeatCheckPage.tsx` | 모바일 `min-w-[375px]` 추가 |
| `src/pages/TicketChange/hooks/usePCSeatChangePage.ts` | `auth` import, `user` 제거 |
| `src/pages/TicketChange/ui/PCSeatChangePage.tsx` | Firebase auth 제거, 로딩 화면 중앙 정렬, PC 레이아웃 수정 |
| `src/pages/TicketChange/ui/SeatChangePage.tsx` | 모바일 `min-w-[375px]` 추가 |
| `src/widgets/TicketChange/ui/SeatChangeList.tsx` | Firebase auth 제거, `'me'`/`'other'` 마커 |
| `src/features/TicketChange/hooks/useSeatsSelect.ts` | 빈 좌석 hold blocked 버그 수정 (`eachSeat.length > 0` 가드) |
| `src/features/Point/api/pointApi.ts` | `/api/` prefix 누락 수정 |
| `src/pages/Mypage/ui/PCMyPage.tsx` | hooks 규칙 위반 수정 (조건부 return 이전으로 이동) |

---

## 2026-10-08 — 좌석 예매·변경·포인트·여행통계 백엔드 구현

### 작업 개요

좌석 배치·선점·예매·취소·변경 신청/수락/거절 전체 흐름을 NestJS 백엔드로 구현했다. 포인트 사용·페이백·잔액 관리와 결제·포인트 내역 조회 API를 추가했다. 여행통계 집계·조회 모듈을 구현했다. Prisma 스키마에 새 모델을 추가하고 SeatModule을 앱에 등록했다.

---

### 구현 내용

**좌석 예매 시스템 (`SeatModule`, `/api/seats`)**

- `trip.service.ts` — 운행편 upsert (`POST /seats/trips`). 출발역·도착역·시간 조합이 같으면 기존 행 반환
- `seat-layout.service.ts` — 열차 종류별 좌석 배치도 조회 (`GET /seats/layout`). 전용 배치 없으면 기본 배치 fallback
- `seat-query.service.ts` — 호차별 잔여석 (`GET /seats/trips/:id/cars`), 호차 좌석 현황 (`GET /seats/trips/:id/cars/:carNo`). 좌석 상태: `AVAILABLE | HELD | HELD_BY_ME | RESERVED | MINE`
- `seat-hold.service.ts` — 좌석 선점 7분 TTL (`POST /seats/holds`, `DELETE /seats/holds`). 만료 청소 크론 (@Cron 매분)
- `reservation.service.ts` — 예매 확정 (`POST /seats/reservations`): 포인트 사용·페이백 원자 처리, 여행통계 집계 호출, 데드락 재시도. 예매 취소·반환 (`DELETE /seats/reservations`). 내 예매 목록 (`GET /seats/reservations/me`)
- `seat-change.service.ts` — 변경 신청 (`POST /seats/change-requests`): 빈 좌석 직접 이동 또는 교환 신청. 수락 (`POST /change-requests/:id/accept`): 좌석 교환 트랜잭션 + 교환 횟수 5회마다 2000P 보상. 거절/철회. 만료된 신청 자동 정리 크론
- `seat-db.util.ts` — 데드락 재시도(`withDeadlockRetry`), 유니크 충돌 감지, TX 옵션
- `seat.constants.ts` — 선점 TTL(7분), 변경 신청 TTL(10분), 상태 enum, 승객 타입

**포인트 모듈 (`PointModule`, `/api/points`, `/api/orders`)**

- `point.service.ts` — 결제 시 포인트 사용·카드 페이백 원자 처리 (비관적 락으로 동시 결제 잔액 경쟁 방지), 좌석 교환 보상 (+2000P / 5회), 포인트 적립 내역 조회 (`GET /points/history`)
- `order-history.service.ts` — 결제·반환 내역 기록 및 조회 (`GET /orders/me`). 기존 Firestore `orders/{uid}/detail` 구조와 동일한 응답 형태

**여행통계 모듈 (`TravelStatModule`, `/api/travel-stats`)**

- `travel-stat.service.ts` — 예매 완료 시 목적지·나이대·성별 통계 집계 (`recordReservation`). INSERT ... ON DUPLICATE KEY UPDATE로 동시 집계 유실 방지. 예매 많은 순 조회 (`GET /travel-stats`)

**스키마 추가 (`prisma/schema.prisma`)**

- `CarLayout`, `SeatSlot` — 열차 종류별 좌석 배치도
- `TrainTrip` — 운행편 (trainNo + 출발역·도착역·시간 유니크)
- `SeatHold` — 7분 선점 기록 (tripId, carNo, seatId, userIdx, expiresAt)
- `Reservation` — 예매 확정 기록 (orderId, passengerType, price, status)
- `SeatChangeRequest` — 변경 신청 (requester/target 관계, status, expiresAt)
- `PointHistory`, `OrderHistory` — 포인트·결제 내역
- `User` — seatHolds, reservations, changeRequest 관계 추가

**알림 연동**

- `notification.types.ts` — `seat_change_request`, `seat_change_accepted`, `seat_change_rejected` 타입 추가
- `notification.service.ts` — `create()` 메서드 추가 (트랜잭션 없이 단독 알림 생성용)

**에러 코드 추가 (`error-code.ts`)**

- 좌석: `TRIP_NOT_FOUND`, `SEAT_NOT_FOUND`, `RESERVATION_NOT_FOUND`, `SEAT_HOLD_LIMIT_EXCEEDED`
- 포인트: `INSUFFICIENT_POINT`

---

### 신규/수정 파일 목록

**백엔드 신규**

| 파일 | 내용 |
| --- | --- |
| `src/seat/seat.controller.ts` | 좌석 HTTP 엔드포인트 (15개) |
| `src/seat/seat.module.ts` | SeatModule 정의 |
| `src/seat/trip.service.ts` | 운행편 upsert |
| `src/seat/seat-layout.service.ts` | 배치도 조회 |
| `src/seat/seat-query.service.ts` | 좌석 현황 조회 |
| `src/seat/seat-hold.service.ts` | 선점 7분 TTL + 만료 크론 |
| `src/seat/reservation.service.ts` | 예매 확정·취소·목록 |
| `src/seat/seat-change.service.ts` | 변경 신청·수락·거절·철회 + 만료 크론 |
| `src/seat/seat-db.util.ts` | 데드락 재시도, TX 옵션 |
| `src/seat/seat.constants.ts` | TTL, 상태 enum |
| `src/seat/dto/seat.dto.ts` | 요청/응답 DTO |
| `src/point/point.controller.ts` | `GET /points/history`, `GET /orders/me` |
| `src/point/point.service.ts` | 포인트 사용·페이백·보상·내역 |
| `src/point/order-history.service.ts` | 결제·반환 내역 기록·조회 |
| `src/point/point.module.ts` | PointModule 정의 |
| `src/travel-stat/travel-stat.controller.ts` | `GET /travel-stats` |
| `src/travel-stat/travel-stat.service.ts` | 통계 집계·조회 |
| `src/travel-stat/travel-stat.module.ts` | TravelStatModule 정의 |

**백엔드 수정**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/schema.prisma` | CarLayout, SeatSlot, TrainTrip, SeatHold, Reservation, SeatChangeRequest, PointHistory, OrderHistory 모델 추가 |
| `src/app.module.ts` | SeatModule import 및 등록 |
| `src/common/errors/error-code.ts` | 좌석 에러 코드 4개, 포인트 에러 코드 1개 추가 |
| `src/notification/notification.types.ts` | seat_change_request/accepted/rejected 타입 추가 |
| `src/notification/notification.service.ts` | `create()` 메서드 추가 (비트랜잭션 단독 알림용) |

---

## 2026-10-05 — 알림 클릭 페이지 이동 + 로그아웃 버그 수정 + 댓글 좋아요 테이블 통합

### 작업 개요

알림 클릭 시 해당 게시물로 이동하는 기능을 추가했다. 로그아웃 후 다른 계정으로 로그인 시 이전 사용자 데이터가 남아있는 버그를 수정했다. `comment_likes` 테이블을 제거하고 `comments` 테이블 내 JSON 컬럼으로 통합하면서 비관적 락으로 race condition을 방지했다.

---

### 구현 내용

**알림 클릭 시 페이지 이동 (백엔드)**

- 알림 payload에 `path` 필드 추가 — 4가지 알림 타입 전체 적용
  - `board_like`: `board.service.ts` — `path: /board/${dto.boardId}?type=${board.type.toLowerCase()}`
  - `comment`, `reply`: `comment.service.ts` — `path: /board/${dto.boardId}?type=${board.type.toLowerCase()}`
  - `comment_like`: `comment.service.ts` — board 테이블 조회 후 `path: /board/${board.id}?type=${board.type.toLowerCase()}`
- `boardId`는 프론트에서 요청 body로 전달, `boardType`은 board 테이블을 직접 조회해서 조합

**알림 클릭 시 페이지 이동 (프론트)**

- `backendNotificationType.ts` — `BackendNotificationPayload`에 `path: string` 추가
- `BackendNotificationItem.tsx` — 카드 전체 클릭 시 `onClick()`(읽음 처리) + `navigate(payload.path)` 동시 실행
- `BackendNotificationItem.tsx` — 기존 밑줄 boardTitle 버튼 제거, 뱃지-텍스트 간격(`mb-1` → `mb-3`), 프로필-텍스트 수평 정렬(`items-start` → `items-center`)
- `PCTopNav.tsx` — ping 애니메이션 → 안읽은 알림 수 숫자 뱃지로 교체 (99+ 처리 포함)

**로그아웃 버그 수정 (이전 사용자 데이터 잔존)**

- 원인 3가지:
  1. 로그아웃 시 SSE 연결이 끊기지 않아 이전 사용자의 알림이 계속 수신됨
  2. `initialized = true`가 리셋되지 않아 다음 로그인 시 SSE 재연결 안됨
  3. `staleTime: Infinity`인 TanStack Query 캐시에 이전 사용자 데이터 잔존
- `useBackendNotifications.ts` — `resetBackendNotifications()` export 추가 (SSE close + initialized 리셋)
- `UserInfo.tsx`, `PCMyPage.tsx` — 로그아웃 핸들러에 `queryClient.clear()`, `resetBackendNotifications()`, `setNotifications([])` 추가

**댓글 좋아요 테이블 통합 (백엔드)**

- `comment_likes` 테이블 제거, `comments` 테이블에 `likedById JSON` 컬럼 추가
- 기존 방식: 별도 `comment_likes` 테이블에 `(commentId, userIdx)` 행 삽입/삭제
- 변경 방식: `comments.likedById` JSON 배열에 좋아요한 유저 idx 목록 직접 관리
- MySQL JSON 컬럼은 배열 요소 직접 추가 연산이 없어 read-check-write 패턴이 필수 → race condition 발생 가능
- 비관적 락(`SELECT ... FOR UPDATE`) 으로 해결 — 읽는 순간 X락, 쓰기 완료 후 해제
- 마이그레이션: `migrate reset` 대신 `npx prisma db execute`로 직접 SQL 실행 (데이터 손실 방지)
- `comment.service.ts` `getLikedCommentIds()` — `comment_likes` 조회 → `likedById` JSON 배열 필터로 교체

---

### 수정 파일 목록

**백엔드**
- `backend/src/board/board.service.ts`
- `backend/src/comment/comment.service.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/20261002000000_add_likedById_remove_comment_likes/migration.sql` (신규)

**프론트엔드**
- `frontend/src/widgets/Notification/types/backendNotificationType.ts`
- `frontend/src/widgets/Notification/ui/BackendNotificationItem.tsx`
- `frontend/src/widgets/layouts/ui/PCTopNav.tsx`
- `frontend/src/features/Notification/hooks/useBackendNotifications.ts`
- `frontend/src/widgets/MyPage/ui/UserInfo.tsx`
- `frontend/src/pages/Mypage/ui/PCMyPage.tsx`

---

## 2026-09-29 — 알림 시스템 개선 + 좌석 예매 로그인 체크 수정

### 작업 개요

알림 아키텍처를 NotificationQueueService에서 NotificationDispatcher + createInTx/deliver 패턴으로 개선했다. SSE 동작 원리(lastEventId, replay, heartbeat)를 분석했다. 댓글 작성 시 `GET /api/users/me` 반복 호출 원인을 파악했다. 좌석 예매 페이지 로그인 체크를 Firebase → JWT 기반으로 수정했다.

---

### 구현 내용

**알림 시스템 개선 (백엔드)**

- `NotificationQueueService` 제거 → `NotificationDispatcher`(폴링 워커) 교체
- `createInTx + deliver` 패턴 도입 — 댓글/좋아요와 같은 트랜잭션에 알림을 기록하고, 커밋 후 SSE 전달
- `board.service.ts`, `comment.service.ts`에 `shouldNotify` + `LIKE_TX_OPTIONS` 적용
- SSE 탭 다중 연결, replay 중복 방지(emitted Set), heartbeat 30s 유지
- `notification.types.ts` 분리 — `NotificationDto`, `toNotificationDto`, `shouldNotify` 공통화

**SSE 동작 분석**

- `lastEventId`: SSE 끊긴 구간 놓친 알림 replay 용도 — 로그인/로그아웃 시는 `getNotificationsApi()`(전체 조회)로 대체
- 30초마다 ping으로 연결 유지 (heartbeat)
- 현재 코드에서는 재연결 시 `lastEventId` 미사용, `getNotificationsApi()`로 전체 조회

**댓글 작성 시 `/api/users/me` 반복 호출 원인 분석**

- `CommentItem`, `ReplyItem`이 각각 `useCurrentUser()` 직접 호출
- 댓글 작성 → `setIsLoaded(false/true)` → `CommentItem` unmount/remount → 새 observer 등록 → stale 체크 → API 호출
- `staleTime: 60_000` + `PersistQueryClientProvider` invalidate 조합으로 60초마다 발생
- 해결 방향: `CommentSection`에서 1회만 호출 후 prop으로 전달, 또는 `staleTime: Infinity`

**좌석 예매 로그인 체크 수정 (프론트)**

- `SeatCheckPage.tsx`, `usePCSeatCheckPage.ts`에서 `!!auth.currentUser` → `useCurrentUser`의 `isLoggedIn`으로 교체
- JWT 로그인 후 예매 페이지 진입 시 "로그인하기" 버튼 뜨는 문제 수정
- 좌석 uid 확인용 `user`(Firebase)는 유지

---

### 수정 파일 목록

**백엔드**
- `backend/src/notification/notification-dispatcher.service.ts` (신규)
- `backend/src/notification/notification-dispatcher.service.spec.ts` (신규)
- `backend/src/notification/notification.types.ts` (신규)
- `backend/src/notification/sse.service.spec.ts` (신규)
- `backend/src/notification/sse.service.ts`
- `backend/src/notification/notification.service.ts`
- `backend/src/notification/notification.module.ts`
- `backend/src/notification/notification.controller.ts`
- `backend/src/notification/notification-admin.controller.ts`
- `backend/src/notification/notification-queue.service.ts` (삭제)
- `backend/src/board/board.service.ts`
- `backend/src/board/board.controller.ts`
- `backend/src/comment/comment.service.ts`
- `backend/src/comment/comment.controller.ts`
- `backend/SCHEDULER.md`

**프론트엔드**
- `frontend/src/pages/TicketReserve/ui/SeatCheckPage.tsx`
- `frontend/src/pages/TicketReserve/hooks/usePCSeatCheckPage.ts`

## 2026-08-28 — 알림 파티션 전략 변경 (연간 로테이션)

### 작업 개요

알림 파티션 전략을 매월 +1개 추가 방식에서 1년치 일괄 생성 + 연간 로테이션 방식으로 변경했다. 버그 3개를 수정하고 불필요한 어드민 API를 제거했다.

---

### 구현 내용

**파티션 전략 변경**

- 기존: 매월 1일 다음달 파티션 1개 `ADD PARTITION`, 2달 전 파티션 `DROP PARTITION`
- 변경: 이번달(2026-08) 기준 1년치(p_2026_08 ~ p_2027_07) 한번에 생성, 1년 주기 도달 시 새 1년치 생성 + 이전 1년치 삭제
- 마이그레이션 `20260828000000_notification_partition_yearly`: 기존 p_2026_08, p_2026_09에 p_2026_10 ~ p_2027_07 추가

**연간 로테이션 크론**

- 기존 크론 2개(`createNextMonthPartition`, `dropOldPartition`) 제거
- `rotateYearlyPartitions()` 신규 — `@Cron("5 0 1 * *")` 매월 1일 00:05 실행
  - 현재달 파티션 존재 → 패스 (일반 달)
  - 현재달 파티션 없음 → 새 12개월 파티션 생성 + 이전 12개월 파티션 삭제

**버그 수정 3개**

- `markAllAsRead` — `createdAt >= 이전달 1일` 필터 누락 → 12개 파티션 전체 스캔 문제 수정
- `rotateYearlyPartitions` — `rows[0]` null 체크 누락 수정
- `rotateYearlyPartitions` — `Promise<void>` → `Promise<boolean>` 변경, 로테이션 실행 여부 반환

**어드민 API 정리**

- `POST /admin/notification/partition/rotate` 수동 트리거 엔드포인트 제거 (크론으로 자동 처리)

---

### 수정/생성 파일 목록

**Backend**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/migrations/20260828000000_notification_partition_yearly/migration.sql` | p_2026_10 ~ p_2027_07 파티션 추가 (신규) |
| `src/notification/notification.service.ts` | rotateYearlyPartitions 크론, markAllAsRead createdAt 필터, boolean 반환 |
| `src/notification/notification-admin.controller.ts` | rotate 수동 엔드포인트 제거 |

---

## 2026-08-27 — 알림 DB 파티셔닝 + 인메모리 큐 + 지수 백오프

### 작업 개요

알림 테이블에 MySQL RANGE 파티셔닝을 적용해 월별 조회 성능을 최적화했다. 파티션 자동 생성/삭제 크론과 어드민 수동 삭제 API를 추가했다. 동시다발적 알림 처리를 위해 인메모리 큐(FIFO) + 지수 백오프 재시도 방식을 구현했다.

---

### 구현 내용

**알림 DB RANGE 파티셔닝**

- `Notification` 모델 PK를 `@id` → `@@id([id, createdAt])` 복합키로 변경 (MySQL RANGE 파티셔닝 요구사항)
- `user User @relation(...)` FK 제거 (MySQL 파티션 테이블 FK 미지원)
- `User` 모델에서 `notifications Notification[]` 역참조 제거
- 인덱스 `@@index([userIdx])` → `@@index([userIdx, createdAt])` 변경
- 마이그레이션: `notifications` 테이블 DROP 후 RANGE 파티셔닝 구조로 재생성
  - `PARTITION BY RANGE (YEAR(createdAt) * 100 + MONTH(createdAt))`
  - `p_2026_08`, `p_2026_09` 초기 생성
- `getList()` — `createdAt >= 이전달 1일` 필터 추가 (이전달 + 이번달 파티션 2개만 스캔)
- `getListByMonth(year, month)` 추가 — 특정 월 조회 시 파티션 프루닝 활성화
- 알림창 UI에 "이전 달부터 이번 달까지의 알림을 표시합니다." 안내 텍스트 추가

**파티션 자동 생성/삭제 크론**

- `@Cron("5 0 1 * *")` — 매월 1일 00:05, 다음달 파티션 `ADD PARTITION`
- `@Cron("10 0 1 * *")` — 매월 1일 00:10, 2달 전 파티션 `DROP PARTITION` (이전달 + 이번달만 유지)

**어드민 파티션 수동 삭제 API**

- `NotificationAdminController` 신규 생성
- `DELETE /api/admin/notification/partition?year=&month=` — 특정 월 파티션 즉시 삭제
- `POST /api/admin/notification/partition/drop-old` — 크론과 동일한 로직 즉시 실행
- 파티션 미존재 시 `INFORMATION_SCHEMA.PARTITIONS` 조회 후 404 반환

**알림 인메모리 큐 + 지수 백오프**

- `NotificationQueueService` 신규 생성
- `enqueue()` 동기 메서드로 즉시 적재 — 큐에 들어온 순서대로 처리 보장 (FIFO)
- 워커가 하나씩 꺼내 처리 — 동시 처리로 인한 충돌 없음
- 지수 백오프 재시도: 500ms → 1000ms → 2000ms, 최대 3회
- DB 저장 실패 시 재시도, SSE push 실패는 무시 (DB에 저장됐으니 알림창 열면 보임)
- `NotificationService.create()` → `notificationQueue.enqueue()` 위임으로 변경

---

### 수정/생성 파일 목록

**Backend**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/schema.prisma` | Notification 복합 PK, FK 제거, User 역참조 제거 |
| `prisma/migrations/20260824000000_notification_partition/migration.sql` | 파티셔닝 구조 테이블 재생성 |
| `src/notification/notification.service.ts` | getList 범위 필터, getListByMonth, dropPartition, 파티션 크론 2개 |
| `src/notification/notification.controller.ts` | year/month 쿼리 파라미터, @ApiQuery 추가 |
| `src/notification/notification-admin.controller.ts` | 파티션 수동 삭제/트리거 어드민 API (신규) |
| `src/notification/notification-queue.service.ts` | 인메모리 큐 + 지수 백오프 (신규) |
| `src/notification/notification.module.ts` | NotificationAdminController, NotificationQueueService 등록 |

**Frontend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx` | 알림 조회 범위 안내 텍스트 추가 |
| `src/pages/Notification/ui/NotificationPage.tsx` | 알림 조회 범위 안내 텍스트 추가 |

---

## 2026-08-24 — 알림 X 버튼 복구 + 삭제/읽음 API 구조 개선

### 작업 개요

백엔드 알림 UI에서 X(삭제) 버튼이 사라진 문제를 복구했다. 기존 Firebase 알림은 `SwipeToDelete` 래퍼로 X 버튼을 제공하고 있었지만, 신규 `BackendNotificationItem`에는 누락되어 있었다. 동시에 삭제 API와 단건 읽음 API의 엔드포인트 방식을 Path Parameter에서 Request Body 방식으로 변경했다.

---

### 구현 내용

**알림 X 버튼 복구**

- `BackendNotificationItem`에 `onDelete?: () => void` prop 추가
- 카드 컨테이너에 `group relative` 부여 후 `absolute -right-1.5 -top-1.5` 위치에 X 버튼 삽입
- hover 시 나타나는 방식 (`opacity-0 group-hover:opacity-100`) — `SwipeToDelete` X 버튼과 동일한 스타일
- `useBackendNotifications`에 `deleteNotification(id, type)` 추가 → API 호출 후 목록에서 즉시 제거

**알림 API 구조 변경**

- 단건 읽음: `PATCH /notification/:id` → `PUT /notification` (body: `{ id, type, isRead }`)
- 삭제: `DELETE /notification/:id` → `DELETE /notification` (body: `{ id, type }`)
- 전체 읽음: `PATCH /notification/read-all` 유지
- `markAsRead(id, type)`, `deleteNotification(id, type)` 호출부(`NotificationPage`, `PCNotificationSidebar`)에서 `n.type` 전달로 변경

---

### 수정 파일 목록

**Backend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/notification/notification.controller.ts` | `PATCH /:id` → `PUT /` (body DTO), `DELETE /:id` → `DELETE /` (body DTO) |
| `src/notification/notification.service.ts` | `markAsRead`, `delete` 시그니처를 DTO 방식으로 변경 |

**Frontend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/Notification/api/notificationApi.ts` | `markAsReadApi(id, type, isRead)` — PUT body 방식, `deleteNotificationApi(id, type)` — DELETE body 방식 |
| `src/features/Notification/hooks/useBackendNotifications.ts` | `markAsRead(id, type)`, `deleteNotification(id, type)` 추가 및 시그니처 변경 |
| `src/widgets/Notification/ui/BackendNotificationItem.tsx` | `onDelete?` prop 추가, hover X 버튼 삽입 |
| `src/pages/Notification/ui/NotificationPage.tsx` | `BackendNotificationItem`에 `onDelete`, `onClick` 시 `n.type` 전달 |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx` | `BackendNotificationItem`에 `onDelete`, `onClick` 시 `n.type` 전달 |

---

## 2026-08-23 — 게시판 URL 라우팅 개선 + 알림 401 수정 + 댓글 좋아요 알림 추가

### 작업 개요

게시판 상세 페이지 URL에 ID가 없던 문제를 `/board/:id?type=` 패턴으로 개선했다. 알림 API 401 에러가 인터셉터 redirect 루프를 유발하던 버그를 수정했다. 댓글/대댓글 좋아요 시 알림이 전송되지 않던 누락을 수정했다.

---

### 구현 내용

**게시판 URL 라우팅 개선**

- 기존: `/board/board/detail`, `/board/notice/detail`, `/board/event/detail` — URL에 ID 없음, 새로고침 시 "게시글을 찾을 수 없습니다" 발생
- 변경: `/board/:id?type=free|notice|event` 단일 패턴으로 통일
- `BoardByIdPage` — `?type` 값에 따라 `BoardDetailPage` / `PCNoticeDetailPage` / `EventDetailPage` 직접 렌더링
- `BoardDetailPage`, `PCNoticeDetailPage`, `EventDetailPage` — `location.state` 없으면 `useParams().id`로 API fetch (새로고침·직접 URL 접근 대응)
- `PCBoardDetailPage`, `PCEventDetailPage` — `post` / `event` prop 추가 (부모 fetch 데이터 수신)
- `CAT_STYLE_MAP.path` → `type` 필드로 교체 (`boardPageConstants.ts`)
- `Board.tsx`, `Notice.tsx`, `Event.tsx`, `PCBoardPage.tsx`, `BoardPage.tsx`, `PCNoticeListPage.tsx` — 모든 navigate 호출을 `/board/${id}?type=...` 형식으로 변경 (state 병행 유지 → 목록 클릭 시 fetch 없이 빠른 렌더)
- `BackendNotificationItem` — 알림에서 게시판 이동 시 `?type=${payload.boardType}` 포함 (이전에는 type 누락으로 항상 'free' 기본값)
- 백엔드 `comment.service.ts`, `board.service.ts` — 알림 payload에 `boardType: board.type` 추가

**알림 API 401 처리**

- 원인: 액세스 토큰(15분 만료) 만료 시 `GET /api/notification`이 401 → `backendClient` 인터셉터가 `/oauth/refresh` 시도 → refresh 쿠키 없으면 `/auth/login` redirect
- `getNotificationsApi`에 `validateStatus: (status) => status === 200 || status === 401` 추가 → 401을 axios 에러가 아닌 정상 응답으로 처리하여 인터셉터 retry/redirect 우회 → 빈 배열 반환
- SSE EventSource `onerror` — `esRef.current = null` 추가하여 재연결 루프 방지

**댓글 좋아요 알림 추가**

- 원인: `board.service.ts` 게시물 좋아요에는 알림 로직이 있었지만 `comment.service.ts` `toggleLike`에는 없었음
- 댓글/대댓글 좋아요 시 댓글 작성자에게 `comment_like` 타입 알림 전송 (본인 제외)
- payload: `likerName`, `boardId`, `boardType`, `boardTitle`, `commentContent` (50자 이하)
- 프론트 `BackendNotificationType`에 `'comment_like'` 추가
- `BackendNotificationItem` — "OOO님이 회원님의 댓글을 좋아합니다" + 댓글 내용 미리보기 렌더링

---

### 수정 파일 목록

**Backend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/comment/comment.service.ts` | `toggleLike` — 좋아요 시 `comment_like` 알림 전송, 알림 payload에 `boardType` 추가 |
| `src/board/board.service.ts` | 알림 payload에 `boardType: board.type` 추가 |

**Frontend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/Board/ui/BoardByIdPage.tsx` | `?type`에 맞는 컴포넌트 직접 렌더링으로 전환 (기존 fetch+redirect 제거) |
| `src/pages/Board/ui/BoardDetailPage.tsx` | state 없으면 useParams id로 fetch, PCBoardDetailPage에 post prop 전달 |
| `src/pages/Board/ui/PCBoardDetailPage.tsx` | `post?: BoardPost` prop 추가 |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx` | state 없으면 useParams id로 fetch |
| `src/pages/Board/ui/EventDetailPage.tsx` | state 없으면 useParams id로 fetch, PCEventDetailPage에 event prop 전달 |
| `src/pages/Board/ui/PCEventDetailPage.tsx` | `event?: BoardPost` prop 추가 |
| `src/pages/Board/ui/PCBoardPage.tsx` | navigate 3곳 `/board/${id}?type=` 형식으로 변경 |
| `src/pages/Board/ui/BoardPage.tsx` | navigate `/board/${id}?type=` 형식으로 변경 |
| `src/pages/Board/ui/PCNoticeListPage.tsx` | navigate `/board/${id}?type=notice` 형식으로 변경 |
| `src/pages/Board/constants/boardPageConstants.ts` | `CAT_STYLE_MAP` — `path` 필드 → `type` 필드로 교체 |
| `src/widgets/Board/ui/Board.tsx` | navigate `/board/${id}?type=free` |
| `src/widgets/Board/ui/Notice.tsx` | navigate `/board/${id}?type=notice` |
| `src/widgets/Board/ui/Event.tsx` | navigate `/board/${id}?type=event` |
| `src/widgets/Notification/ui/BackendNotificationItem.tsx` | 이동 URL에 `?type=${payload.boardType}` 포함, `comment_like` 렌더링 추가 |
| `src/widgets/Notification/types/backendNotificationType.ts` | `BackendNotificationType`에 `'comment_like'` 추가, `payload`에 `boardType?` 추가 |
| `src/features/Notification/api/notificationApi.ts` | `getNotificationsApi` — `validateStatus` 추가, 401 시 빈 배열 반환 |
| `src/features/Notification/hooks/useBackendNotifications.ts` | SSE onerror 시 `esRef.current = null` 추가 |
| `src/app/routes.tsx` | `/board/:id` → `BoardByIdPage` 교체 |

---

## 2026-08-23 — 배치 스케줄러 인프라 + 역/열차시간 자동 동기화 구현

### 작업 개요

공공 데이터 API에서 역 목록과 열차 시간표를 주기적으로 가져와 DB에 동기화하는 배치 스케줄러 시스템을 구현했다. 단순 크론 실행이 아닌 FIFO 작업 큐 + DB 실행 로그 + 분산 락 구조로 설계하여, 다중 인스턴스 환경에서 중복 실행을 방지하고 관리자가 실행 현황을 모니터링·취소할 수 있다.

---

### 구현 내용

**[Backend] DB 기반 분산 락 (`DbLockService`)**

- `sync_lock` 테이블 기반 TTL 락. `GET_LOCK`은 커넥션 종속 문제가 있어 사용하지 않음
- `acquire(name, ttlMs)` — 락 행이 없으면 INSERT로 즉시 획득, 이미 존재하면 만료된 경우에만 원자적 UPDATE로 소유권 이전
- `release(name)` — 자신이 소유한 락을 즉시 만료 처리
- `runExclusive(name, ttlMs, fn)` — 락 획득 시 fn 실행 후 항상 해제, 획득 실패 시 null 반환

**[Backend] FIFO 작업 큐 (`JobQueueService`)**

- 인메모리 큐 + `scheduler_run_log` 테이블로 상태 영속화
- `enqueue(params)` — 중복 실행 검사(같은 jobName+기간의 PENDING/RUNNING) 후 PENDING 행 생성 → 큐에 push → 워커 기동
  - `skipIfRunning=true`: 중복 시 null 반환 (크론용)
  - `skipIfRunning=false`: 중복 시 409 ConflictException (수동 실행용)
  - `force=true`: 중복 검사 skip
- `cancelPending(runId)` — PENDING 상태 작업만 취소 (이미 RUNNING이면 false 반환)
- 단일 워커 (`startWorker`) — PENDING → RUNNING 원자적 클레임 후 순차 실행, 결과를 SUCCESS/FAILED + metadata로 갱신
- `onModuleInit` — 서버 재시작 시 중단된 PENDING/RUNNING 행을 FAILED로 복구
- 상태 enum: `PENDING | RUNNING | SUCCESS | FAILED | CANCELLED`

**[Backend] 스케줄러 실행 로그 조회 (`SchedulerRunLogService`)**

- `list(params)` — 최신순 실행 로그 목록 (jobName·status 선택 필터, limit)
- `summary()` — 상태별 건수 집계 (`{ SUCCESS: 12, FAILED: 2, ... }`)

**[Backend] 관리자 스케줄러 API (`AdminSchedulerController`, `GET/POST /admin/scheduler`)**

- `GET /admin/scheduler/runs` — 실행 로그 목록 (jobName·status·limit 쿼리 파라미터)
- `GET /admin/scheduler/runs/summary` — 상태별 건수 요약
- `POST /admin/scheduler/runs/:runId/cancel` — 대기 중(PENDING) 작업 취소

**[Backend] 역 목록 자동 동기화 (`StationsSyncService`)**

- 환경변수 `STATION_SYNC_CRON`으로 크론 주기 설정, `SchedulerRegistry`로 동적 등록
- 부트 시 역 데이터 없으면 초기 동기화 자동 실행 (`STATION_SYNC_INITIAL_ENABLED`)
- 전국 도시 코드(`AREA_CODES`)를 최대 6개 동시에 외부 API 페이지네이션 조회 (200건/페이지)
- 도시별 트랜잭션: 역 upsert + 응답에 없는 역 비활성화(`isActive: false`)
- 전체 도시 실패 시 기존 데이터 유지, 일부 실패 시 성공 도시만 반영
- `DbLockService`로 다중 인스턴스 중복 실행 방지 (TTL 10분)
- `POST /admin/stations/sync` — 관리자 수동 동기화 트리거

**[Backend] 열차 시간표 자동 동기화 (`TrainTimeSyncService`)**

- 환경변수 `TRAIN_TIME_SYNC_CRON`으로 크론 주기 설정, 매일 새벽 오늘 포함 N일치 슬라이딩 캐싱
- 크론/부트 실행은 `JobQueueService.enqueue(skipIfRunning=true)` → 이미 진행 중이면 건너뜀
- 고정 노선(`TRAIN_ROUTES`)의 노선 × 날짜 조합을 동시성 제한(`TRAIN_TIME_SYNC_CONCURRENCY`)으로 병렬 실행
- `DbLockService`로 다중 인스턴스 중복 실행 방지 (TTL 60분)
- `POST /admin/trains/times/sync` — 관리자 수동 기간 지정 실행 (startDate+endDate 또는 startDate+days, 최대 31일)
  - 날짜 유효성 검사 선행 → 잘못된 요청은 즉시 400, 진행 중 동일 기간이면 409
  - 큐에 적재 후 즉시 202 응답, 진행 상황은 `/admin/scheduler/runs`로 확인

---

### 신규 파일

| 파일 | 내용 |
| --- | --- |
| `src/common/lock/db-lock.service.ts` | DB 기반 TTL 분산 락 |
| `src/scheduler/job-queue.service.ts` | FIFO 작업 큐 + 실행 로그 갱신 |
| `src/scheduler/scheduler-run-log.service.ts` | 실행 로그 조회 전용 서비스 |
| `src/scheduler/admin-scheduler.controller.ts` | 관리자 스케줄러 모니터링·취소 API |
| `src/scheduler/scheduler.module.ts` | 스케줄러 모듈 (JobQueueService export) |
| `src/scheduler/interfaces/job.interface.ts` | `JobStatus` enum, `EnqueueParams`, `JobEntry` 인터페이스 |
| `src/scheduler/dto/scheduler-run.dto.ts` | 실행 로그 조회·취소 DTO |
| `src/stations/stations-sync.service.ts` | 역 목록 크론 동기화 |
| `src/stations/admin-stations.controller.ts` | `POST /admin/stations/sync` |
| `src/trains/train-time-sync.service.ts` | 열차 시간표 크론·수동 동기화 |
| `src/trains/admin-trains.controller.ts` | `POST /admin/trains/times/sync` |

---

## 2026-08-23 — 알림 시스템(SSE) + 게시물/댓글 좋아요 백엔드 구현 + 프론트엔드 연동

### 작업 개요

댓글·게시물 좋아요를 Firebase에서 NestJS+Prisma 백엔드로 마이그레이션하고, SSE 기반 실시간 알림 시스템을 구현했다. 내 게시물에 댓글/대댓글 달렸을 때, 내 게시물·댓글에 좋아요 눌렸을 때 알림이 수신자에게 실시간으로 전달된다. 로그아웃 시 반복 새로고침 버그도 수정했다.

---

### 구현 내용

**[Backend] Prisma 스키마 추가**

- `Board` — `liked BigInt @default(0)`, `likes BoardLike[]` 추가
- `BoardLike` 모델 신규 — `(boardId, userIdx)` 복합 유니크, `onDelete: Cascade`
- `Notification` 모델 신규 — `id`, `userIdx`, `type(VARCHAR 20)`, `isRead`, `payload(Json)`, `createdAt`, `userIdx` 인덱스

**[Backend] SSE 알림 시스템**

- `SseService` — `Map<userIdx, Subject<MessageEvent>>` 관리, `connect(userIdx)` → Observable, `push(userIdx, data)` → Subject.next
- `NotificationService` — `create(userIdx, type, payload)`: DB insert + SSE push (try/catch로 실패 무시), `getList`, `markAsRead`, `markAllAsRead`
- `NotificationController` — `GET /notification`, `SSE /notification/stream`, `PATCH /notification/read-all`, `PATCH /notification/:id`
- `NotificationModule` export
- `app.module.ts` — `NotificationModule` import

**[Backend] JWT guard SSE 지원**

- `jwt-auth.guard.ts` — `extractToken`: Authorization 헤더 우선, 없으면 `?token=` 쿼리 파라미터 fallback (EventSource는 커스텀 헤더 미지원)

**[Backend] 댓글 알림**

- `comment.service.ts` — `sendCommentNotification` 추가
  - `parentId == null` → 게시물 작성자에게 `comment` 알림
  - `parentId != null` → 원댓글 작성자에게 `reply` 알림
  - 본인 댓글/게시물 제외, commenterName DB에서 조회
  - payload: `commenterName`, `boardId`, `boardType`, `boardTitle`, `commentContent(50자)`
- `comment.module.ts` — `NotificationModule` import 추가

**[Backend] 게시물 좋아요 백엔드 구현**

- `board.service.ts` — `toggleLike`: `$transaction`으로 `BoardLike` upsert/delete + `Board.liked` increment/decrement 원자 처리, 좋아요 시 게시물 작성자에게 `like` 알림 (본인 제외)
- `board.service.ts` — `getLikedBoardIds(user)` → `number[]`
- `board.service.ts` — `getList` 응답에 `liked: Number(b.liked)` 포함
- `board.controller.ts` — `POST /board/like`, `GET /board/like/me`
- `board.module.ts` — `NotificationModule` import 추가
- `board-request.dto.ts` — `ToggleBoardLikeDto { @IsInt() boardId: number }`
- `board-response.dto.ts` — `BoardListItemDto`에 `liked: number` 추가

**[Frontend] 알림 연동**

- `backendNotificationType.ts` — `BackendNotificationType('comment'|'reply'|'like')`, `BackendNotificationPayload`, `BackendNotification` 인터페이스 정의
- `notificationApi.ts` — `getNotificationsApi`, `markAsReadApi`, `markAllAsReadApi`
- `useBackendNotifications.ts` — 초기 목록 로드 + SSE EventSource 연결 (`?token=` 쿼리 파라미터), 비로그인 시 `if (!token) return` 가드
- `BackendNotificationItem.tsx` — `comment`/`reply`/`like` 타입별 메시지, 배지 색상 분리
- `NotificationPage.tsx`, `PCNotificationSidebar.tsx` — `useBackendNotifications` 통합, `markAllAsRead` 연동

**[Frontend] 게시물 좋아요 백엔드 연동**

- `likeBoardApi.ts` — Firebase 대신 `toggleBoardLikeApi`, `getLikedBoardIdsApi`
- `useLikeBoard.ts` — 백엔드 + 낙관적 업데이트 (`likedMap` + `likesOverrideMap`)
- `boardType.ts` — `likes?: number` → `liked: number` (required)

**[Frontend] 댓글 좋아요 백엔드 연동**

- `likeCommentApi.ts` — `toggleCommentLikeApi`, `getLikedCommentIdsApi`
- `useLikeComment.ts` — 마운트 시 liked ID 로드, 낙관적 업데이트
- `CommentSection.tsx` — `useLikeComment(boardId, comments)` 연동
- `commentType.ts` — `liked: number` 추가

**[Frontend] 라우팅**

- `routes.tsx` — `/board/:id` 라우트 추가 (`BoardByIdPage`)

---

### 버그 수정

| 버그 | 원인 | 수정 |
| --- | --- | --- |
| 로그아웃 시 반복 새로고침 | `PCNotificationSidebar`가 루트에 항상 마운트 → 비로그인 시 `getNotificationsApi` 호출 → 401 → 인터셉터 redirect → 루프 | `useBackendNotifications` useEffect 최상단에 `if (!token) return` 가드 추가 |
| `board.service.ts` TS 오류 | 기존 코드가 `Board.likes`를 참조하던 곳이 `liked` 필드 추가 후 충돌 | 참조 `.likes` → `.liked`로 일괄 수정 |

---

### 신규 파일

**Backend**

| 파일 | 내용 |
| --- | --- |
| `src/notification/sse.service.ts` | SSE 연결 관리 (Subject Map) |
| `src/notification/notification.service.ts` | 알림 생성·조회·읽음 처리 |
| `src/notification/notification.controller.ts` | 알림 REST + SSE 엔드포인트 |
| `src/notification/notification.module.ts` | 알림 모듈 |

**Frontend**

| 파일 | 내용 |
| --- | --- |
| `src/widgets/Notification/types/backendNotificationType.ts` | 백엔드 알림 도메인 타입 |
| `src/features/Notification/api/notificationApi.ts` | 알림 API 함수 |
| `src/features/Notification/hooks/useBackendNotifications.ts` | 알림 목록 + SSE 구독 훅 |
| `src/widgets/Notification/ui/BackendNotificationItem.tsx` | 알림 카드 UI |
| `src/features/Board/api/likeCommentApi.ts` | 댓글 좋아요 API |
| `src/features/Board/hooks/useLikeComment.ts` | 댓글 좋아요 훅 |

---

### 수정 파일

**Backend**

| 파일 | 변경 내용 |
| --- | --- |
| `prisma/schema.prisma` | Board.liked, BoardLike, Notification 모델 추가 |
| `src/auth/guards/jwt-auth.guard.ts` | `?token=` 쿼리 파라미터 fallback 추가 |
| `src/comment/comment.service.ts` | `sendCommentNotification` 추가, NotificationService 주입 |
| `src/comment/comment.module.ts` | NotificationModule import |
| `src/board/board.service.ts` | `toggleLike`, `getLikedBoardIds`, liked 필드 응답 추가, NotificationService 주입 |
| `src/board/board.controller.ts` | `POST /board/like`, `GET /board/like/me` 추가 |
| `src/board/board.module.ts` | NotificationModule import |
| `src/board/dto/board-request.dto.ts` | `ToggleBoardLikeDto` 추가 |
| `src/board/dto/board-response.dto.ts` | `liked: number` 추가 |
| `src/app.module.ts` | NotificationModule import |

**Frontend**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/Board/api/likeBoardApi.ts` | Firebase → 백엔드 전환 |
| `src/features/Board/hooks/useLikeBoard.ts` | 백엔드 + 낙관적 업데이트 |
| `src/entities/Board/types/boardType.ts` | `liked: number` (required) |
| `src/entities/Board/types/commentType.ts` | `liked: number` 추가 |
| `src/widgets/Board/ui/CommentSection.tsx` | `useLikeComment` 연동 |
| `src/pages/Notification/ui/NotificationPage.tsx` | `useBackendNotifications` 통합 |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx` | `useBackendNotifications` 통합 |
| `src/app/routes.tsx` | `/board/:id` 라우트 추가 |

---

## 2026-07-29 — 프론트엔드 빌드 오류 수정

### 작업 개요

`vite build` 실행 시 발생한 TypeScript 오류 4건을 수정했다.

---

### 수정 내용

| 오류 | 원인 | 수정 |
| --- | --- | --- |
| `TS6133: 'navigate' is declared but never used` (3건) | `window.location.href` 전환 후 `useNavigate` import와 `navigate` 변수가 남아 있었음 | `useKakaoLogin`, `useGoogleLogin`, `useGithubLogin` 에서 미사용 import·변수 제거 |
| `TS2552: Cannot find name 'isNotification'` | `useSettingPage`에서 `isNotification`을 정의 없이 반환하던 기존 버그 | `useCurrentUser`에서 `user` 추가 구조분해 후 `isNotification: !!user` 로 정의 |

---

### 수정 파일

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/Auth/SocialLogin/hooks/useKakaoLogin.ts` | `useNavigate` import, `navigate` 변수 제거 |
| `src/features/Auth/SocialLogin/hooks/useGoogleLogin.ts` | 동일 |
| `src/features/Auth/SocialLogin/hooks/useGithubLogin.ts` | 동일 |
| `src/pages/Set/hooks/useSettingPage.ts` | `user` 구조분해 추가, `isNotification: !!user` 정의 |

---

## 2026-07-29 — Google/GitHub 소셜 로그인 구현 + 카카오 수정 + OAuth 엔드포인트 통일 + TS/ESLint 정비

### 작업 개요

Google·GitHub OAuth 리다이렉트 로그인을 백엔드(NestJS)에 신규 구현하고, 기존 카카오 로그인의 이메일 누락 문제를 수정했다. 소셜 로그인 엔드포인트를 `/oauth/소셜/login` 형식으로 통일하고, 로그인 후 상태가 반영되지 않는 버그를 수정했다. 프론트엔드 PC 회원가입 이메일 중복 오류 표시 및 Prisma 마이그레이션 불일치를 수정하고, 전반적인 TypeScript·ESLint 오류를 정리했다.

---

### 구현 내용

**[Backend] Google OAuth 신규 구현**

- `src/google/google.service.ts` — 인가 코드 → `id_token` 교환(Google OAuth2 API) → JWKS 검증(`jose` 라이브러리, `https://www.googleapis.com/oauth2/v3/certs`) → JWT 발급
- `src/google/google.controller.ts` — `@Controller('oauth/google')`, `POST /login`
- `src/google/dto/google-login.dto.ts` — `code`, `redirectUri` 필드
- `src/google/dto/google-response.dto.ts` — `accessToken` 필드
- `src/google/google.module.ts` — UsersModule 의존
- `src/app.module.ts` — `GoogleModule` import 추가
- `src/main.ts` — `/oauth/google/login` global prefix 제외 목록에 추가
- `src/config/app-config.service.ts` — `googleClientId`, `googleClientSecret` getter 추가
- `src/common/errors/error-code.ts` — `GOOGLE_TOKEN_EXCHANGE_FAILED`, `GOOGLE_ID_TOKEN_INVALID` 추가

**[Backend] GitHub OAuth 신규 구현**

- `src/github/github.service.ts` — 인가 코드 → access_token 교환 → `/user` API로 이메일 조회, public 이메일 없으면 `/user/emails` fallback
- `src/github/github.controller.ts` — `@Controller('oauth/github')`, `POST /login`
- `src/github/dto/github-login.dto.ts` — `code`, `redirectUri`(optional) 필드
- `src/github/dto/github-response.dto.ts` — `accessToken` 필드
- `src/github/github.module.ts` — UsersModule 의존
- `src/app.module.ts` — `GithubModule` import 추가
- `src/main.ts` — `/oauth/github/login` global prefix 제외 목록에 추가
- `src/config/app-config.service.ts` — `githubClientId`, `githubClientSecret` getter 추가
- `src/common/errors/error-code.ts` — `GITHUB_TOKEN_EXCHANGE_FAILED`, `GITHUB_USER_INFO_FAILED`, `GITHUB_EMAIL_NOT_FOUND` 추가

**[Backend] 카카오 OAuth 수정**

- `src/kakao/kakao.controller.ts` — `@Controller('auth/kakao')` → `@Controller('oauth/kakao')` 변경
- `src/kakao/kakao.service.ts` — id_token에 이메일 없을 경우 카카오 user API(`https://kapi.kakao.com/v2/user/me`) fallback 추가
- `src/main.ts` — `/oauth/kakao/token`, `/oauth/kakao/login` global prefix 제외 목록 업데이트

**[Frontend] Google/GitHub 소셜 로그인 신규 구현**

- `src/shared/Social/GoogleConfig.ts` — Google OAuth 인증 URL 및 redirect URI 상수
- `src/shared/Social/GithubConfig.ts` — GitHub OAuth 인증 URL 및 redirect URI 상수
- `src/features/Auth/SocialLogin/hooks/useGoogleLogin.ts` — 인가 코드 추출 → `/oauth/google/login` 호출 → JWT 저장 → 전체 페이지 리로드
- `src/features/Auth/SocialLogin/hooks/useGithubLogin.ts` — 동일 패턴
- `src/features/Auth/SocialLogin/ui/GoogleRedirect.tsx` — 콜백 페이지 (로딩 스피너)
- `src/features/Auth/SocialLogin/ui/GithubRedirect.tsx` — 콜백 페이지 (로딩 스피너)
- `src/app/routes.tsx` — `/oauth/google/callback`, `/oauth/github/callback` 라우트 추가

**[Frontend] 카카오 리다이렉트 훅 수정**

- `src/features/Auth/SocialLogin/hooks/useKakaoLogin.ts` — 엔드포인트 `/auth/kakao/login` → `/oauth/kakao/login` 변경
- `src/shared/Social/KakaoConfig.ts` — 카카오 인증 URL에 `scope=openid%20account_email` 추가 (이메일 수신 동의)

---

### 버그 수정

| 버그 | 원인 | 수정 |
| --- | --- | --- |
| 소셜 로그인 후 로그인 상태 미반영 | `navigate('/')` 는 이미 마운트된 컴포넌트를 재렌더링하지 않음 | 모든 로그인 플로우에서 `window.location.href = '/'` 로 전체 페이지 리로드 |
| GitHub 로그인 502 오류 | React StrictMode가 `useEffect`를 2회 실행 → 단일 사용 인가 코드가 소진됨 | `useRef(false)` guard 패턴으로 3개 소셜 리다이렉트 훅 모두 수정 |
| 카카오 로그인 401 — 이메일 없음 | `account_email` scope 미설정으로 id_token에 이메일 미포함 | scope 추가 + 카카오 user API fallback 구현 |
| PC 회원가입 이메일 중복 오류 미표시 | `PCEmailStep.tsx`가 `EmailForm` 컴포넌트를 사용하지 않아 `EmailErrorStore` 오류가 렌더링 안 됨 | `PCEmailStep.tsx`에 `EmailErrorStore` 직접 추가 |
| Prisma 마이그레이션 불일치 | `refreshToken`, `refreshTokenExpiresAt`, `stations_times` 가 DB에는 존재하나 migration 없음 | `20260724000000_add_refresh_token_and_station_times/migration.sql` 수동 생성 후 `prisma migrate resolve --applied` |

---

### TypeScript/ESLint 정비

| 오류 | 수정 |
| --- | --- |
| TS2564 — DTO 프로퍼티 초기화 없음 | Google/GitHub DTO 모든 프로퍼티에 `!` (definite assignment) 추가 |
| `Option 'baseUrl' is deprecated` (백엔드) | `backend/tsconfig.json`에서 `baseUrl` 제거 |
| `Option 'baseUrl' is deprecated` (프론트엔드) | `frontend/tsconfig.app.json`에서 `baseUrl` 제거, paths를 `./src/*` 로 변경 |
| `Unexpected any` — `catch (e: any)` | `useLoginState.ts`, `useSignUpState.ts` 모두 `catch (e: unknown)` + `isAxiosError(e)` 타입 좁히기로 수정 |
| `no-unsafe-assignment / no-unsafe-return / no-unsafe-member-access` | `cookie.decorator.ts` — `getRequest<Request>()` 타입 명시, `cookies`를 `Record<string, string>`으로 캐스팅 |
| `no-unused-vars` — `UserRole` | `jwt-auth.guard.ts`에서 미사용 import 제거 |
| `prettier/prettier` — 따옴표 스타일 불일치 | `npx eslint src --ext .ts --fix` 로 14개 파일 일괄 수정 |

---

### 수정/신규 파일 목록

**Backend 신규**

| 파일 | 내용 |
| --- | --- |
| `src/google/google.service.ts` | Google OIDC 검증 및 JWT 발급 |
| `src/google/google.controller.ts` | `POST /oauth/google/login` |
| `src/google/dto/google-login.dto.ts` | 요청 DTO |
| `src/google/dto/google-response.dto.ts` | 응답 DTO |
| `src/google/google.module.ts` | Google 모듈 |
| `src/github/github.service.ts` | GitHub access_token 교환 및 이메일 조회 |
| `src/github/github.controller.ts` | `POST /oauth/github/login` |
| `src/github/dto/github-login.dto.ts` | 요청 DTO |
| `src/github/dto/github-response.dto.ts` | 응답 DTO |
| `src/github/github.module.ts` | GitHub 모듈 |
| `prisma/migrations/20260724000000_.../migration.sql` | refreshToken + stations_times 수동 마이그레이션 |

**Backend 수정**

| 파일 | 변경 내용 |
| --- | --- |
| `src/kakao/kakao.controller.ts` | 경로 `oauth/kakao` 로 변경 |
| `src/kakao/kakao.service.ts` | 이메일 fallback (user API) 추가 |
| `src/app.module.ts` | GoogleModule, GithubModule import |
| `src/main.ts` | OAuth 경로 4개 global prefix 제외 |
| `src/config/app-config.service.ts` | Google/GitHub 시크릿 getter 추가 |
| `src/common/errors/error-code.ts` | Google/GitHub 에러 코드 5개 추가 |
| `src/auth/decorators/cookie.decorator.ts` | unsafe any 제거 |
| `src/auth/guards/jwt-auth.guard.ts` | 미사용 `UserRole` import 제거 |
| `tsconfig.json` | `baseUrl` 제거 |

**Frontend 신규**

| 파일 | 내용 |
| --- | --- |
| `src/shared/Social/GoogleConfig.ts` | Google OAuth URL 상수 |
| `src/shared/Social/GithubConfig.ts` | GitHub OAuth URL 상수 |
| `src/features/Auth/SocialLogin/hooks/useGoogleLogin.ts` | Google 콜백 처리 훅 |
| `src/features/Auth/SocialLogin/hooks/useGithubLogin.ts` | GitHub 콜백 처리 훅 |
| `src/features/Auth/SocialLogin/ui/GoogleRedirect.tsx` | Google 콜백 페이지 |
| `src/features/Auth/SocialLogin/ui/GithubRedirect.tsx` | GitHub 콜백 페이지 |

**Frontend 수정**

| 파일 | 변경 내용 |
| --- | --- |
| `src/features/Auth/SocialLogin/hooks/useKakaoLogin.ts` | 엔드포인트 변경, useRef guard 추가, window.location.href 전환 |
| `src/features/Auth/SocialLogin/hooks/useGoogleLogin.ts` | 동일 패턴 |
| `src/features/Auth/SocialLogin/hooks/useGithubLogin.ts` | 동일 패턴 |
| `src/shared/Social/KakaoConfig.ts` | account_email scope 추가 |
| `src/features/Auth/Login/hooks/useLoginState.ts` | isAxiosError 전환, window.location.href 전환 |
| `src/features/Auth/SignUp/hooks/useSignUpState.ts` | 동일 패턴 |
| `src/widgets/Auth/SignUp/ui/PCEmailStep.tsx` | EmailErrorStore 추가, 이메일 중복 오류 표시 |
| `src/app/routes.tsx` | Google/GitHub 콜백 라우트 추가 |
| `tsconfig.app.json` | `baseUrl` 제거, paths `./src/*` 변경 |

---

## 2026-07-14 — 자유게시판 조회수 이중 증가 버그 수정

### 작업 개요

자유게시판 상세 페이지에서 조회수가 2씩 증가하는 버그를 수정했다.

---

### 원인

`BoardDetailPage`는 PC(`<PCBoardDetailPage />`)와 모바일 섹션을 CSS(`hidden lg:block`)로 분기하지만, 두 섹션이 **동시에 마운트**된다. 이로 인해 `useBoardDetailPage`(모바일)와 `usePCBoardDetailPage`(PC) 양쪽에서 `useViewCount`가 각각 실행되어 한 번 진입 시 조회수가 2 증가했다. 이벤트 게시판에서 수정한 것과 동일한 구조적 원인이다.

---

### 수정 내용

- `useBoardDetailPage`에서 `useViewCount` 호출 제거
- `viewCount` 반환값 제거
- 모바일 상세 페이지 조회수 표시 UI 제거
- 조회수 집계는 `usePCBoardDetailPage` → `useViewCount` 단일 경로로 일원화

---

### 수정 파일

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/Board/hooks/useBoardDetailPage.ts` | `useViewCount` import·호출·반환 제거 |
| `src/pages/Board/ui/BoardDetailPage.tsx` | `viewCount` 구조분해 제거, 모바일 조회수 표시 UI 제거 |

---

## 2026-07-14 — 팔로워/팔로잉 모달 전환 + 팔로우 목록 페이지 삭제 + FSD 규칙 정비

### 작업 개요

PC 마이페이지에서 팔로워·팔로잉 클릭 시 페이지 이동 대신 모달 카드가 뜨도록 전환했다. 모달은 상단바·사이드바를 가리지 않고 메인 콘텐츠 영역에만 오버레이되며, 기존 팔로우 목록 페이지는 삭제했다. FSD 규칙 위반 항목을 일괄 정비했다.

---

### 수정 내용

**팔로워/팔로잉 모달 전환**
- 팔로워·팔로잉 버튼 `routerNavigate('/mypage/follow')` → `openFollowModal(tab)` 전환
- `<main>`이 `relative`를 가지고 있어 모달 오버레이를 `absolute inset-0`으로 배치 → 상단바·사이드바 비노출, 메인 영역만 어둡게 처리
- 탭 전환(팔로워/팔로잉), 낙관적 삭제(x / 팔로우 취소) 동작 유지

**팔로우 목록 페이지 삭제**
- `pages/Follow/ui/FollowListPage.tsx` 삭제
- `pages/Follow/ui/PCFollowListPage.tsx` 삭제
- `app/routes.tsx`에서 import 및 `/mypage/follow` 라우트 제거

---

### FSD 규칙 검증 및 수정

| 위반 항목 | 조치 |
| --- | --- |
| `widgets/Follow/ui/PCFollowModal.tsx` — `type Tab`, `interface Props` 인라인 정의 | `widgets/Follow/types/followModalTypes.ts` 분리 |
| `widgets/Follow/hooks/usePCFollowModal.ts` — `type Tab` 인라인 정의 | 동일 types/ 참조로 교체 |
| `pages/Mypage/ui/PCMyPage.tsx` — `type FollowTab` 인라인 정의 | `pages/Mypage/types/myPageTypes.ts`에 추가 |
| `pages/Mypage/ui/PCMyPage.tsx` — 모달 상태·핸들러(`followModalOpen`, `openFollowModal` 등) ui/ 내 정의 | `pages/Mypage/hooks/useMyPageModal.ts` 신규 생성 후 분리 |

---

### 신규 파일

| 파일 | 내용 |
| --- | --- |
| `src/widgets/Follow/ui/PCFollowModal.tsx` | 팔로워/팔로잉 모달 UI |
| `src/widgets/Follow/hooks/usePCFollowModal.ts` | 모달 탭 상태·낙관적 삭제 핸들러 |
| `src/widgets/Follow/types/followModalTypes.ts` | `FollowModalTab`, `PCFollowModalProps` 타입 정의 |
| `src/pages/Mypage/hooks/useMyPageModal.ts` | 모달 open/close 상태·핸들러 |

### 수정 파일

| 파일 | 변경 내용 |
| --- | --- |
| `src/pages/Mypage/ui/PCMyPage.tsx` | 팔로우 모달 통합, navigate 제거, `useMyPageModal` 사용 |
| `src/pages/Mypage/types/myPageTypes.ts` | `FollowTab` 추가 |
| `src/app/routes.tsx` | `/mypage/follow` 라우트·import 제거 |
| ~~`src/pages/Follow/ui/FollowListPage.tsx`~~ | 삭제 |
| ~~`src/pages/Follow/ui/PCFollowListPage.tsx`~~ | 삭제 |

---

## 2026-07-14 — PC 마이페이지 결제내역 DB 연동 + 포인트 내역 필터 추가 + FSD 규칙 정비

### 작업 개요

PC 마이페이지에 결제내역·반환내역 Firestore 연동을 구현하고, 포인트 적립 내역 탭에 조회기간·거래유형·정렬 드롭다운 필터를 추가했다. 포인트 페이지를 삭제하고, FSD 규칙 위반 항목을 전면 정비했다.

---

### 수정 내용

**결제내역 DB 연동**

- `entities/Point/types/orderType.ts` 신규 생성 — `isReturn: boolean` 필드 포함, 구매·반환 구분
- `features/Point/hooks/useCreateOrder.ts` 신규 생성 — `orders/{uid}/detail` Firestore 컬렉션에 주문 저장
- `features/Point/hooks/useGetOrders.ts` 신규 생성 — 주문 내역 조회, `isReturn ?? false` fallback 처리
- `widgets/TicketReserve/hooks/usePayModal.ts` — `handlePay`에 `createOrder({ isReturn: false })` 추가
- `features/TicketReturn/hooks/useTicketReturn.ts` — `handleDeleteSeats`에 `createOrder({ isReturn: true })` 추가

**포인트 페이지 삭제**

- `pages/Point/ui/PointPage.tsx` 삭제
- `app/routes.tsx`에서 `/mypage/point` 라우트 제거

**PC 마이페이지 거래내역 카드**

- 결제 내역 / 포인트 내역 제목 토글 (선택 `text-gray-900` / 비선택 `text-gray-300`)
- `grid-cols-[1fr_2fr]` — 좌측 리스트 + 우측 세부 내역 패널
- 반환 내역은 리스트·세부 패널 모두 빨간색 + `-` 기호 표시
- 결제 내역 드롭다운 필터 3개: 조회기간(1·3·6개월) / 거래유형(전체·구매·반환) / 정렬(최신순·과거순)
- 포인트 내역 드롭다운 필터 3개: 조회기간 / 거래유형(전체·적립·사용) / 정렬
- 포인트 `accruedPoint` 부호로 적립(+, 파란색) / 사용(-, 빨간색) 구분
- 드롭다운 `appearance-none` + 커스텀 SVG 화살표 적용

---

### FSD 규칙 검증 및 수정

| 위반 항목                                                                    | 조치                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------ |
| `entities/Point/types/orderType.ts` — `@role`·`@rule` 주석 누락              | 주석 추가                                        |
| `features/TicketReturn/hooks/useTicketReturn.ts` — `@role`·`@rule` 주석 누락 | 주석 추가                                        |
| `pages/Mypage/ui/PCMyPage.tsx` — `ui/`에 타입 5개 인라인 정의                | `pages/Mypage/types/myPageTypes.ts` 분리         |
| `pages/Mypage/ui/PCMyPage.tsx` — `ui/`에 상수 5개 인라인 정의                | `pages/Mypage/constants/myPageConstants.ts` 분리 |
| `pages/Mypage/ui/PCMyPage.tsx` — `ui/`에 필터 로직·상태 6개 인라인 정의      | `pages/Mypage/hooks/useMyPageFilter.ts` 분리     |

---

### 신규 파일

| 파일                                            | 내용                                         |
| ----------------------------------------------- | -------------------------------------------- |
| `src/entities/Point/types/orderType.ts`         | 주문 내역 타입 (`isReturn`, `createAt` 포함) |
| `src/features/Point/hooks/useCreateOrder.ts`    | Firestore `orders/{uid}/detail` 저장         |
| `src/features/Point/hooks/useGetOrders.ts`      | 주문 내역 조회                               |
| `src/pages/Mypage/types/myPageTypes.ts`         | 마이페이지 타입 정의 분리                    |
| `src/pages/Mypage/constants/myPageConstants.ts` | 마이페이지 상수·PROVIDER_BADGE 분리          |
| `src/pages/Mypage/hooks/useMyPageFilter.ts`     | 필터 상태·파생값 관리 훅                     |

### 수정 파일

| 파일                                                 | 변경 내용                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `src/widgets/TicketReserve/hooks/usePayModal.ts`     | `handlePay`에 `createOrder` 연동                                    |
| `src/features/TicketReturn/hooks/useTicketReturn.ts` | `handleDeleteSeats`에 `createOrder` 연동, `@role`·`@rule` 주석 추가 |
| `src/pages/Mypage/ui/PCMyPage.tsx`                   | 거래내역 카드 전면 구현, 타입·상수·필터 로직 외부 분리              |
| `src/app/routes.tsx`                                 | `/mypage/point` 라우트 제거                                         |
| ~~`src/pages/Point/ui/PointPage.tsx`~~               | 삭제                                                                |

---

## 2026-07-10 — 자유게시판·공지사항 수정 플로우 개선 및 FSD 규칙 정비

### 작업 개요

자유게시판·공지사항의 수정 버튼 클릭 시 `PostEditModal` 대신 글쓰기 페이지로 이동하는 방식으로 전환하고, FSD 규칙 위반 항목을 일괄 수정했다.

---

### 수정 내용

**수정 플로우: PostEditModal → 글쓰기 페이지 이동**

- 수정 버튼 클릭 시 `navigate('/board/board' | '/board/notice', { state: { editPost } })` 방식으로 전환 (이벤트와 동일한 패턴)
- `useBoardHandler.ts`: `useLocation`으로 `editPost` 감지, 수정 모드 시 기존 title·content·author 자동 채움, `updatePost` 호출, `isEditMode` 반환
- `useNoticeHandler.ts`: 동일하게 수정 모드 분기 추가, `isEditMode` 반환
- `BoardWritePage.tsx`, `NoticeWritePage.tsx`: `isEditMode`에 따라 타이틀 "작성" / "수정" 분기

**자유게시판 수정 플로우 적용 대상**

- `widgets/Board/ui/Board.tsx`: PC·모바일 수정 버튼 → `navigate` 전환, `PostEditModal` 제거
- `widgets/Board/hooks/useBoard.ts`: `editingPost`, `handleUpdate`, `useUpdatePost` 제거
- `pages/Board/ui/PCBoardDetailPage.tsx`: `PostEditModal` 제거, `handleEdit` 함수 사용
- `pages/Board/hooks/usePCBoardDetailPage.ts`: `editingPost`, `handleUpdate` 제거 → `handleEdit` 추가
- `pages/Board/ui/BoardDetailPage.tsx`: 모바일 수정 버튼 → `navigate` 전환, `PostEditModal` 제거
- `pages/Board/hooks/useBoardDetailPage.ts`: 신규 생성 (모바일 상세 페이지 전용 hook)

**공지사항 수정 플로우 적용 대상**

- `widgets/Board/ui/Notice.tsx`: 수정 버튼 → `navigate` 전환, `PostEditModal` 제거
- `widgets/Board/hooks/useNotice.ts`: `editingPost`, `handleUpdate`, `useUpdatePost` 제거
- `pages/Board/ui/PCNoticeDetailPage.tsx`: `PostEditModal` 제거, `handleEdit` 함수 사용
- `pages/Board/hooks/usePCNoticeDetailPage.ts`: `editingPost`, `handleUpdate` 제거 → `handleEdit` 추가
- `pages/Board/ui/PCNoticeListPage.tsx`: `PostEditModal` 제거
- `pages/Board/hooks/usePCNoticeListPage.ts`: `editingPost`, `handleUpdate`, `useUpdatePost` 제거

---

### FSD 규칙 검증 결과

| 위반 항목                                                                                                                                | 조치                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `widgets/Board/ui/Board.tsx` — `auth` 직접 import + `currentUid` 로직                                                                    | `auth` 제거 → `useBoard` hook에서 `currentUid` 반환 후 수신  |
| `widgets/Board/ui/Notice.tsx` — `auth` 직접 import + `currentUid` 로직                                                                   | `auth` 제거 → `useNotice` hook에서 `currentUid` 반환 후 수신 |
| `pages/Board/ui/BoardDetailPage.tsx` — `useLikeBoard`, `useDeletePost`, `useViewCount`, `auth`, 핸들러 등 비즈니스 로직이 ui에 직접 존재 | `useBoardDetailPage.ts` 신규 생성 후 분리                    |
| `pages/Board/ui/BoardWritePage.tsx` — `@role`·`@rule` 주석 누락                                                                          | 주석 추가                                                    |

---

### 수정 파일

| 파일                                             | 변경 내용                                                             |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `src/features/Board/hooks/useBoardHandler.ts`    | 수정 모드 지원 (editPost 자동 채움, updatePost 호출, isEditMode 반환) |
| `src/features/Board/hooks/useNoticeHandler.ts`   | 수정 모드 지원 (editPost 자동 채움, updatePost 호출, isEditMode 반환) |
| `src/pages/Board/ui/BoardWritePage.tsx`          | 수정 모드 타이틀 분기, `@role`·`@rule` 주석 추가                      |
| `src/pages/Board/ui/NoticeWritePage.tsx`         | 수정 모드 타이틀 분기                                                 |
| `src/widgets/Board/hooks/useBoard.ts`            | editingPost·handleUpdate·useUpdatePost 제거, currentUid 반환 추가     |
| `src/widgets/Board/ui/Board.tsx`                 | 수정 버튼 navigate 전환, PostEditModal 제거, auth import 제거         |
| `src/widgets/Board/hooks/useNotice.ts`           | editingPost·handleUpdate·useUpdatePost 제거, currentUid 반환 추가     |
| `src/widgets/Board/ui/Notice.tsx`                | 수정 버튼 navigate 전환, PostEditModal 제거, auth import 제거         |
| `src/pages/Board/hooks/usePCBoardDetailPage.ts`  | editingPost·handleUpdate 제거 → handleEdit 추가                       |
| `src/pages/Board/ui/PCBoardDetailPage.tsx`       | PostEditModal 제거, handleEdit 사용                                   |
| `src/pages/Board/hooks/useBoardDetailPage.ts`    | 신규 생성 (`@role`·`@rule` 포함, 모바일 전용 hook)                    |
| `src/pages/Board/ui/BoardDetailPage.tsx`         | useBoardDetailPage로 로직 분리, PostEditModal 제거                    |
| `src/pages/Board/hooks/usePCNoticeDetailPage.ts` | editingPost·handleUpdate 제거 → handleEdit 추가                       |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx`      | PostEditModal 제거, handleEdit 사용                                   |
| `src/pages/Board/hooks/usePCNoticeListPage.ts`   | editingPost·handleUpdate·useUpdatePost 제거                           |
| `src/pages/Board/ui/PCNoticeListPage.tsx`        | PostEditModal 제거                                                    |

---

## 2026-07-10 — 통합 글쓰기 분류 선택 어드민 전용 제한

### 작업 개요

홈에서 진입하는 통합 글쓰기 페이지(`/board/write`)에서 일반 사용자는 자유게시판만 작성 가능하도록 제한했다.

---

### 수정 내용

- `PCUnifiedWritePage.tsx`에 `isAdmin` 체크 추가 (`VITE_ADMIN_EMAIL` 기준)
- 어드민: 기존과 동일하게 자유·공지·이벤트 분류 선택 가능 (`categorySelectable=true`)
- 일반 사용자: 분류 선택기 숨김 (`categorySelectable=false`), category `'board'`(자유)로 고정

---

### 수정 파일

| 파일                                        | 변경 내용                                       |
| ------------------------------------------- | ----------------------------------------------- |
| `src/pages/Board/ui/PCUnifiedWritePage.tsx` | `isAdmin` 체크 추가, 분류 선택 어드민 전용 제한 |

---

## 2026-07-10 — 실시간 인기 게시물 공지사항 누락 버그 수정

### 작업 개요

실시간 인기 게시물에 공지사항이 포함되지 않던 문제를 수정하고, 인기 카드 가로 길이가 게시물 제목 길이에 따라 늘어나던 레이아웃 버그를 수정했다.

---

### 수정 내용

**공지사항 누락 원인 분석**

- `fetchBoardAndEventPostsApi`가 `board`, `event` collectionGroup만 조회하고 `notice`를 누락
- 공지사항은 조회수(`boardViews`)가 있어도 `postMap`에 없어 필터링되던 구조적 문제

**공지사항 인기 게시물 포함**

- `fetchBoardAndEventPostsApi`에 `collectionGroup(db, 'notice')` 조회 추가
- `TopPost` category 타입에 `'notice'` 추가
- `PCBoardPage.tsx`: 인기 게시물 클릭 시 category가 `'notice'`이면 `/board/notice/detail`로 이동, state key `notice`로 전달
- `BoardPage.tsx`: 동일하게 모바일 notice 네비게이션 처리 추가

**인기 카드 가로 길이 늘어나는 버그 수정**

- 원인: 그리드 우측 컬럼(`1fr`)에 `min-w-0`이 없어 내용이 셀 너비를 초과
- 수정: 우측 컬럼 div에 `min-w-0` 추가 → `truncate`가 정상 동작해 제목이 `...`으로 처리

---

### FSD 규칙 검증 결과

| 위반 항목                                   | 조치      |
| ------------------------------------------- | --------- |
| `BoardPage.tsx` — `@role`·`@rule` 주석 누락 | 주석 추가 |

---

### 수정 파일

| 파일                                           | 변경 내용                                         |
| ---------------------------------------------- | ------------------------------------------------- |
| `src/features/Board/api/topViewedPostApi.ts`   | `notice` collectionGroup 조회 추가                |
| `src/features/Board/hooks/useTopViewedPost.ts` | `TopPost.category`에 `'notice'` 추가              |
| `src/pages/Board/ui/PCBoardPage.tsx`           | notice 네비게이션 처리, 우측 컬럼 `min-w-0` 추가  |
| `src/pages/Board/ui/BoardPage.tsx`             | notice 네비게이션 처리, `@role`·`@rule` 주석 추가 |

---

## 2026-07-10 — 이벤트 게시판 UI 개편 및 어드민 전용 기능 정리

### 작업 개요

이벤트 게시판 리스트를 카드 UI로 전면 개편하고, 좋아요·팔로우 제거, 어드민 전용 작성 제한, 수정 플로우 개선(모달 → 작성 페이지 이동), 조회수 이중 증가 버그 수정을 포함한 전반적인 기능 정리를 수행했다.

---

### 수정 내용

**이벤트 카드 UI 개편**

- 기존 리스트 형식 → 카드 그리드(PC: 4열, 모바일: 2열)로 전면 변경
- 카드 상단: 연한 파란색 배경(`bg-blue/10`) + 선물 아이콘(파란색 72×72)
- 카드 하단: "이벤트" 뱃지(`#fef9c3` / `#ca8a04`, 상세 페이지 뱃지와 동일) + 제목 + 날짜 + 작성자
- 스켈레톤 UI를 실제 카드 높이(`h-[152px]`)에 맞게 수정
- 검색에서 작성자 항목 제거 (제목·내용만 검색), placeholder 업데이트

**이벤트 좋아요·팔로우 제거**

- `PCEventDetailPage.tsx`: 팔로우 버튼, 좋아요 버튼 UI 제거
- `EventDetailPage.tsx` (모바일): 좋아요 섹션 제거
- `usePCEventDetailPage.ts`: `useLikeEvent`, `useFollow`, 관련 상태·핸들러 전부 제거
- `useEvent.ts` (위젯): `useUpdatePost`, `editingPost`, `handleUpdate` 제거

**어드민 전용 이벤트 작성**

- `VITE_ADMIN_EMAIL` 기준 어드민 체크 (`usePCNoticeListPage`와 동일 패턴)
- `usePCEventListPage.ts`: `isAdmin` 반환 추가
- `PCEventListPage.tsx`: 글쓰기 버튼 어드민만 노출
- `EventListPage.tsx`: 모바일 `WriteButton` 어드민만 노출
- `EventWritePage.tsx`: 비어드민 직접 접근 시 즉시 뒤로 이동

**이벤트 수정 플로우 개선 (모달 → 페이지 이동)**

- 수정 버튼 클릭 시 `PostEditModal` 대신 `/board/event`로 navigate (state: `{ editPost }`)
- `useEventHandler.ts`: `useLocation`으로 `editPost` 감지, 수정 모드 시 기존 title·content·author 자동 채움, `updatePost` 호출
- `EventWritePage.tsx`: `isEditMode`에 따라 타이틀 "이벤트 작성" / "이벤트 수정" 분기
- `PCEventDetailPage.tsx`, `EventDetailPage.tsx`: `PostEditModal` import 및 사용 제거
- `usePCEventDetailPage.ts`: `editingPost`, `handleUpdate` 제거

**조회수 이중 증가 버그 수정**

- 원인: `EventDetailPage.tsx`에서 `useViewCount` 호출 + 내부 `PCEventDetailPage` → `usePCEventDetailPage` → `useViewCount` 이중 호출
- 수정: `EventDetailPage.tsx`에서 `useViewCount` 호출 제거 (모바일 렌더에서 viewCount 미사용)

---

### FSD 규칙 검증 결과

| 위반 항목                                                                                    | 조치                                               |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `widgets/Board/ui/Event.tsx` — `auth` 직접 import                                            | `useEvent` 훅에서 `currentUid` 반환 후 ui에서 수신 |
| `EventListPage.tsx`, `EventWritePage.tsx`, `EventDetailPage.tsx` — `@role`·`@rule` 주석 누락 | 주석 추가                                          |

---

### 수정 파일

| 파일                                             | 변경 내용                                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `src/widgets/Board/ui/Event.tsx`                 | 카드 UI 전면 개편, auth 직접 import 제거                                           |
| `src/widgets/Board/hooks/useEvent.ts`            | `currentUid` 반환 추가, 불필요한 edit 관련 로직 제거                               |
| `src/features/Board/hooks/useEventPagination.ts` | 검색에서 작성자 제거                                                               |
| `src/features/Board/hooks/useEventHandler.ts`    | 수정 모드 지원 (editPost 자동 채움, updatePost 호출)                               |
| `src/pages/Board/hooks/usePCEventListPage.ts`    | `isAdmin` 추가                                                                     |
| `src/pages/Board/hooks/usePCEventDetailPage.ts`  | 좋아요·팔로우·editingPost·handleUpdate 제거                                        |
| `src/pages/Board/ui/EventListPage.tsx`           | 어드민 전용 WriteButton, `@role`·`@rule` 주석 추가                                 |
| `src/pages/Board/ui/PCEventListPage.tsx`         | 어드민 전용 글쓰기 버튼                                                            |
| `src/pages/Board/ui/EventWritePage.tsx`          | 어드민 가드, 수정 모드 타이틀 분기, `@role`·`@rule` 주석 추가                      |
| `src/pages/Board/ui/EventDetailPage.tsx`         | 좋아요 제거, useViewCount 이중 호출 제거, 수정 navigate, `@role`·`@rule` 주석 추가 |
| `src/pages/Board/ui/PCEventDetailPage.tsx`       | 좋아요·팔로우 UI 제거, 수정 navigate, PostEditModal 제거                           |

---

## 2026-07-09 — 설정 페이지 구현 및 알림 설정 페이지 통합

### 작업 개요

기존에 알림 사이드바에만 있던 설정 진입점을 홈으로 이동하고, 분산되어 있던 알림 설정 페이지를 단일 설정 페이지(`/setting`)로 통합했다.

---

### 수정 내용

**설정 페이지 신규 구현**

- `pages/Set/hooks/useSettingPage.ts` 생성 — 인증 상태·토글 핸들러 담당
- `pages/Set/ui/SettingPage.tsx` 구현 — PC + 모바일 레이아웃, 알림 설정 토글(전체/좌석변경요청/수락거절)
- `app/routes.tsx`에 `/setting` 라우트 추가

**설정 진입점 이동**

- 모바일 홈 헤더(`HomePage.tsx`): 알림 벨 옆에 설정(⚙) 버튼 추가 → `/setting`
- PC 사이드바(`PCSidebar.tsx`): "설정" 링크 `/mypage` → `/setting` 변경
- PC 알림 사이드바(`PCNotificationSidebar.tsx`): 헤더 설정 버튼 제거

**미사용 파일 삭제**

- `pages/Notification/ui/NotifiSettingPage.tsx` 삭제
- `pages/Notification/ui/PCNotifiSettingPage.tsx` 삭제
- `pages/Notification/hooks/usePCNotifiSettingPage.ts` 삭제
- `NotificationPage.tsx`: 설정 링크 `/reserve/notification/setting` → `/setting` 업데이트
- `routes.tsx`: `/reserve/notification/setting` 라우트 제거

**FSD 규칙 위반 수정**

- `SettingPage.tsx`가 `@/pages/Notification/hooks/`를 직접 참조 → pages → pages 의존성 위반
  → `pages/Set/hooks/useSettingPage.ts` 생성으로 해결
- `SettingPage.tsx` ui/ 내 핸들러 3개 인라인 정의 → `useSettingPage`로 분리

---

### 수정 파일

| 파일                                                     | 변경 내용                                                    |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| `src/pages/Set/ui/SettingPage.tsx`                       | 설정 페이지 구현 (PC + 모바일)                               |
| `src/pages/Set/hooks/useSettingPage.ts`                  | 신규 생성 — 인증·토글 핸들러                                 |
| `src/app/routes.tsx`                                     | `/setting` 라우트 추가, `/reserve/notification/setting` 제거 |
| `src/pages/TicketReserve/ui/HomePage.tsx`                | 모바일 헤더 설정 버튼 추가                                   |
| `src/widgets/layouts/ui/PCSidebar.tsx`                   | 설정 링크 `/setting`으로 변경                                |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx`  | 설정 버튼 제거                                               |
| `src/pages/Notification/ui/NotificationPage.tsx`         | 설정 링크 `/setting`으로 변경                                |
| ~~`pages/Notification/ui/NotifiSettingPage.tsx`~~        | 삭제                                                         |
| ~~`pages/Notification/ui/PCNotifiSettingPage.tsx`~~      | 삭제                                                         |
| ~~`pages/Notification/hooks/usePCNotifiSettingPage.ts`~~ | 삭제                                                         |

---

## 2026-07-09 — features/Board hooks·api 세그먼트 전면 분리

### 작업 개요

`features/Board/hooks/` 내에 Firestore를 직접 호출하던 18개 훅 전체를 FSD 규칙에 맞게 `api/` 세그먼트로 분리했다.

---

### 수정 내용

**api/ 세그먼트 신규 생성 (20개)**

| 파일                  | 역할                                                  |
| --------------------- | ----------------------------------------------------- |
| `getBoardApi.ts`      | 자유게시판 목록 조회 (Supabase 이미지 + 댓글 수 포함) |
| `getNoticeApi.ts`     | 공지사항 목록 조회 (Supabase 이미지 포함)             |
| `getEventApi.ts`      | 이벤트 목록 조회 (Supabase 이미지 포함)               |
| `deletePostApi.ts`    | 게시물 삭제 — 좋아요·댓글·조회수 cascade 삭제         |
| `deleteNoticeApi.ts`  | 공지사항 삭제                                         |
| `deleteCommentApi.ts` | 댓글·대댓글 삭제                                      |
| `likeBoardApi.ts`     | 자유게시판 좋아요 조회·구독·토글                      |
| `likeNoticeApi.ts`    | 공지사항 좋아요 조회·구독·토글                        |
| `likeEventApi.ts`     | 이벤트 좋아요 조회·구독·토글                          |
| `likeCommentApi.ts`   | 댓글 좋아요 조회·구독·토글                            |
| `updatePostApi.ts`    | 게시물 수정                                           |
| `updateCommentApi.ts` | 댓글 수정                                             |
| `viewCountApi.ts`     | 조회수 증가·구독                                      |
| `viewCountsApi.ts`    | 게시물 목록 조회수 일괄 구독                          |
| `boardSeenApi.ts`     | 게시판 마지막 방문 시각 조회·갱신                     |
| `boardCountsApi.ts`   | 게시판 카테고리별 게시물 수 조회                      |
| `createCommentApi.ts` | 댓글 생성                                             |
| `commentsApi.ts`      | 댓글 실시간 구독                                      |
| `latestPostsApi.ts`   | 카테고리별 최신 게시물 조회                           |
| `topViewedPostApi.ts` | 조회수 상위 게시물 조회·구독                          |

**hooks/ 업데이트 (20개)**

Firestore 직접 호출 제거 → api/ 함수 위임으로 전환:

`useGetBoard`, `useGetNotice`, `useGetEvent`, `useDeletePost`, `useDeleteNotice`, `useDeleteComment`, `useLikeBoard`, `useLikeNotice`, `useLikeEvent`, `useLikeComment`, `useUpdatePost`, `useUpdateComment`, `useViewCount`, `useViewCounts`, `useBoardSeen`, `useBoardCounts`, `useCreateComment`, `useComments`, `useLatestPosts`, `useTopViewedPost`

`@role`·`@rule` 주석 누락 파일 보완: `useEventPagination.ts`, `useNoticePagination.tsx`

**`onSnapshot` 구독 패턴 정립**

실시간 구독 함수를 `(ref, callback) => () => void` 형태로 api/에 추출:

- hook: `useEffect`에서 api 구독 함수를 호출하고 cleanup만 담당
- callback: hook에서 주입 → React 상태 업데이트 책임 명확히 분리

---

### 검증 결과

| 항목                              | 결과    |
| --------------------------------- | ------- |
| `hooks/` Firestore 직접 호출 잔존 | 없음 ✅ |
| `@role`·`@rule` 주석 누락         | 없음 ✅ |
| TypeScript 오류                   | 없음 ✅ |

---

## 2026-07-09 — 자유게시판 태그 기능 추가 및 FSD 규칙 전면 정비

### 작업 개요

자유게시판 글쓰기에 태그 입력 폼을 추가하고, 게시물 상세 페이지에서 태그를 조회할 수 있도록 구현했다. 또한 background 이미지 최신화와 FSD 규칙 위반 항목을 전면 수정했다.

---

### 수정 내용

**background 이미지 최신화**

- `TravelReviewTicker.tsx`에 누락된 이미지 4개 추가: 둔내, 마석, 만종, 매화
- `cityImageMap`에 해당 항목 등록

**자유게시판 태그 기능**

- `BoardPost` 엔티티에 `tags?: string[]` 필드 추가
- `createBoardApi` / `useCreateBoard`: Firestore 저장 시 `tags` 포함
- `useBoardHandler`: `tags`, `tagInput` 상태 및 `onTagInputChange`, `onTagInputKeyDown`, `onRemoveTag` 핸들러 추가
  - Enter 입력 시 태그 생성, `e.nativeEvent.isComposing` 체크로 한국어 IME 이중 입력 방지
  - 최대 5개 제한, 중복 태그 방지, `#` prefix 자동 제거
- `PCWriteForm` / `BoardForm`: 사진 첨부 하단에 태그 입력 섹션 추가 (입력창 아래 태그 칩 나열)
- `useGetBoard`: Firestore 데이터 매핑에 `tags: data.tags ?? []` 추가 — 상세 페이지 미표시 버그 수정
- `PCBoardDetailPage` / `BoardDetailPage`: 목업 태그(`MOCK_HASHTAGS`) 제거 → 실제 `post.tags` 렌더링
- `boardPageConstants.ts`: `MOCK_HASHTAGS` 상수 제거

**자유게시판 태그 검색**

- `useBoardPagination`: `#` 시작 쿼리 입력 시 `tags` 배열 검색, 일반 쿼리는 기존 제목·내용·작성자 검색 유지
- 검색 placeholder: `"제목, 내용, 작성자 검색 / #태그 검색"`으로 변경 (PC, 모바일 공통)

---

### FSD 규칙 검증 및 수정

| 위반 항목                                                                          | 조치                                                              |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `widgets/Board/ui/Board.tsx` — `ui/`에 `useState` 7개 직접 선언                    | `widgets/Board/hooks/useBoard.ts` 생성 후 상태·핸들러 분리        |
| `features/Board/hooks/useCreateBoard.ts` — `hooks/`에 Firestore `addDoc` 직접 호출 | `features/Board/api/createBoardApi.ts` 생성, 훅은 api 호출만 담당 |
| `widgets/Board/ui/BoardForm.tsx` — `@role`·`@rule` 주석 누락                       | 주석 추가                                                         |
| `features/Board/hooks/useBoardPagination.ts` — `@role`·`@rule` 주석 누락           | 주석 추가                                                         |
| `pages/Board/ui/BoardDetailPage.tsx` — `@role`·`@rule` 주석 누락                   | 주석 추가                                                         |
| `entities/Board/types/boardType.ts` — `@role`·`@rule` 주석 누락                    | 주석 추가                                                         |

---

### 수정 파일

| 파일                                                 | 변경 내용                                                |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `src/widgets/TravelReview/ui/TravelReviewTicker.tsx` | 둔내·마석·만종·매화 이미지 import 및 `cityImageMap` 등록 |
| `src/entities/Board/types/boardType.ts`              | `tags?: string[]` 추가, `@role`·`@rule` 주석 추가        |
| `src/features/Board/api/createBoardApi.ts`           | 신규 생성 — Firestore `addDoc` 호출 분리                 |
| `src/features/Board/hooks/useCreateBoard.ts`         | `createBoardApi` 호출로 전환, `@role`·`@rule` 주석 추가  |
| `src/features/Board/hooks/useBoardHandler.ts`        | 태그 상태·핸들러 추가, 한국어 IME 이중입력 방지          |
| `src/features/Board/types/boardType.ts`              | `BoardType`에 태그 관련 props 추가                       |
| `src/features/Board/hooks/useBoardPagination.ts`     | 태그 검색 로직 추가, `@role`·`@rule` 주석 추가           |
| `src/features/Board/hooks/useGetBoard.ts`            | `tags` 필드 매핑 추가                                    |
| `src/widgets/Board/hooks/useBoard.ts`                | 신규 생성 — `Board.tsx`에서 상태·핸들러 분리             |
| `src/widgets/Board/ui/Board.tsx`                     | `useBoard` 훅 사용으로 전환, 상태·핸들러 제거            |
| `src/widgets/Board/ui/PCWriteForm.tsx`               | 태그 입력 섹션 추가                                      |
| `src/widgets/Board/ui/BoardForm.tsx`                 | 태그 입력 섹션 추가, `@role`·`@rule` 주석 추가           |
| `src/widgets/Board/types/boardWidgetType.ts`         | `PCWriteFormProps`에 태그 props 추가                     |
| `src/pages/Board/ui/PCBoardDetailPage.tsx`           | 목업 태그 제거 → 실제 태그 렌더링                        |
| `src/pages/Board/ui/BoardDetailPage.tsx`             | 실제 태그 렌더링 추가, `@role`·`@rule` 주석 추가         |
| `src/pages/Board/ui/BoardWritePage.tsx`              | 태그 관련 props 전달 추가                                |
| `src/pages/Board/ui/PCBoardListPage.tsx`             | 검색 placeholder 업데이트                                |
| `src/pages/Board/constants/boardPageConstants.ts`    | `MOCK_HASHTAGS` 제거                                     |

---

## 2026-07-09 — 공지사항 PC 목록 UI 개선 및 기능 정리

### 작업 개요

공지사항 PC 목록 페이지를 통합게시판 스타일로 전면 개편하고, 댓글·좋아요 제거 및 어드민 접근 제한을 적용했다.

---

### 수정 내용

**공지사항 목록 UI 개선**

- `Notice` 위젯 PC 브랜치 제거 → `PCNoticeListPage`에서 직접 렌더링
- 개별 카드 → 단일 카드 컨테이너 + 행(row) 나열 (통합게시판 동일 스타일)
- 컬럼 헤더: 번호 / 제목 / 작성자 / 날짜 / 조회
- 게시글 번호 추가 (최신글 기준 내림차순)
- `useViewCounts`로 조회수 실시간 표시

**페이지네이션 추가**

- 기존 무한스크롤(`useNoticePageNation`) → `useGetNotice` 기반 클라이언트 페이지네이션으로 전환
- 10개 단위, 최대 5개 페이지 번호 표시 (통합게시판과 동일한 `‹ 1 2 3 ›` UI)
- 검색·정렬 변경 시 첫 페이지로 자동 초기화

**검색 범위 조정**

- 검색 대상에서 작성자 제외 → 제목·내용만 검색

**댓글·좋아요 제거**

- `PCNoticeDetailPage`에서 `CommentSection`, 좋아요·공유·즐겨찾기 버튼 제거
- `usePCNoticeDetailPage`에서 `useLikeNotice` 관련 로직 전체 제거

**어드민 접근 제한**

- 공지사항 글쓰기 버튼: `admin@gmail.com` 계정에만 표시
- `NoticeWritePage`: 어드민 외 접근 시 목록 페이지로 즉시 리다이렉트

---

### FSD 규칙 검증 결과

| 위반 항목                                                                                                  | 조치      |
| ---------------------------------------------------------------------------------------------------------- | --------- |
| `NoticeWritePage.tsx` `@role`·`@rule` 주석 누락                                                            | 주석 추가 |
| `usePCNoticeListPage`에 미사용 상태·반환값 잔존 (`menuOpenId`, `deletedIds`, `handleDelete`, `currentUid`) | 제거      |

---

### 수정 파일

| 파일                                             | 변경 내용                                                            |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `src/widgets/Board/ui/Notice.tsx`                | PC 브랜치 제거, 모바일 전용으로 정리                                 |
| `src/pages/Board/hooks/usePCNoticeListPage.ts`   | 전면 재작성 — `useGetNotice` 기반 페이지네이션·검색·정렬·어드민 로직 |
| `src/pages/Board/ui/PCNoticeListPage.tsx`        | 전면 재작성 — 행 목록 + 페이지네이션 UI 직접 렌더링                  |
| `src/pages/Board/hooks/usePCNoticeDetailPage.ts` | 좋아요 관련 로직 제거                                                |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx`      | 댓글·좋아요·공유·즐겨찾기 UI 제거                                    |
| `src/pages/Board/ui/NoticeWritePage.tsx`         | 어드민 접근 가드 추가, `@role`·`@rule` 주석 추가                     |

---

## 2026-07-09 — 통합게시판 필터 정리 및 공지사항 조회수 버그 수정

### 작업 개요

통합게시판 필터에서 "후기" 제거 및 누락된 "이벤트" 추가, 공지사항 상세 페이지 조회수 미집계 버그 수정, 통합게시판 공지 미표시 문제 개선.

---

### 수정 내용

**필터 정리**

- `BoardFilter` 타입에서 `'후기'` 제거, `'이벤트'` 추가
- `FILTER_TABS` 상수 동기화 (전체 / 공지 / 이벤트 / 자유)
- `usePCBoardPage` 필터 처리 로직에 `'이벤트'` 케이스 추가
- `PCBoardPage`에서 `activeFilter === '후기'` 조건부 렌더링 제거

**공지사항 조회수 미집계 수정**

- `usePCNoticeDetailPage`에 `useViewCount(postDocId)` 추가 — 공지 상세 진입 시 `boardViews` 카운트 누적
- `PCNoticeDetailPage` 작성일 옆에 `· 조회 {viewCount}` 표시 추가

**통합게시판 공지 미표시 개선**

- `useGetNotice`에 `isLoaded` 상태 및 try-catch 추가 — 로드 실패 시 콘솔 에러 출력
- `usePCBoardPage`의 `isLoading`을 board / notice / event 세 가지 모두 완료 시점으로 통일 — 데이터 로딩 전 렌더링으로 공지가 누락되던 타이밍 문제 해결

---

### FSD 규칙 검증 결과

| 위반 항목                                  | 조치      |
| ------------------------------------------ | --------- |
| `useGetNotice`에 `@role`·`@rule` 주석 누락 | 주석 추가 |

---

### 수정 파일

| 파일                                              | 변경 내용                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `src/pages/Board/types/boardPageType.ts`          | `BoardFilter`에서 `'후기'` 제거, `'이벤트'` 추가                    |
| `src/pages/Board/constants/boardPageConstants.ts` | `FILTER_TABS` 동기화                                                |
| `src/pages/Board/hooks/usePCBoardPage.ts`         | `'이벤트'` 필터 로직 추가, `isLoading` 조건 board·notice·event 통합 |
| `src/pages/Board/ui/PCBoardPage.tsx`              | `'후기'` 조건부 렌더링 제거                                         |
| `src/features/Board/hooks/useGetNotice.ts`        | `isLoaded` 추가, try-catch 추가, `@role`·`@rule` 주석 추가          |
| `src/pages/Board/hooks/usePCNoticeDetailPage.ts`  | `useViewCount` 추가, `viewCount` 반환                               |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx`       | 조회수 표시 추가                                                    |

---

## 2026-07-07 — PC 좌석변경 수락/거절 모달 디자인 개선

### 작업 개요

PC 전용 수락/거절 모달 디자인을 `SeatChangeModal` 기준으로 통일하고, 타이머 만료 시 자동 닫힘 기능을 추가했다.

---

### 수정 내용

- `ResponseModal` / `AcceptModal`에 `centered` prop 추가 — PC(`true`)와 모바일(`false`, 기본값) 스타일 분기
- PC 모달 디자인 `SeatChangeModal` 기준으로 통일
  - 배경: `bg-black/40 backdrop-blur-sm`
  - 카드: `w-[440px] animate-fade-up rounded-2xl px-8 pb-8 pt-5 shadow-2xl`
  - 헤더: 제목 + 서브타이틀 + X 닫기 버튼
  - 좌석 표시: `bg-gray-50` 섹션 + 배지 형태
  - 버튼: 거절 `bg-gray-100 text-gray-600` / 수락 `bg-blue text-white hover:bg-blue/90`
- 타이머 만료 시 자동 모달 닫기 — `useAutoCloseModal` 훅 신규 작성
  - Firebase에서 요청이 삭제(타이머 만료)되면 `response`가 `undefined`로 바뀌는 시점을 감지해 `closeModal` 호출
  - 마운트 직후 Firebase 응답 전 `undefined` 상태와 구분하기 위해 `useRef`로 최초 응답 수신 여부 추적

---

### FSD 규칙 검증 결과

| 위반 항목                                                          | 조치                                                            |
| ------------------------------------------------------------------ | --------------------------------------------------------------- |
| `ui/`에 `useEffect`·`useRef` 포함 (`ResponseModal.tsx`)            | `useAutoCloseModal` 훅으로 분리 → `widgets/Notification/hooks/` |
| `@role`·`@rule` 주석 누락 (`ResponseModal.tsx`, `AcceptModal.tsx`) | 주석 추가                                                       |

---

### 수정 파일

| 파일                                                    | 변경 내용                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx` | PC 모달 컨테이너 `fixed inset-0 z-[60]` 적용, `ResponseModal`/`AcceptModal` 직접 렌더링 |
| `src/widgets/Notification/ui/ResponseModal.tsx`         | `centered` prop 추가, PC 다이얼로그 스타일 분기, `useAutoCloseModal` 적용               |
| `src/widgets/Notification/ui/AcceptModal.tsx`           | `centered` prop 추가, PC 다이얼로그 스타일 분기                                         |
| `src/widgets/Notification/hooks/useAutoCloseModal.ts`   | 신규 — 타이머 만료 시 모달 자동 닫기 훅                                                 |

---

## 2026-07-07 — 포인트 undefined 오류 방지

### 작업 개요

포인트 데이터가 Firestore에 존재하지 않을 때 `undefined`가 그대로 상태에 저장되던 오류를 수정했다.

---

### 원인

`userSnap.data().point`가 `undefined`일 경우 `setPoint(undefined)`가 호출되어 포인트 관련 UI에서 오류 발생.

---

### 수정 내용

- `setPoint(userSnap.data().point)` → `setPoint(userSnap.data().point ?? 0)` 으로 nullish coalescing 추가

---

### 수정 파일

| 파일                                      | 변경 내용                  |
| ----------------------------------------- | -------------------------- |
| `src/features/Point/hooks/useGetPoint.ts` | `point ?? 0` fallback 추가 |

---

## 2026-07-07 — 회원가입 완료 시 이전 모달 활성화 오류 수정

### 작업 개요

회원가입 완료 후 이전에 열려 있던 모달이 재활성화되는 버그를 수정했다. PC 회원가입 단계별 로직을 `SignUpPage`에서 분리해 각 위젯 컴포넌트로 이동했다.

---

### 원인

`useSignUpPage`의 `window` 이벤트 리스너(CapsLock 감지 등)가 회원가입 완료 후에도 살아 있어 이전 모달을 재활성화했다.

---

### 구현 내용

- `useSignUpPage`에서 PC 전용 로직(`pcHandleNextClick`, `isCapsLockOn`, `setIsCapsLockOn`) 제거 — 모바일 로직만 유지
- `widgets/Auth/SignUp/` 하위에 PC 단계별 컴포넌트 신규 생성
  - `PCModal.tsx`: `modalType`에 따라 단계 컴포넌트 렌더링
  - `PCEmailStep.tsx`: 이메일 입력 UI
  - `PCNameStep.tsx`: 이름 입력 UI
  - `PCAgeStep.tsx`: 나이 입력 UI
  - `PCPasswordStep.tsx`: 비밀번호 입력 UI
- `usePCEmailStep.ts`: PC 이메일 단계 전용 훅 — `useFormContext`로 폼 접근, 이메일 중복 확인 후 `openModal('NameModal')` 호출

---

### 수정 파일

| 파일                                              | 변경 내용                                    |
| ------------------------------------------------- | -------------------------------------------- |
| `src/pages/Auth/SignUp/hooks/useSignUpPage.ts`    | PC 전용 상태·핸들러 제거, 모바일 로직만 유지 |
| `src/pages/Auth/SignUp/ui/SignUpPage.tsx`         | PC 회원가입 UI를 `PCModal`로 교체            |
| `src/widgets/Auth/SignUp/hooks/usePCEmailStep.ts` | 신규 — PC 이메일 단계 훅                     |
| `src/widgets/Auth/SignUp/ui/PCModal.tsx`          | 신규 — 단계 라우팅 컴포넌트                  |
| `src/widgets/Auth/SignUp/ui/PCEmailStep.tsx`      | 신규 — 이메일 입력 단계 UI                   |
| `src/widgets/Auth/SignUp/ui/PCNameStep.tsx`       | 신규 — 이름 입력 단계 UI                     |
| `src/widgets/Auth/SignUp/ui/PCAgeStep.tsx`        | 신규 — 나이 입력 단계 UI                     |
| `src/widgets/Auth/SignUp/ui/PCPasswordStep.tsx`   | 신규 — 비밀번호 입력 단계 UI                 |

---

## 2026-07-05 — PC 전체 화면 오른쪽 그림자 버그 수정

### 작업 개요

PC에서 어느 페이지를 가도 화면 오른쪽 끝이 어둡게 보이는 버그를 수정했다.

---

### 원인

`PCNotificationSidebar`는 항상 DOM에 존재하며, 닫힌 상태에서 `translate-x-full`로 화면 밖으로 이동하지만 `shadow-2xl`이 요소 왼쪽으로 번져 뷰포트 오른쪽 끝에 그대로 노출되고 있었음.

`PCNotificationSidebar`는 라우터 최상단에 전역으로 마운트되어 있어 모든 페이지에서 증상이 발생했음.

---

### 수정 내용

`isOpen`일 때만 `shadow-2xl` 적용, 닫힌 상태에서는 그림자 제거.

---

### 수정 파일

| 파일                                                    | 변경 내용                             |
| ------------------------------------------------------- | ------------------------------------- |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx` | `shadow-2xl`을 `isOpen` 조건부로 이동 |

---

## 2026-07-05 — 카카오 로그인 로딩 스크린 중앙 정렬

### 작업 개요

카카오 로그인 리다이렉트 시 표시되는 로딩 스크린을 수평·수직 중앙 정렬했다.

---

### 구현 내용

- `h-full` → `h-screen w-screen`으로 변경: 부모 높이 의존 방식에서 뷰포트 전체 차지로 전환해 중앙 정렬 보장

---

### 수정 파일

| 파일                                                 | 변경 내용                               |
| ---------------------------------------------------- | --------------------------------------- |
| `src/features/Auth/SocialLogin/ui/KakaoRedirect.tsx` | `h-full flex-col` → `h-screen w-screen` |

---

## 2026-07-05 — 좌석변경 버튼 추가 (홈 내 승차권 카드 + PC 내 승차권 페이지) + 개발 규칙 검증

### 작업 개요

홈 화면 내 승차권 카드와 PC 내 승차권 페이지 각 티켓에 좌석변경 버튼을 추가했다.

---

### 구현 내용

#### 홈 내 승차권 카드 (`ReserveTicket.tsx`, `useReserveTicket.ts`)

- `useReserveTicket`에 `handleSeatChange` 추가 — `navigateTo('/seatchange', { state: groups })`
- 카드 하단 바에 `좌석변경`(파란 채움) + `상세보기`(테두리) 버튼 나란히 배치

#### PC 내 승차권 페이지 (`PCTicketItem.tsx`, `usePCTicketListPage.ts`, `PCTicketListPage.tsx`)

- `usePCTicketListPage`에 `handleSeatChange` 추가 — navigate to `/seatchange`
- `PCTicketItem`에 `onSeatChange` prop 추가
- 티켓/구간 토글 버튼과 동일 행 우측 끝에 `좌석변경` 버튼 배치 (`justify-between`)
- 버튼 높이: 토글 컨테이너(`p-1` + 내부 `py-2`)와 동일하도록 `py-3` 적용

---

### 개발 규칙 검증 및 수정

| 위반                                                                     | 파일                     | 수정                                                        |
| ------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------- |
| `@rule` 주석 불일치 — `handleSeatChange` 추가 후 "상태만 담당" 문구 잔류 | `usePCTicketListPage.ts` | `@rule: 상태·이벤트 핸들러만 담당, UI 포함 금지`로 업데이트 |

---

### 수정 파일

| 파일                                                  | 변경 내용                                          |
| ----------------------------------------------------- | -------------------------------------------------- |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts` | `handleSeatChange` 추가                            |
| `src/widgets/TicketReserve/ui/ReserveTicket.tsx`      | 하단 바에 좌석변경 버튼 추가                       |
| `src/pages/TicketList/hooks/usePCTicketListPage.ts`   | `handleSeatChange` 추가, `@rule` 주석 수정         |
| `src/pages/TicketList/ui/PCTicketItem.tsx`            | `onSeatChange` prop 추가, 토글 행 우측에 버튼 배치 |
| `src/pages/TicketList/ui/PCTicketListPage.tsx`        | `handleSeatChange` prop 전달                       |

---

## 2026-07-05 — 내 승차권 카드 UI 리디자인 + 개발 규칙 검증

### 작업 개요

홈 화면 내 승차권 카드(`ReserveTicket`)의 UI를 리디자인하고, 데드 코드 및 주석 누락 규칙 위반 2건을 수정했다.

---

### 구현 내용

#### 카드 레이아웃 개편 (`ReserveTicket.tsx`)

- 높이 `138px` → `196px`, `rounded-xl`, `shadow-md` 로 변경
- 이모지(🗒️, 🚄) → SVG 아이콘으로 교체
- 기존 `duration` / `passengerCount` 정보 제거
- 3단 레이아웃 도입:
  - 상단: `TRAIN`(열차 종류) + `DATE`(출발일)
  - 중앙: 출발역 → 도착역 (SVG 화살표 + `DIRECT` 텍스트)
  - 하단: `SEAT`(좌석 ID 목록) + 상세보기 버튼

#### 여백 위치 조정 (`Ticket.tsx`)

- `mb-[20px]` 를 `ReserveTicket` 내부에서 `Ticket` 래퍼 div로 이동

---

### 개발 규칙 검증 및 수정

| 위반                                                                                                | 파일                  | 수정           |
| --------------------------------------------------------------------------------------------------- | --------------------- | -------------- |
| `@role` / `@rule` 주석 누락                                                                         | `Ticket.tsx`          | 상단 주석 추가 |
| 데드 코드 잔류 — `calcDuration`, `duration`, `koreanDate`, `passengerCount`, `dateObj`, `WEEK_DAYS` | `useReserveTicket.ts` | 전체 제거      |

---

### 수정 파일

| 파일                                                  | 변경 내용                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `src/widgets/TicketReserve/ui/ReserveTicket.tsx`      | 카드 UI 전면 리디자인, `dotDate` / `seatIds` 로 데이터 전환                                         |
| `src/widgets/TicketReserve/ui/Ticket.tsx`             | `mb-[20px]` 래퍼 이동, `@role`/`@rule` 주석 추가                                                    |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts` | 데드 코드 제거 (`calcDuration`, `duration`, `koreanDate`, `passengerCount`, `dateObj`, `WEEK_DAYS`) |

---

## 2026-07-05 — 팔로우 관리 페이지 버튼 텍스트 수정

### 작업 개요

팔로우 관리 페이지의 버튼 텍스트를 UX에 맞게 수정했다.

---

### 변경 내용

| 탭     | 변경 전    | 변경 후       |
| ------ | ---------- | ------------- |
| 팔로워 | `삭제`     | `x`           |
| 팔로잉 | `언팔로우` | `��로우 취소` |

### 수정 파일

| 파일                                       | 변경 내용        |
| ------------------------------------------ | ---------------- |
| `src/pages/Follow/ui/PCFollowListPage.tsx` | 버튼 텍스트 변경 |
| `src/pages/Follow/ui/FollowListPage.tsx`   | 버튼 텍스트 변경 |

---

## 2026-07-05 — PC 통합게시판 검색 UI 개선

### 작업 개요

통합게시판 검색 UX를 개선하고 검색과 필터를 연동했다.

---

### 변경 내용

| 항목             | 변경 전                          | 변경 후                                   |
| ---------------- | -------------------------------- | ----------------------------------------- |
| 검색 폼 위치     | 페이지 헤더 우측                 | 통합게시판 카드 헤더 내                   |
| 검색 초기화      | 별도 "초기화" 버튼               | input 내부 X 버튼 (입력값 있을 때만 표시) |
| 검색 결과 텍스트 | "검색결과 N개" 표시              | 제거                                      |
| 필터 탭 동작     | 검색 중 필터 탭 숨김             | 항상 표시                                 |
| 검색·필터 연동   | `allPosts` 전체 검색 (필터 무시) | `displayPosts` 검색 (필터 적용 후 검색)   |

---

### 수정 파일

| 파일                                      | 변경 내용                                                  |
| ----------------------------------------- | ---------------------------------------------------------- |
| `src/pages/Board/ui/PCBoardPage.tsx`      | 검색 폼 위치 이동, X 버튼 추가, 필터 탭 항상 표시          |
| `src/pages/Board/hooks/usePCBoardPage.ts` | `searchResults` 계산 기준 `allPosts` → `displayPosts` 변경 |

---

## 2026-07-05 — 로그인 모달 브라우저 뒤로가기 처리 + 개발 규칙 검증

### 작업 개요

로그인 이메일·비밀번호 모달이 열린 상태에서 브라우저 뒤로가기 시 모달을 닫고 로그인 카드로 복귀하도록 처리했다.

---

### 구현 내용

- 모달 열릴 때 `window.history.pushState`로 history 항목 추가
- `popstate` 이벤트 리스너로 뒤로가기 감지 → `resetModal()` 호출

```
모달 열림 → pushState → history: [..., login, modal]
뒤로가기  → popstate  → resetModal() → 로그인 카드 복귀
다시 뒤로 → 이전 페이지로 이동 (정상 네비게이션)
```

---

### 개발 규칙 검증 및 수정

| 위반                                                                   | 파일            | 수정                                                       |
| ---------------------------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| `pages/ui`에 `useEffect` 2개 직접 작성 (history push, popstate 리스너) | `LoginPage.tsx` | `pages/Auth/Login/hooks/useLoginPage.ts` 신규 생성 후 위임 |

---

### 신규 파일

| 파일                                         | 내용                                    |
| -------------------------------------------- | --------------------------------------- |
| `src/pages/Auth/Login/hooks/useLoginPage.ts` | history push·popstate 사이드이펙트 담당 |

### 수정 파일

| 파일                                    | 변경 내용                     |
| --------------------------------------- | ----------------------------- |
| `src/pages/Auth/Login/ui/LoginPage.tsx` | `useLoginPage` 훅 호출로 위임 |

---

## 2026-07-05 — 로그인·회원가입 PC UI 신규 구현 + 폼 이중 등록 버그 수정 + 개발 규칙 검증

### 작업 개요

로그인·회원가입 페이지에 PC 레이아웃(좌우 분할 패널)을 신규 구현했다.
PC·모바일이 동일한 `FormProvider`를 공유하면서 발생한 폼 필드 이중 등록 버그를 구조적으로 해결했다.
FSD 위반을 수정하고 TypeScript 타입 오류도 수정했다.

---

### 핵심 버그 — 폼 필드 이중 등록

**원인**: PC와 모바일 두 섹션이 항상 동시에 렌더링되는 상태에서 하나의 `FormProvider`를 공유하면, 같은 필드명(`email`, `name`, `password`)을 두 개의 `<input>`이 register하게 된다. react-hook-form은 마지막에 등록된 ref를 기준으로 validation을 수행하는데, CSS-hidden된 모바일 input의 ref가 나중에 등록되어 PC에서 타이핑한 값이 validation에 반영되지 않았다.

**수정**: PC와 모바일 각각 별도의 `FormProvider`로 격리해 form 컨텍스트를 분리했다.

---

### PC 로그인 UI 구현

- 좌우 분할 레이아웃 (`1fr 3fr`)
- 왼쪽 패널: 그라디언트 배경 + 브랜드 카피 + 통계 + 장식 구체 2개
- 오른쪽 패널: 로그인 카드 (이메일 로그인 버튼, 소셜 로그인, 회원가입 링크)
- 이메일·비밀번호 단계: 기존 `<Modal />` 컴포넌트 재사용, `formOpen` 조건으로 전환 애니메이션

### PC 회원가입 UI 구현

- 동일 레이아웃 구조
- 4단계(이메일 → 이름 → 추가 정보 → 비밀번호)를 `pcModalContent()` 함수 내 인라인 JSX로 처리
- 모달 컴포넌트(`NameModal`, `AgeModal`, `PasswordModal`)는 모바일 전용으로 유지
- 각 스텝 루트에 고유 `key` 부여 → React DOM 노드 재사용 방지 (이전 input 값 잔류 문제 해결)

---

### 버그 수정

| 버그                                | 원인                                                                                       | 수정                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| 로그인 다음 버튼 비활성             | `fetchSignInMethodsForEmail` — Firebase Email Enumeration Protection으로 항상 빈 배열 반환 | 이메일 존재 확인 단계 제거, 로그인 시도에서 처리. `auth/invalid-credential` 에러 케이스 추가 |
| PC 이메일 input 입력 불가           | PC·모바일 동일 FormProvider 내 이중 등록                                                   | FormProvider 분리                                                                            |
| PC 회원가입 이름 input 이전 값 잔류 | React DOM 노드 재사용                                                                      | 스텝 루트에 고유 `key` 부여                                                                  |
| 회원가입 완료 후 이전 모달 플래시   | `resetModal()` 호출이 `navigate('/')` 이후 실행되어 email 스텝이 순간 렌더링               | 마운트 시 `resetModal()` 실행으로 변경                                                       |
| 순서바 매 스텝 0%에서 시작          | 스텝 전환 시 `SignUpStageLine` 언마운트·재마운트로 `initial: 0` 반복 적용                  | `initial`을 `(stage-1)/total` 퍼센트로 설정                                                  |
| 이메일 오류 문구 미제거             | 다음 버튼 클릭 시 표시된 오류가 input 수정 후에도 잔류                                     | `watch('email')` + `useEffect`로 입력 변경 시 즉시 클리어                                    |
| SignUp Modal fixed 포지셔닝         | `Modal.tsx`의 `fixed` 컨테이너로 EmailForm이 가려지지 않음                                 | Login Modal과 동일하게 fixed 제거, 부모 컨테이너가 크기 제어                                 |

---

### 개발 규칙 검증 및 수정

| 위반                                             | 파일                      | 수정                                                   |
| ------------------------------------------------ | ------------------------- | ------------------------------------------------------ |
| `widgets/ui`에서 비동기 이메일 체크·사이드이펙트 | `EmaiModal.tsx`           | `useEmailModal.ts` 신규 생성 후 위임                   |
| `widgets/ui`에서 상태·사이드이펙트               | `Login/PasswordModal.tsx` | `usePasswordModal.ts` 신규 생성 후 위임                |
| `pages/ui`에서 async 이벤트 핸들러·상태          | `SignUpPage.tsx`          | `useSignUpPage.ts` 신규 생성 후 위임                   |
| `// @role` `// @rule` 인라인 주석 위치 오류      | 다수                      | JSDoc 형식(`/** */`)으로 import 위에 이동              |
| `UseFormReturn<FieldValues>` 타입 불일치         | `useSignUpPage.ts`        | `z.infer<typeof SignUpSchema>` 기반 구체 타입으로 변경 |

---

### UI 개선

- 로그인·회원가입 콘텐츠 카드: `w-[420px] h-[520px]` → `w-[520px] h-[620px]`
- 좌측 패널 grid 비율: `1.5fr 4fr` → `1fr 3fr`
- 좌측 패널 장식 구체 2개 추가 (우상단 큰 구, 좌하단 작은 구)
- 좌측 패널 텍스트 전체 크기 업
- Step 뱃지 스타일: `bg-gray-200 text-darkGray` → `bg-blue/10 text-blue`
- 성별·나이대 버튼 선택 스타일: 파란 배경 → `bg-blue/5 text-blue` (연한 파란색)
- 회원가입 버튼 텍스트: "회원가입" → "회원가입 완료"
- 로그인·회원가입 로딩 텍스트: "로그인 중...", "회원가입 중..." 추가

---

### 신규 파일

| 파일                                               | 내용                               |
| -------------------------------------------------- | ---------------------------------- |
| `src/widgets/Auth/Login/hooks/useEmailModal.ts`    | 이메일 모달 상태·핸들러            |
| `src/widgets/Auth/Login/hooks/usePasswordModal.ts` | 비밀번호 모달 상태·핸들러          |
| `src/pages/Auth/SignUp/hooks/useSignUpPage.ts`     | 회원가입 페이지 이벤트 핸들러·상태 |

### 수정 파일 목록 (주요)

| 파일                                             | 변경 내용                                                        |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `src/pages/Auth/Login/ui/LoginPage.tsx`          | PC 레이아웃 신규, FormProvider 분리                              |
| `src/pages/Auth/SignUp/ui/SignUpPage.tsx`        | PC 레이아웃 신규, FormProvider 분리, pcModalContent 4단계 인라인 |
| `src/widgets/Auth/Login/ui/EmaiModal.tsx`        | PC UI 재구성, useEmailModal 위임                                 |
| `src/widgets/Auth/Login/ui/PasswordModal.tsx`    | PC UI 재구성, usePasswordModal 위임                              |
| `src/widgets/Auth/Login/ui/Modal.tsx`            | fixed 컨테이너 제거                                              |
| `src/widgets/Auth/SignUp/ui/Modal.tsx`           | fixed 컨테이너 제거                                              |
| `src/widgets/Auth/SignUp/ui/NameModal.tsx`       | 모바일 전용으로 정리                                             |
| `src/widgets/Auth/SignUp/ui/AgeModal.tsx`        | 모바일 전용으로 정리                                             |
| `src/widgets/Auth/SignUp/ui/PasswordModal.tsx`   | 모바일 전용으로 정리                                             |
| `src/widgets/Auth/Login/ui/LoginStageLine.tsx`   | `initial` 이전 스텝 퍼센트로 수정                                |
| `src/widgets/Auth/SignUp/ui/SignUpStageLine.tsx` | 동일                                                             |
| `src/features/Auth/SignUp/ui/SelectAge.tsx`      | `w-full`, 버튼 스타일 개선                                       |
| `src/widgets/Auth/types/AuthType.ts`             | `width` optional로 변경                                          |
| `src/features/Auth/Login/hooks/useLoginState.ts` | `auth/invalid-credential` 에러 케이스 추가                       |

---

## 2026-07-05 — 여행지 후기 Ticker 도시 이미지 추가

### 작업 개요

`src/assets/background/` 폴더에 신규 추가된 도시 이미지 12종을 `TravelReviewTicker`에 반영했다.

---

### 추가된 도시 이미지

김천, 김천구미, 나주, 남원, 남춘천, 논산, 단양, 대전, 대천, 동대구, 동탄, 동해

### 수정 파일

| 파일                                                 | 변경 내용                                           |
| ---------------------------------------------------- | --------------------------------------------------- |
| `src/widgets/TravelReview/ui/TravelReviewTicker.tsx` | 신규 도시 이미지 12종 import 및 `cityImageMap` 등록 |

---

## 2026-07-03 — 비로그인 접근 범위 확장 + 비로그인 UI 공통 컴포넌트 분리 + 개발 규칙 검증

### 작업 개요

열차 조회·좌석 선택·내 승차권·마이페이지 등 주요 페이지를 비로그인 사용자도 접근 가능하도록 라우트를 변경하고,
비로그인 시 보여주는 안내 UI를 공통 컴포넌트로 추출했다.
FSD 위반 4건을 추가 수정했다.

---

### 라우트 변경 (`routes.tsx`)

기존 `HomeLayout`(인증 필수) → `PublicHomeLayout`(누구나 접근)으로 이동한 경로:

| 경로                                                            | 페이지      |
| --------------------------------------------------------------- | ----------- |
| `/ticketlist`                                                   | 내 승차권   |
| `/reserve/traincheck`                                           | 열차 조회   |
| `/reserve/seatcheck`                                            | 좌석 선택   |
| `/returnlist`                                                   | 승차권 반환 |
| `/mypage`                                                       | 마이페이지  |
| `/reserve/notification/setting`                                 | 알림 설정   |
| `/board/board`, `/board/notice`, `/board/event`, `/board/write` | 글쓰기      |

---

### 비로그인 UI 처리 방식

| 페이지                        | 처리 방식                                                       |
| ----------------------------- | --------------------------------------------------------------- |
| 내 승차권 (PC/모바일)         | 티켓 카드 → 로그인 안내 UI                                      |
| 좌석 선택 (PC)                | 하단 예매 카드 → 로그인 안내 UI (수평 정렬), 좌석 그리드는 노출 |
| 좌석 선택 (모바일)            | 예매 버튼 → "로그인하기"로 전환                                 |
| 승차권 반환 (PC/모바일)       | 티켓 카드 → 로그인 안내 UI                                      |
| 마이페이지 (PC)               | 전체 페이지 → 로그인 안내 페이지                                |
| 알림 설정 (PC/모바일)         | 전체 페이지 → 로그인 안내 UI                                    |
| 글쓰기 페이지 4종             | 전체 페이지 → 로그인 안내 페이지                                |
| 홈 내 승차권 위젯             | 빈 카드 blur 오버레이 → 로그인 안내                             |
| 게시판 댓글 입력칸            | 비로그인 시 blur + 안내 텍스트                                  |
| 게시판 답글 달기 버튼         | 비로그인 시 숨김                                                |
| 후기 작성 폼 (PCTravelReview) | 폼 자리 → 로그인 안내 카드                                      |

---

### 공통 컴포넌트 신규 생성

#### `shared/ui/LoginRequiredBlock.tsx`

- 자물쇠 아이콘 + "로그인이 필요한 서비스입니다" + 설명 + 버튼 블록
- Props: `description?`, `onLogin`, `size: 'sm'|'md'|'lg'`, `horizontal?: boolean`
- `horizontal=true`: 아이콘 · 텍스트 · 버튼 수평 정렬 (좌석선택 하단 카드에 사용)

#### `widgets/layouts/ui/PCLoginRequiredPage.tsx`

- PCTopNav + PCSidebar + 중앙 LoginRequiredBlock 전체 페이지 래퍼
- PC 전체 페이지 교체가 필요한 곳(마이페이지, 알림설정, 글쓰기)에서 사용

---

### 개발 규칙 검증 및 수정

| 위반                                                | 파일                                                  | 수정                                            |
| --------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| `widgets/ui`에서 `useNavigate` 직접 사용            | `ReserveTicket.tsx`                                   | `useReserveTicket`에 `handleLoginNavigate` 추가 |
| `pages/ui`에서 `auth`·`useNavigate` 직접 사용       | `TicketReturnPage.tsx`                                | `usePCTicketReturnPage`에 위임                  |
| `pages/ui`에서 `auth`·`useNavigate` 직접 사용       | `PCNotifiSettingPage.tsx`, `NotifiSettingPage.tsx`    | `usePCNotifiSettingPage.ts` 신규 생성           |
| `LoginRequired` 로컬 컴포넌트 내 `useNavigate` 호출 | `BoardWritePage`, `NoticeWritePage`, `EventWritePage` | `onLogin` prop으로 교체                         |
| `@role/@rule` 주석 누락                             | `NotifiSettingPage.tsx`                               | 추가                                            |

---

### 신규 파일

| 파일                                                     | 내용                             |
| -------------------------------------------------------- | -------------------------------- |
| `src/shared/ui/LoginRequiredBlock.tsx`                   | 비로그인 안내 공통 블록          |
| `src/widgets/layouts/ui/PCLoginRequiredPage.tsx`         | PC 전체 비로그인 페이지 래퍼     |
| `src/pages/Notification/hooks/usePCNotifiSettingPage.ts` | 알림설정 인증 상태·네비게이션 훅 |

### 수정 파일 목록 (주요)

| 파일                                                    | 변경 내용                                                |
| ------------------------------------------------------- | -------------------------------------------------------- |
| `src/app/routes.tsx`                                    | 7개 경로 PublicHomeLayout으로 이동, 4개 글쓰기 경로 추가 |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts`   | `handleLoginNavigate` 추가                               |
| `src/widgets/TicketReserve/ui/ReserveTicket.tsx`        | LoginRequiredBlock 적용                                  |
| `src/widgets/Board/ui/CommentSection.tsx`               | 비로그인 댓글 입력 blur, 답글 버튼 숨김                  |
| `src/pages/TicketList/hooks/usePCTicketListPage.ts`     | `isLoggedIn` 추가                                        |
| `src/pages/TicketList/ui/PCTicketListPage.tsx`          | LoginRequiredBlock 적용                                  |
| `src/pages/TicketList/ui/TicketListPage.tsx`            | LoginRequiredBlock 적용                                  |
| `src/pages/TicketReserve/hooks/usePCSeatCheckPage.ts`   | `isLoggedIn` 추가                                        |
| `src/pages/TicketReserve/ui/PCSeatCheckPage.tsx`        | 하단 카드 LoginRequiredBlock horizontal 적용             |
| `src/pages/TicketReserve/ui/SeatCheckPage.tsx`          | 예매 버튼 로그인 게이트                                  |
| `src/pages/TicketReturn/hooks/usePCTicketReturnPage.ts` | `isLoggedIn`, `handleLoginNavigate` 추가                 |
| `src/pages/TicketReturn/ui/PCTicketReturnPage.tsx`      | LoginRequiredBlock 적용                                  |
| `src/pages/TicketReturn/ui/TicketReturnPage.tsx`        | LoginRequiredBlock 적용                                  |
| `src/pages/Mypage/ui/PCMyPage.tsx`                      | PCLoginRequiredPage 적용                                 |
| `src/pages/Notification/ui/PCNotifiSettingPage.tsx`     | PCLoginRequiredPage 적용                                 |
| `src/pages/Notification/ui/NotifiSettingPage.tsx`       | LoginRequiredBlock 적용                                  |
| `src/pages/Board/ui/BoardWritePage.tsx`                 | LoginRequired → PCLoginRequiredPage + LoginRequiredBlock |
| `src/pages/Board/ui/NoticeWritePage.tsx`                | 동일                                                     |
| `src/pages/Board/ui/EventWritePage.tsx`                 | 동일                                                     |
| `src/pages/Board/ui/PCUnifiedWritePage.tsx`             | PCLoginRequiredPage 적용                                 |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`      | LoginRequiredBlock 적용                                  |
| `src/pages/TravelReview/ui/PCTravelReviewListPage.tsx`  | LoginRequiredBlock 적용                                  |

---

## 2026-07-03 — 산천 열차명 표시 개선 + 개발 규칙 검증

### 작업 개요

API가 반환하는 `KTX-산천(A-type)` 형태의 열차명을 `KTX-산천A` 형태로 변환하는 로직을 전 영역에 적용했다.
순수 변환 함수를 `shared/lib`으로 추출하고, 추천여행지 모달의 참조 동등성 버그를 수정했다.

---

### 구현 내용

#### 열차명 변환 유틸 추출

- `shared/lib/formatTrainName.ts` 신규 생성 — `formatTrainGradeName` 순수 함수
  - `KTX-산천(A-type)` → `KTX-산천A`
  - `KTX-산천(B-type)` → `KTX-산천B`

#### 적용 범위

| 위치                              | 변경                                                               |
| --------------------------------- | ------------------------------------------------------------------ |
| `usePCTrainCheckPage.ts`          | `trains` 항목에 `trainGradeDisplay` 추가                           |
| `PCTrainCheckPage.tsx`            | 열차 카드 뱃지 → `trainGradeDisplay` 사용                          |
| `useChoiceResultModal.ts`         | `selectTrainType` 파싱 후 `trainTypeDisplay` 반환                  |
| `ChoiceResultModal.tsx`           | 열차 칸 → `trainTypeDisplay` 사용                                  |
| `useMiniTicket.ts` (TicketList)   | `trainTypeName` 파싱 — A/B suffix 추가                             |
| `useMiniTicket.ts` (TicketReturn) | 동일                                                               |
| `usePCSeatCheckPage.ts`           | `trainTypeDisplay` 계산 후 반환                                    |
| `PCSeatCheckPage.tsx`             | 열차명 → `trainTypeDisplay` 사용                                   |
| `usePCDestinationModal.ts`        | `legTrainsWithDisplay` 매핑 — `trainGradeDisplay` 형제 필드로 추가 |
| `PCDestinationModal.tsx`          | 열차 뱃지 → `trainGradeDisplay` 사용                               |

#### 버그 수정 — 추천여행지 열차 선택 불가

- **원인**: `nextTrain`을 스프레드(`{ ...item.nextTrain, trainGradeDisplay }`)해 새 객체를 생성하면서 `pendingTrain?.train === nextTrain` 참조 동등 비교가 매 렌더마다 실패
- **수정**: `nextTrain`은 원본 참조를 유지하고 `trainGradeDisplay`를 형제 필드로 분리

---

### 개발 규칙 검증 및 수정

| 위반                                                        | 파일                                                | 수정                                   |
| ----------------------------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| 순수 함수 `formatTrainGradeName`이 `hooks/` 2곳에 중복 정의 | `usePCTrainCheckPage.ts`, `useChoiceResultModal.ts` | `shared/lib/formatTrainName.ts`로 추출 |
| 동일 로직 인라인 작성                                       | `usePCSeatCheckPage.ts`                             | `formatTrainGradeName` 호출로 교체     |

---

### 신규 파일

| 파일                                | 내용                             |
| ----------------------------------- | -------------------------------- |
| `src/shared/lib/formatTrainName.ts` | `formatTrainGradeName` 순수 함수 |

### 수정 파일 목록

| 파일                                                       | 변경 내용                                               |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `src/pages/TicketReserve/hooks/usePCTrainCheckPage.ts`     | `formatTrainGradeName` import, `trainGradeDisplay` 추가 |
| `src/pages/TicketReserve/ui/PCTrainCheckPage.tsx`          | 뱃지 → `trainGradeDisplay`                              |
| `src/widgets/TicketReserve/hooks/useChoiceResultModal.ts`  | `formatTrainGradeName` import, `trainTypeDisplay` 반환  |
| `src/widgets/TicketReserve/ui/ChoiceResultModal.tsx`       | → `trainTypeDisplay`                                    |
| `src/widgets/TicketList/hooks/useMiniTicket.ts`            | `trainTypeName` A/B suffix 파싱 추가                    |
| `src/widgets/TicketReturn/hooks/useMiniTicket.ts`          | 동일                                                    |
| `src/pages/TicketReserve/hooks/usePCSeatCheckPage.ts`      | `formatTrainGradeName` import, `trainTypeDisplay` 반환  |
| `src/pages/TicketReserve/ui/PCSeatCheckPage.tsx`           | → `trainTypeDisplay`                                    |
| `src/widgets/TicketReserve/hooks/usePCDestinationModal.ts` | `trainGradeDisplay` 형제 필드로 분리                    |
| `src/widgets/TicketReserve/ui/PCDestinationModal.tsx`      | `trainGradeDisplay` destructuring, 뱃지 적용            |

---

## 2026-07-03 — 미사용 변수 제거 (lint 오류 수정)

### 작업 개요

ESLint / TypeScript 경고 2건을 수정했다.

---

### 수정 내용

#### `useReserveTicket.ts` — 미사용 setter 및 import 제거

- `trainDataStore()`에서 destructuring한 `setStartDay`, `setSelectStartTime`, `setSelectTrainType`, `setSeatsId`, `setTrainNo` 5개가 선언만 되고 실제로 사용되지 않음
- 6-22 세션 훅 신규 생성 시 예매 플로우 초기화 목적으로 추가되었으나, 7-03 세션에서 `handleDetail`을 `/ticketlist`로 단순화하면서 setter 호출 로직이 제거된 채 선언만 잔류한 상태
- destructuring 블록 전체 및 `trainDataStore` import 제거

#### `MiniTicket.tsx` — 미사용 `duration` destructuring 제거

- map 콜백 내 destructuring에서 `duration`을 꺼냈으나 JSX에서 미사용
- 해당 항목 제거

---

### 수정 파일 목록

| 파일                                                  | 변경 내용                                         |
| ----------------------------------------------------- | ------------------------------------------------- |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts` | 미사용 setter 5개 및 `trainDataStore` import 제거 |
| `src/widgets/TicketList/ui/MiniTicket.tsx`            | 미사용 `duration` destructuring 제거              |

---

## 2026-07-03 — 내 승차권 UI 개선 + 개발 규칙 검증 및 수정

### 작업 개요

홈 상세보기 클릭 시 내 승차권 페이지 이동, 내 승차권 페이지에 티켓/구간 토글 추가.
개발 규칙 검증 후 위반 3건(MiniTicket 훅 호출, types 훅 import, PCRouteTicketItem 훅 호출) 수정.

---

### 구현 내용

#### 홈 상세보기 → 내 승차권 이동

- `useReserveTicket.ts` — `handleDetail` 경로를 `/ticket/seatchange` → `/ticketlist`로 변경

#### PC 내 승차권 티켓/구간 토글

- `PCTicketItem.tsx` 신규 — 각 티켓마다 독립 `티켓 | 구간` 토글 + opacity 전환 (rounded-lg 토글)
- `PCRouteTicketItem.tsx` 신규 — 구간 카드 렌더링 (RouteCard 재사용)
- `usePCRouteTicketItem.ts` 신규 — `useTicketDetail` 위임 훅
- `PCTicketListPage.tsx` — `useMiniTicket` 직접 호출, `PCTicketItem` 렌더링으로 교체, 미사용 MiniTicket import 제거
- `TicketListPage.tsx` — `useMiniTicket` 호출 후 `MiniTicket`에 props 전달
- `RouteCard.tsx` — 외곽 `rounded-2xl shadow-xl` → `rounded-xl shadow-md` (티켓 카드와 동일), 헤더 기차종류 뱃지·날짜 행 제거
- `MiniTicket.tsx` — `div.flex.flex-col.gap-4` 래퍼 추가 (카드 간 간격)

#### 개발 규칙 검증 및 수정

| 위반                        | 파일                    | 수정                                  |
| --------------------------- | ----------------------- | ------------------------------------- |
| `ui/` 파일에서 훅 직접 호출 | `MiniTicket.tsx`        | `useMiniTicket` 제거 → props 수신     |
| `types/` 파일에서 훅 import | `MiniTicketType.ts`     | `MiniTicketItem` 인터페이스 직접 정의 |
| `ui/` 파일에서 훅 직접 호출 | `PCRouteTicketItem.tsx` | `usePCRouteTicketItem` 분리           |

---

### 신규 파일

| 파일                                                 | 내용                       |
| ---------------------------------------------------- | -------------------------- |
| `src/pages/TicketList/ui/PCTicketItem.tsx`           | 티켓/구간 토글 + 카드 전환 |
| `src/pages/TicketList/ui/PCRouteTicketItem.tsx`      | 구간 카드 렌더링           |
| `src/pages/TicketList/hooks/usePCRouteTicketItem.ts` | useTicketDetail 위임 훅    |

### 수정 파일

| 파일                                                  | 변경 내용                        |
| ----------------------------------------------------- | -------------------------------- |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts` | handleDetail → /ticketlist       |
| `src/widgets/TicketList/ui/MiniTicket.tsx`            | 훅 제거 → props 수신, gap-4 래퍼 |
| `src/widgets/TicketList/types/MiniTicketType.ts`      | MiniTicketItem 직접 정의         |
| `src/widgets/TicketChange/ui/RouteCard.tsx`           | border·shadow 통일, 헤더 축소    |
| `src/pages/TicketList/ui/PCTicketListPage.tsx`        | PCTicketItem 렌더링으로 교체     |
| `src/pages/TicketList/ui/TicketListPage.tsx`          | useMiniTicket 호출 후 props 전달 |
| `src/pages/TicketList/ui/PCRouteTicketItem.tsx`       | usePCRouteTicketItem 사용        |

---

## 2026-07-03 — 개발 규칙 검증 및 좌석변경 페이지 개선

### 작업 개요

좌석변경 관련 신규 파일 FSD 규칙 검증 및 주석 누락 4건 수정.
`isLocksLoaded` 미사용 변수 수정 — 훅 내부 가드 제거 후 페이지에서 `onClick` 조건으로 처리.

---

### 규칙 검증 결과

| 파일                          | 위반                    | 조치 |
| ----------------------------- | ----------------------- | ---- |
| `SeatChangeModal.tsx`         | `@role/@rule` 주석 누락 | 추가 |
| `Modal.tsx`                   | `@role/@rule` 주석 누락 | 추가 |
| `PCSeatChangePage.tsx`        | `@rule` 설명 미흡       | 보완 |
| `SeatChangePage.tsx`          | `@role/@rule` 주석 누락 | 추가 |
| 레이어 의존성 / 세그먼트 역할 | —                       | 준수 |

### isLocksLoaded 수정

- **문제**: `usePCSeatChangePage`에서 `handleSeatClick` 내부에 `isLocksLoaded` 가드 → `PCSeatChangePage`에서 destructure만 하고 JSX에서 미사용
- **수정**: 훅 내부 가드 제거, `PCSeatChangePage`에서 `onClick={isLocksLoaded ? () => handleSeatClick(id) : () => {}}` 로 `PCSeatCheckPage` 패턴과 동일하게 처리

---

### 수정 파일 목록

| 파일                                                  | 변경 내용                                    |
| ----------------------------------------------------- | -------------------------------------------- |
| `src/widgets/TicketChange/ui/SeatChangeModal.tsx`     | @role/@rule 주석 추가                        |
| `src/widgets/TicketChange/ui/Modal.tsx`               | @role/@rule 주석 추가                        |
| `src/pages/TicketChange/ui/PCSeatChangePage.tsx`      | 주석 보완, isLocksLoaded onClick 조건 적용   |
| `src/pages/TicketChange/ui/SeatChangePage.tsx`        | @role/@rule 주석 추가                        |
| `src/pages/TicketChange/hooks/usePCSeatChangePage.ts` | handleSeatClick 내부 isLocksLoaded 가드 제거 |

---

## 2026-07-02 — 좌석변경 페이지 PC 개선 + 변경 모달 개선

### 작업 개요

좌석변경 페이지를 좌석 선택 페이지와 동일한 PC 구조로 변경.
변경 확인 모달을 PayModal 스타일로 개선하고 아이콘 모달을 카드 내 전환으로 변경.
모달 활성화 시 사이드바·상단바 제외하고 main 영역에만 오버레이 적용.

---

### 구현 내용

#### PC 좌석변경 페이지

- `PCSeatChange.tsx` 신규 — PC 좌석변경 전용 좌석 컴포넌트 (`isChangeTarget` 펄스 애니메이션)
- `usePCSeatChangePage.ts` 신규 — 좌석변경 로직 훅
- `PCSeatChangePage.tsx` 신규 — PCTopNav + PCSidebar + 좌석 그리드 + 하단 고정 버튼
- `SeatChangePage.tsx` — PC/모바일 분기 추가

#### 좌석변경 확인 모달 개선 (`SeatChangeModal.tsx`)

- 모바일: 바텀시트 유지
- PC: 중앙 센터드 (`lg:justify-center lg:backdrop-blur-sm`), 너비 `lg:w-[440px]`, PC 헤더 + X 버튼
- 선택 좌석 태그 카드 (blue badge 표시)
- `isSent` 상태로 카드 내 전환 — 아이콘 모달 별도 오픈 없이 같은 카드에서 페이퍼플레인 아이콘 + `animate-bounce-in` / `animate-fade-up` 표시
- `closeModal` 키 오류 수정 (`TrainNumberChoiceModal` → `SeatChangeModal`)

#### 모달 오버레이 범위 제한 (`Modal.tsx`)

- 모바일: `fixed w-[375px]` 유지
- PC: `lg:absolute lg:inset-0 lg:w-full` — `<main relative>` 안에서만 오버레이 적용
- PCTopNav · PCSidebar는 모달 활성화 시에도 그대로 표시

---

### 신규 파일

| 파일                                                  | 내용                      |
| ----------------------------------------------------- | ------------------------- |
| `src/widgets/TicketChange/ui/PCSeatChange.tsx`        | PC 좌석변경 좌석 컴포넌트 |
| `src/pages/TicketChange/hooks/usePCSeatChangePage.ts` | PC 좌석변경 로직 훅       |
| `src/pages/TicketChange/ui/PCSeatChangePage.tsx`      | PC 좌석변경 페이지        |

### 수정 파일

| 파일                                              | 변경 내용                      |
| ------------------------------------------------- | ------------------------------ |
| `src/pages/TicketChange/ui/SeatChangePage.tsx`    | PC/모바일 분기 추가            |
| `src/widgets/TicketChange/ui/SeatChangeModal.tsx` | PayModal 스타일 + 카드 내 전환 |
| `src/widgets/TicketChange/ui/Modal.tsx`           | PC absolute 오버레이           |

---

## 2026-07-01 — 개발 규칙 검증 및 FSD 위반 수정

### 작업 개요

신규 구현 파일 전체를 대상으로 FSD 아키텍처 규칙을 검증하고 위반 2건을 수정했다.

---

### 위반 수정 내역

#### 위반 1 — widgets/ui에서 useNavigate 직접 사용 (`BoardPostNotification.tsx`)

- **문제**: `ui/` 컴포넌트 내에서 `useNavigate()` 호출 및 네비게이션 로직 포함
- **수정**: `onNavigate?: () => void` prop으로 교체, 네비게이션 로직을 `PCNotificationSidebar`(호출부)로 위임

#### 위반 2 — features → features 교차 의존성 (`useIsReadNotification.ts`)

- **문제**: `features/Notification`이 `features/Follow`의 훅 3개를 직접 import
- **수정**:
  - `useIsReadNotification.ts` — Follow 관련 코드 전부 제거, Notification 기능만 담당
  - `useIsReadFollowNotification.ts` 신규 생성 (`features/Follow/hooks/`) — Follow 알림 읽음 처리 전담
  - `PCNotificationSidebar` — 두 훅을 각각 호출, "모두 읽음"에서 양쪽 모두 실행

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                             |
| ---------------------------------------------------------- | ------------------------------------- |
| `src/widgets/Notification/ui/BoardPostNotification.tsx`    | useNavigate 제거 → onNavigate prop    |
| `src/features/Notification/hooks/useIsReadNotification.ts` | Follow 의존성 제거                    |
| `src/features/Follow/hooks/useIsReadFollowNotification.ts` | 신규 — Follow 알림 읽음 처리          |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx`    | 두 훅 분리 사용, navigate 핸들러 전달 |

---

## 2026-07-01 — 각 게시판 글 작성 후 해당 게시판으로 이동 + 통합게시판 페이지네이션 확대

### 작업 개요

게시판별 글 작성 완료 후 이동 경로를 수정했다. 각 게시판 내에서 작성하면 해당 게시판으로, 메인 게시판에서 작성하면 메인으로 이동한다. 통합게시판 페이지네이션 버튼 크기도 키웠다.

---

### 구현 내용

#### 글 작성 후 navigate 경로 분리

- `useBaordHandler`, `useEventHandler`, `useNoticeHandler`에 `navigateTo?: string` 옵션 추가, 기본값 `/board` 유지
- `BoardWritePage` → `navigateTo: '/board/boardlist'`
- `EventWritePage` → `navigateTo: '/board/eventlist'`
- `NoticeWritePage` → `navigateTo: '/board/noticelist'`
- `PCUnifiedWritePage` → 기본값 `/board` 그대로

#### 통합게시판 페이지네이션 확대

- 페이지 버튼: `h-5 w-5 text-[10px]` → `h-7 w-7 text-xs`
- 화살표 아이콘: `12px` → `16px`
- 간격/패딩: `gap-1 py-3` → `gap-1.5 py-4`

---

### 수정 파일 목록

| 파일                                           | 변경 내용                       |
| ---------------------------------------------- | ------------------------------- |
| `src/features/Board/hooks/useBoardHandler.ts`  | navigateTo 옵션 추가            |
| `src/features/Board/hooks/useEventHandler.ts`  | navigateTo 옵션 추가            |
| `src/features/Board/hooks/useNoticeHandler.ts` | navigateTo 옵션 추가            |
| `src/pages/Board/ui/BoardWritePage.tsx`        | navigateTo: '/board/boardlist'  |
| `src/pages/Board/ui/EventWritePage.tsx`        | navigateTo: '/board/eventlist'  |
| `src/pages/Board/ui/NoticeWritePage.tsx`       | navigateTo: '/board/noticelist' |
| `src/pages/Board/ui/PCBoardPage.tsx`           | 페이지네이션 크기 확대          |

---

## 2026-07-01 — 이벤트 게시판 자유게시판 동일 구조 변경 + 이벤트 상세 PC 개선 + 팔로우 관리 UI 수정

### 작업 개요

이벤트 게시판 리스트/상세 페이지를 자유게시판과 동일한 PC 구조로 변경하고, 팔로우 관리 페이지에 삭제 기능과 UI 개선을 추가했다.

---

### 구현 내용

#### 이벤트 게시판 리스트 — 자유게시판 동일 구조

- `PCEventListPage.tsx` 전면 교체 — 검색바 + 정렬 드롭다운 + 뒤로가기/글쓰기 헤더
- `Event.tsx` — `isPC` / `externalSearchQuery` / `externalSortOrder` props 추가, PC 리스트 카드 렌더링 (작성자 아바타·이름·날짜·제목·내용 미리보기·이미지·수정삭제 메뉴)
- `usePCEventListPage.ts` 신규 — 검색/정렬 상태 훅

#### 이벤트 상세 페이지 PC 개선

- `PCEventDetailPage.tsx` 신규 — `PCBoardDetailPage`와 동일 레이아웃 (이벤트 뱃지, 팔로우 버튼, 좋아요, 수정/삭제 메뉴, 이미지)
- `usePCEventDetailPage.ts` 신규 — `useLikeEvent`, `useFollow`, 조회수, 수정/삭제 로직
- `EventDetailPage.tsx` — PC/모바일 분기 추가

#### 팔로우 관리 페이지 UI 수정

- `useFollowListActions.ts` 신규 — `removeFollower` / `removeFollowing` (양방향 Firestore 삭제 + 카운트 감소)
- `PCFollowListPage.tsx` / `FollowListPage.tsx` — 삭제 버튼 추가 (팔로워 탭: "삭제", 팔로잉 탭: "언팔로우"), 낙관적 UI 업데이트, 카드/탭 `rounded-xl` → `rounded-sm`

---

### 수정 파일 목록

| 파일                                                | 변경 내용                               |
| --------------------------------------------------- | --------------------------------------- |
| `src/pages/Board/ui/PCEventListPage.tsx`            | 전면 교체 — 자유게시판 동일 레이아웃    |
| `src/pages/Board/hooks/usePCEventListPage.ts`       | 신규                                    |
| `src/widgets/Board/ui/Event.tsx`                    | isPC props + PC 리스트 카드 렌더링 추가 |
| `src/pages/Board/ui/PCEventDetailPage.tsx`          | 신규 — PC 이벤트 상세                   |
| `src/pages/Board/hooks/usePCEventDetailPage.ts`     | 신규                                    |
| `src/pages/Board/ui/EventDetailPage.tsx`            | PC/모바일 분기 추가                     |
| `src/features/Follow/hooks/useFollowListActions.ts` | 신규                                    |
| `src/pages/Follow/ui/PCFollowListPage.tsx`          | 삭제 버튼, rounded-sm                   |
| `src/pages/Follow/ui/FollowListPage.tsx`            | 삭제 버튼, rounded-sm                   |

---

## 2026-07-01 — 팔로우 게시글 알림 2종 + PC 알림 설정 페이지 UI 개선

### 작업 개요

팔로워 수 1위 사용자 게시글 알림과 팔로잉 사용자 게시글 알림을 구현했다. 주 1회 쓰로틀 적용. PC 알림 설정 페이지에 상단바·사이드바를 추가했다.

---

### 구현 내용

#### 알림 1 — 팔로워 수 1위 게시글 알림 (`_topFollower`)

- 팔로워 수 1위 사용자가 자유게시판 글 작성 시 전체 사용자에게 알림
- `followerCounts/{uid}` — 팔로우/언팔로우 시 카운트 실시간 갱신
- `users/{uid}` — 앱 부팅 시 등록 (전체 사용자 조회용)
- `notifThrottle/{uid}.topFollowerLastSent` — 주 1회 쓰로틀
- "보러가기" 버튼: 알림 카드에서 해당 게시물 상세로 이동

#### 알림 2 — 팔로잉 사용자 게시글 알림 (`_followPost`)

- 팔로워들에게 알림 전송
- `notifThrottle/{uid}.followPostLastSent` — 주 1회 쓰로틀

#### 발송 흐름

`PCUnifiedWritePage` (pages) → `useBaordHandler`의 `onAfterCreate` 콜백 → `sendBoardPostNotifications` (features/Follow/api) → RTDB push

#### PC 알림 설정 페이지 UI 개선

- `PCNotifiSettingPage.tsx` 신규 — PCTopNav + PCSidebar
- `NotifiSettingPage.tsx` — PC/모바일 분기 추가

---

### 신규 파일 목록

| 파일                                                      | 내용                 |
| --------------------------------------------------------- | -------------------- |
| `src/features/Follow/api/boardPostNotification.ts`        | 알림 전송 순수 함수  |
| `src/features/Follow/hooks/useTopFollowerNotification.ts` | `_topFollower` 구독  |
| `src/features/Follow/hooks/useFollowPostNotification.ts`  | `_followPost` 구독   |
| `src/widgets/Notification/ui/BoardPostNotification.tsx`   | 알림 카드 (2종 공용) |
| `src/pages/Notification/ui/PCNotifiSettingPage.tsx`       | PC 알림 설정 페이지  |

### 수정 파일 목록

| 파일                                                          | 변경 내용                             |
| ------------------------------------------------------------- | ------------------------------------- |
| `src/app/App.tsx`                                             | 부팅 시 users/{uid} 등록              |
| `src/features/Follow/hooks/useFollow.ts`                      | followerCounts 카운트 갱신 추가       |
| `src/features/Board/hooks/useBoardHandler.ts`                 | onAfterCreate 콜백 + postDocId 전달   |
| `src/pages/Board/ui/PCUnifiedWritePage.tsx`                   | 알림 콜백 조합                        |
| `src/features/Notification/hooks/useIsReadNotification.ts`    | Follow 의존성 제거 (규칙 검증 후)     |
| `src/features/Notification/hooks/useHasUnreadNotification.ts` | \_topFollower, \_followPost 경로 추가 |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx`       | 두 알림 카드 렌더링 추가              |
| `src/pages/Notification/ui/NotifiSettingPage.tsx`             | PC/모바일 분기 추가                   |

---

## 2026-07-01 — PC 마이페이지 UI 개선 + 팔로우 기능 구현

### 작업 개요

PC 마이페이지 상단바·사이드바 추가 및 팔로우/팔로워 기능 전체 구현.
게시판 상세 페이지 팔로우 버튼 기능화, 팔로우 알림 전송, 마이페이지 팔로우 카운트, 팔로우 리스트 페이지 신규 추가.

---

### 구현 내용

#### PC 마이페이지 (`PCMyPage.tsx` 신규)

- PCTopNav + PCSidebar 추가
- 프로필 카드 (이니셜 아바타 + 이름 + 로그아웃)
- 팔로워/팔로잉 카운트 카드 (클릭 시 `/mypage/follow?tab=followers|following`)
- 포인트 카드 (SlotNumber 애니메이션)
- 앱 정보 (버전)
- `MyPage.tsx`에 PC/모바일 분기 (`hidden lg:block` / `lg:hidden`)

#### Firebase 데이터 구조

- Firestore: `follows/{followerUid}/following/{targetUid}` / `follows/{targetUid}/followers/{followerUid}`
- Realtime DB: `{targetUid}_follow/{key}` — 팔로우 알림

#### 신규 파일

- `src/entities/Follow/types/followType.ts` — FollowEntry, FollowNotificationType
- `src/features/Follow/hooks/useFollow.ts` — 팔로우 토글·상태 조회
- `src/features/Follow/hooks/useFollowNotification.ts` — 팔로우 알림 실시간 구독
- `src/features/Follow/hooks/useFollowList.ts` — 팔로워/팔로잉 목록 조회
- `src/widgets/Notification/ui/FollowNotification.tsx` — 팔로우 알림 카드
- `src/pages/Follow/ui/PCFollowListPage.tsx` — PC 팔로우 목록 (탭: 팔로워/팔로잉)
- `src/pages/Follow/ui/FollowListPage.tsx` — PC/모바일 분기

#### 기존 파일 수정

- `PCBoardDetailPage.tsx` / `usePCBoardDetailPage.ts` — 팔로우 버튼 기능화 (자기 글엔 미표시, 팔로잉 시 '팔로잉' 텍스트)
- `useIsReadNotification.ts` — updateFollowResponse + updateAllResponse 팔로우 포함
- `PCNotificationSidebar.tsx` — 팔로우 알림 카드 렌더링 추가
- `routes.tsx` — `/mypage/follow` 라우트 등록

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                  |
| ---------------------------------------------------------- | -------------------------- |
| `src/pages/Mypage/ui/PCMyPage.tsx`                         | 신규 — PC 마이페이지       |
| `src/pages/Mypage/ui/MyPage.tsx`                           | PC/모바일 분기             |
| `src/entities/Follow/types/followType.ts`                  | 신규 — 팔로우 타입         |
| `src/features/Follow/hooks/useFollow.ts`                   | 신규 — 팔로우 토글         |
| `src/features/Follow/hooks/useFollowNotification.ts`       | 신규 — 알림 구독           |
| `src/features/Follow/hooks/useFollowList.ts`               | 신규 — 목록 조회           |
| `src/widgets/Notification/ui/FollowNotification.tsx`       | 신규 — 알림 카드           |
| `src/pages/Follow/ui/PCFollowListPage.tsx`                 | 신규 — PC 목록 페이지      |
| `src/pages/Follow/ui/FollowListPage.tsx`                   | 신규 — 분기 페이지         |
| `src/pages/Board/hooks/usePCBoardDetailPage.ts`            | 팔로우 훅 연결             |
| `src/pages/Board/ui/PCBoardDetailPage.tsx`                 | 팔로우 버튼 기능화         |
| `src/features/Notification/hooks/useIsReadNotification.ts` | 팔로우 읽음 처리 추가      |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx`    | 팔로우 알림 렌더링         |
| `src/app/routes.tsx`                                       | /mypage/follow 라우트 추가 |

---

## 2026-07-01 — PC 알림 사이드바 전환

### 작업 개요

PC 알림 페이지를 오른쪽 슬라이드 사이드바로 전환했다.
알림 아이콘 클릭 시 페이지 이동 없이 사이드바가 열리며, 오버레이 클릭 또는 X 버튼으로 닫힌다.

---

### 구현 내용

#### Zustand 스토어 신규 생성 (`notificationSidebarStore.ts`)

- `isOpen / open() / close()` 로 사이드바 열림 상태 전역 관리

#### PCNotificationSidebar 신규 구현 (`PCNotificationSidebar.tsx`)

- 오른쪽에서 슬라이드인 (`translate-x-full → translate-x-0`)
- 어두운 오버레이 클릭 → 닫힘
- 헤더: 알림 제목 + 설정 링크(`/reserve/notification/setting`) + X 닫기 버튼
- NotificationPage 내용(startTime / change / accept / refuse 알림) 동일하게 재사용
- Modal(AcceptModal/ResponseModal)도 함께 렌더링

#### PCTopNav 수정 (`PCTopNav.tsx`)

- 알림 아이콘 `<Link to="/reserve/notification">` → `<button onClick={openNotificationSidebar}>`
- `notificationSidebarStore`의 `open` 직접 사용

#### 전역 렌더링 (`routes.tsx`)

- `<PCNotificationSidebar />` 를 `<Modal />` 옆에 추가 — 모든 PC 페이지에서 동작

---

### 수정 파일 목록

| 파일                                                         | 변경 내용                              |
| ------------------------------------------------------------ | -------------------------------------- |
| `src/widgets/Notification/model/notificationSidebarStore.ts` | 신규 — 사이드바 open/close 스토어      |
| `src/widgets/Notification/ui/PCNotificationSidebar.tsx`      | 신규 — 오른쪽 슬라이드 알림 사이드바   |
| `src/widgets/layouts/ui/PCTopNav.tsx`                        | Link → button, 스토어 open() 호출      |
| `src/app/routes.tsx`                                         | PCNotificationSidebar 전역 렌더링 추가 |

---

## 2026-06-30 — PC 공지사항 UI 개선 (목록·상세 페이지)

### 작업 개요

공지사항 목록·상세 페이지를 자유게시판 PC UI와 동일한 구조로 개선했다. 글 작성 후 리다이렉트 경로를 `/board`로 수정하고, FSD 규칙 검증을 완료했다.

---

### 구현 내용

#### 공지사항 목록 페이지 PC UI 개선

- `usePCNoticeListPage.ts` 신규 생성 — searchQuery, sortOrder 상태 관리, `useGetNotice`로 totalCount 제공
- `Notice.tsx` 위젯에 `isPC`, `externalSearchQuery`, `externalSortOrder` props 추가
  - PC 분기: `Board.tsx` PC 섹션과 동일한 카드 구조 (프로필 원, 이름/날짜, 공지 뱃지, ··· 메뉴, 제목/내용, 이미지, 좋아요 footer)
  - `NoticeSkeletonPC` 추가, `NoticeImage` 스켈레톤 방식(`hidden/block`) 적용
  - 클릭 시 `/board/notice/detail` 상세 페이지로 이동
- `PCNoticeListPage.tsx` 검색 input + 정렬 select 추가, `Notice isPC` prop 전달, 글쓰기 버튼 스타일 `rounded-sm` 통일

#### 공지사항 상세 페이지 PC UI 개선

- `usePCNoticeDetailPage.ts` 신규 생성 — `usePCBoardDetailPage`와 동일 구조, `useLikeNoitce` 사용
- `PCNoticeDetailPage.tsx` 신규 생성 — `PCBoardDetailPage`와 동일 레이아웃
  - 공지 뱃지 (파란색 `#dbeafe / #2563eb`)
  - 프로필 원 + 작성자/날짜 (조회수 없음)
  - 이미지, 본문, 좋아요·공유·즐겨찾기 액션 버튼
  - 댓글 섹션 (`CommentSection isPC`)
  - 소유자 수정/삭제 메뉴
- `routes.tsx`: `/board/notice/detail` → `PCNoticeDetailPage`로 교체

#### 글 작성 후 리다이렉트 수정

- `useBoardHandler`, `useNoticeHandler`, `useEventHandler`: 작성 완료 후 `/board` (게시판 허브) 이동

---

### 수정 파일 목록

| 파일                                             | 변경 내용                                       |
| ------------------------------------------------ | ----------------------------------------------- |
| `src/pages/Board/hooks/usePCNoticeListPage.ts`   | 신규 생성                                       |
| `src/pages/Board/hooks/usePCNoticeDetailPage.ts` | 신규 생성                                       |
| `src/pages/Board/ui/PCNoticeDetailPage.tsx`      | 신규 생성                                       |
| `src/pages/Board/ui/PCNoticeListPage.tsx`        | 검색·정렬 추가, Notice isPC prop 전달           |
| `src/widgets/Board/ui/Notice.tsx`                | isPC 분기 추가, PC 카드 레이아웃, 스켈레톤 적용 |
| `src/app/routes.tsx`                             | `/board/notice/detail` → `PCNoticeDetailPage`   |
| `src/features/Board/hooks/useBoardHandler.ts`    | navigate `/board`로 변경                        |
| `src/features/Board/hooks/useNoticeHandler.ts`   | navigate `/board`로 변경                        |
| `src/features/Board/hooks/useEventHandler.ts`    | navigate `/board`로 변경                        |

---

## 2026-06-30 — PC 게시판 이미지·스켈레톤·로딩 개선 및 규칙 검증

### 작업 개요

각 게시판 페이지에 스켈레톤 로딩을 추가하고, 자유게시판 PC 뷰 이미지 누락을 수정했다. 여행지 후기 이미지 업로드 경로 문제를 해결하고, 글 작성 완료 후 각 리스트 페이지로 이동하도록 수정했다. FSD 위반 5건을 수정했다.

---

### 구현 내용

#### 스켈레톤 추가

- `useComments.ts`: `isLoaded` 상태 추가 (첫 snapshot 수신 시 true)
- `CommentSection.tsx`: `!isLoaded` 동안 프로필 원 + 이름/내용 3행 스켈레톤 표시
- `PCTravelReviewPage.tsx`: 데이터 로딩 중 스켈레톤 카드에 이미지 영역 플레이스홀더 추가, `ReviewImage` 컴포넌트로 이미지 로드 전 스켈레톤(`h-60 w-full`) → 로드 후 이미지 전환
- `Board.tsx`: `BoardImage` 이미지 로드 전 `h-60 w-full animate-pulse` 스켈레톤 추가 (`opacity` 방식 → `hidden/block` 전환)

#### 자유게시판 PC 이미지 렌더링 수정

- `Board.tsx` PC 섹션에 `BoardImage` 렌더링 누락 → 내용 영역 아래 추가

#### 여행지 후기 이미지 업로드 경로 수정

- 한글 포함 경로(`travel-review/{destination}/{docId}/...`) → Invalid key 에러 발생
- 경로에서 `destination` 제거: `travel-review/{docId}/{file.name}`
- `useGetTravelReviews`: Supabase `.list('travel-review/{docId}')` 방식으로 이미지 조회

#### 글 작성 후 리스트 페이지 이동

| 핸들러             | 변경 전  | 변경 후             |
| ------------------ | -------- | ------------------- |
| `useBoardHandler`  | `/board` | `/board/boardlist`  |
| `useNoticeHandler` | `/board` | `/board/noticelist` |
| `useEventHandler`  | `/board` | `/board/eventlist`  |

#### 글쓰기 버튼 로딩 상태 추가

- `BoardType`에 `loading: boolean` 필드 추가
- `PCWriteForm`: `loading` prop 수신, 제출 버튼 `등록 중...` + `disabled` + `opacity-50` 처리
- `useBoardHandler`, `useNoticeHandler`, `useEventHandler` 기존 `loading` 상태 자동 연결

---

### 개발 규칙 검증 및 수정

| 위반             | 위치                  | 수정 |
| ---------------- | --------------------- | ---- |
| @role/@rule 누락 | `useBoardHandler.ts`  | 추가 |
| @role/@rule 누락 | `useNoticeHandler.ts` | 추가 |
| @role/@rule 누락 | `useEventHandler.ts`  | 추가 |
| @role/@rule 누락 | `useComments.ts`      | 추가 |
| @role/@rule 누락 | `CommentSection.tsx`  | 추가 |

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------- |
| `src/features/Board/hooks/useComments.ts`                  | `isLoaded` 추가, @role/@rule 추가                              |
| `src/features/Board/hooks/useBoardHandler.ts`              | navigate `/board/boardlist`, @role/@rule 추가                  |
| `src/features/Board/hooks/useNoticeHandler.ts`             | navigate `/board/noticelist`, @role/@rule 추가                 |
| `src/features/Board/hooks/useEventHandler.ts`              | navigate `/board/eventlist`, @role/@rule 추가                  |
| `src/features/Board/types/boardType.ts`                    | `BoardType`에 `loading: boolean` 추가                          |
| `src/features/TravelReview/hooks/useCreateTravelReview.ts` | 업로드 경로 `travel-review/{docId}/...`로 수정                 |
| `src/features/TravelReview/hooks/useGetTravelReviews.ts`   | Supabase `.list()` 경로 동일하게 수정                          |
| `src/pages/Board/ui/PCBoardPage.tsx`                       | 실시간 인기 빈 슬롯 animate-pulse 추가                         |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`         | `ReviewImage` 컴포넌트 추가, 스켈레톤 이미지 플레이스홀더 추가 |
| `src/widgets/Board/ui/Board.tsx`                           | PC 섹션 `BoardImage` 추가, 스켈레톤 방식 변경                  |
| `src/widgets/Board/ui/CommentSection.tsx`                  | 댓글 로딩 스켈레톤 추가, @role/@rule 추가                      |
| `src/widgets/Board/ui/PCWriteForm.tsx`                     | `loading` prop 수신, 버튼 로딩 상태 처리                       |

---

## 2026-06-29 — PC 게시판 허브 페이지 개선 및 규칙 검증

### 작업 개요

`PCBoardPage` 통합게시판의 높이 로직·UI를 전면 개선하고, FSD 위반 5건을 수정했다. 여행지 후기 작성 폼에 이미지 첨부 기능을 추가하고, 자유게시판 글쓰기 폼의 사진 첨부 아이콘을 교체했다.

---

### 구현 내용

#### 통합게시판 높이 수정 + 페이지네이션

- 기존 "카테고리별 최신 1건" 뷰 → 전체 게시물 합산(board + notice + event) 최신순 리스트로 전환
- 오른쪽 컬럼(실시간 인기 + 카테고리) 높이를 `ResizeObserver`로 측정
- 게시물 수 ≤ 페이지 크기: 자연 높이, 페이지네이션 숨김
- 게시물 수 > 페이지 크기: 보드 높이 = 우측 컬럼 높이 고정, 동적 페이지네이션 표시
- 그리드 `items-stretch` → `items-start` 변경
- `PAGE_SIZE` = `(우측컬럼높이 - 헤더 60px - 페이지네이션 44px) / 행 56px` 자동 계산

#### 글쓰기 버튼 이동 및 UI 조정

- 글쓰기 버튼: 상단 헤더 → 통합게시판 카드 헤더 필터 탭 오른쪽으로 이동
- 필터 탭 + 글쓰기 버튼 크기 증가 (`text-xs px-3` → `text-sm px-4`)
- 글쓰기 버튼 둥글기 `rounded-sm`

#### 게시물 검색 정렬

- 상단 헤더 검색 폼: `items-end` (제목 하단과 수평 정렬)

#### 여행지 후기 이미지 첨부

- `useCreateTravelReview`: `file?: File | null` 파라미터 추가, Supabase `travel-review/{destination}/{docId}/{filename}` 경로 업로드, imageUrl Firestore 저장
- `TravelReview` 엔티티: `imageUrl?: string | null` 필드 추가
- `useGetTravelReviews`: `imageUrl` 읽기 추가
- `usePCTravelReviewPage`: `writeFile`, `writePreviewImg`, `writeFileInputRef`, `onWriteFileChange` 상태 추가
- `PCTravelReviewPage`: 사진 첨부 칸 (점선 카드 + 미리보기 + 삭제 버튼) 추가, 후기 카드에 이미지 표시

#### 자유게시판 글쓰기 폼 사진 아이콘 교체

- `PCWriteForm`: 📷 이모지 → 카메라 SVG 아이콘 (`stroke="#9ca3af"`, 28px)
- 분류 select: `appearance-none` + `pr-8` + 커스텀 화살표 SVG로 드롭다운 아이콘 간격 개선

---

### 개발 규칙 검증 및 수정

| 위반                                                                                   | 위치              | 수정                           |
| -------------------------------------------------------------------------------------- | ----------------- | ------------------------------ |
| `useState`, `useEffect` (ResizeObserver) in `ui/`                                      | `PCBoardPage.tsx` | `usePCBoardPage.ts`로 이동     |
| `useTopViewedPost` 호출 + `top3DocIds` 계산 in `ui/`                                   | `PCBoardPage.tsx` | `usePCBoardPage.ts`로 이동     |
| `pageSize`, `pagedPosts`, `totalPages`, `showPagination`, `visiblePages` 계산 in `ui/` | `PCBoardPage.tsx` | `usePCBoardPage.ts`로 이동     |
| `CAT_STYLE_MAP` 상수 정의 in `ui/`                                                     | `PCBoardPage.tsx` | `boardPageConstants.ts`로 이동 |
| `CARD_HEADER_H`, `ROW_H`, `PAGINATION_H` 상수 in `ui/`                                 | `PCBoardPage.tsx` | `boardPageConstants.ts`로 이동 |

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                                                                                    |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `src/pages/Board/hooks/usePCBoardPage.ts`                  | allPosts·displayPosts·페이지네이션·ResizeObserver·top3DocIds 추가, rightColRef 파라미터 수신 |
| `src/pages/Board/ui/PCBoardPage.tsx`                       | 로직 제거 후 렌더링 전용, 글쓰기 버튼 이동, 필터/버튼 크기 조정                              |
| `src/pages/Board/constants/boardPageConstants.ts`          | `CAT_STYLE_MAP`, `BOARD_CARD_HEADER_H`, `BOARD_ROW_H`, `BOARD_PAGINATION_H` 추가             |
| `src/entities/TravelReview/types/travelReviewType.ts`      | `imageUrl` 필드 추가                                                                         |
| `src/features/TravelReview/hooks/useCreateTravelReview.ts` | Supabase 이미지 업로드 추가                                                                  |
| `src/features/TravelReview/hooks/useGetTravelReviews.ts`   | `imageUrl` 읽기 추가                                                                         |
| `src/pages/TravelReview/hooks/usePCTravelReviewPage.ts`    | 이미지 첨부 상태·핸들러 추가                                                                 |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`         | 사진 첨부 칸·이미지 표시 추가                                                                |
| `src/widgets/Board/ui/PCWriteForm.tsx`                     | 카메라 이모지 → SVG 아이콘, 분류 select 커스텀 화살표                                        |

---

## 2026-06-29 — PC 글 작성 페이지 UI 개선 (공지사항·이벤트·자유게시판)

### 작업 개요

공지사항·이벤트·자유게시판 글 작성 페이지에 PC 레이아웃을 추가했다. `PCWriteForm` 위젯을 신규 생성하여 세 페이지에서 공통으로 사용하고, `hidden lg:block / lg:hidden` 반응형 패턴으로 모바일 기존 UI를 유지했다. FSD 위반 1건을 수정했다.

---

### 구현 내용

#### PCWriteForm 위젯 (`widgets/Board/ui/PCWriteForm.tsx`)

- PCTopNav + PCSidebar + `px-64` 좌우 여백
- `< {backLabel}` 뒤로가기 버튼 + 글쓰기 대제목
- **글 작성 카드** (`rounded-xl bg-white p-8 shadow-sm`):
  - 분류(readonly, `bg-gray-50`) + 작성자 input — `grid-cols-2` 수평 정렬
  - 제목 input
  - 내용 textarea (`rows={11}`, `resize-none`)
  - 사진 첨부: 점선 카드 (`border-dashed`, `#f8fbff` 배경, 📷 이모지 + 텍스트 + JPG,PNG 수직 중앙) / 첨부 후 미리보기 + 삭제 버튼
  - 취소 + 작성 완료 버튼 오른쪽 정렬

#### 적용 페이지

| 페이지            | categoryLabel | backLabel  |
| ----------------- | ------------- | ---------- |
| `BoardWritePage`  | 자유          | 자유게시판 |
| `NoticeWritePage` | 공지          | 공지사항   |
| `EventWritePage`  | 이벤트        | 이벤트     |

---

### 개발 규칙 검증 및 수정

| 위반                                                | 수정                                  |
| --------------------------------------------------- | ------------------------------------- |
| `PCWriteFormProps` 인터페이스가 `ui/` 파일에 정의됨 | `boardWidgetType.ts`로 이동 후 import |

---

### 수정 파일 목록

| 파일                                         | 변경 내용                                      |
| -------------------------------------------- | ---------------------------------------------- |
| `src/widgets/Board/ui/PCWriteForm.tsx`       | 신규 생성 — PC 글 작성 폼 위젯                 |
| `src/widgets/Board/types/boardWidgetType.ts` | `PCWriteFormProps` 추가                        |
| `src/pages/Board/ui/BoardWritePage.tsx`      | `hidden lg:block / lg:hidden` 반응형 분기 추가 |
| `src/pages/Board/ui/NoticeWritePage.tsx`     | `hidden lg:block / lg:hidden` 반응형 분기 추가 |
| `src/pages/Board/ui/EventWritePage.tsx`      | `hidden lg:block / lg:hidden` 반응형 분기 추가 |

---

## 2026-06-29 — PC 자유게시판 목록 페이지 UI 개선

### 작업 개요

`PCBoardListPage`의 레이아웃을 전면 개선했다. 검색·정렬 칸과 게시물 칸을 분리하고, 게시물 카드 구조를 3fr(본문) + 1fr(좋아요·댓글) 방식으로 재설계했다. `useGetBoard`에 댓글 수 조회를 추가하고, FSD 위반 3건을 수정했다.

---

### 구현 내용

#### 제목칸

- 뒤로가기 + 자유게시판 대제목(좌) / 글쓰기 버튼(우)
- 글쓰기 버튼: 연필 아이콘 추가, `rounded-sm`

#### 검색 칸 (`PCTravelReviewPage` 스타일)

- 돋보기 아이콘 + `rounded-sm border border-gray-200 py-2` 검색 input
- 정렬 select: 최신순/조회순, `PCTravelReviewPage`와 동일한 `select` + 커스텀 화살표 SVG

#### 게시물 칸 (`Board isPC`)

- **상단(3fr)**: 이름 앞글자 프로필(`getProfileColor`) + 이름·날짜 수직 정렬 + ★ 별점 아이콘 + ··· 오너 드롭다운
- 제목 + 내용(`line-clamp-2`)
- **하단(1fr)**: `border-t border-gray-50` 구분 + ❤️ 좋아요 n | 💬 댓글 n
- 카드 `rounded-sm`, 좋아요 클릭 비활성(`div`로 교체)
- 오버레이 클릭 시 상세 페이지 이동 방지 (`e.stopPropagation()`)

#### 댓글 수 반영

- `useGetBoard`에서 각 게시물마다 `collection(db, 'boardComments', docId, 'items')` 조회 → `commentCount` 반환
- `BoardPost` 타입에 `commentCount?: number` 추가

---

### 개발 규칙 검증 및 수정

| 위반                                                     | 수정                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------- |
| `type SortOrder` 타입이 `hooks/` 파일에 정의됨           | `boardPageType.ts`에 `BoardSortOrder`로 이동 후 import                  |
| `interface Props` 타입이 `widgets/.../ui/` 파일에 정의됨 | `widgets/Board/types/boardWidgetType.ts` 신규 생성, `BoardProps`로 이동 |
| `type SortOrder`(4항목) 타입이 `ui/` 파일에 정의됨       | 동일하게 `boardWidgetType.ts`로 이동                                    |

---

### 수정 파일 목록

| 파일                                          | 변경 내용                                                                 |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `src/pages/Board/ui/PCBoardListPage.tsx`      | 검색 칸·정렬 select·글쓰기 버튼 UI 개선, `usePCBoardListPage` 연동        |
| `src/pages/Board/hooks/usePCBoardListPage.ts` | 신규 생성 — 검색어·정렬 상태 관리                                         |
| `src/pages/Board/types/boardPageType.ts`      | `BoardSortOrder` 추가                                                     |
| `src/widgets/Board/ui/Board.tsx`              | `isPC` prop, PC 카드 구조, `externalSearchQuery`/`externalSortOrder` 연동 |
| `src/widgets/Board/types/boardWidgetType.ts`  | 신규 생성 — `SortOrder`, `BoardProps` 타입                                |
| `src/entities/Board/types/boardType.ts`       | `commentCount?: number` 추가                                              |
| `src/features/Board/hooks/useGetBoard.ts`     | 댓글 수(`commentCount`) 조회 추가                                         |

---

## 2026-06-29 — PC 자유게시판 상세 페이지 UI 개선

### 작업 개요

기존 모바일 전용 `BoardDetailPage`에 PC 레이아웃(`PCBoardDetailPage`)을 추가했다. `BoardPage`와 동일한 `hidden lg:block` / `lg:hidden` 반응형 패턴으로 단일 라우트(`/board/board/detail`)에서 모바일·PC를 분기한다. 댓글 좋아요 기능을 신규 구현하고, 개발 규칙 위반 2건을 수정했다.

---

### 구현 내용

#### PCBoardDetailPage — 레이아웃

- PCTopNav + PCSidebar + `px-64` 좌우 여백
- 게시물 카드 + 댓글 카드 `flex-col gap-4` 분리

#### PCBoardDetailPage — 게시물 카드

- **제목칸** (`px-8 pt-8 pb-6`, `flex-col gap-3`)
  - 1행: 자유 뱃지(좌, `bg-[#dcfce7] text-[#16a34a]`) + `···` 수정·삭제 드롭다운(우)
  - 2행: 대제목 (`text-2xl font-black`)
  - 3행: 이름 앞글자 프로필 (`getProfileColor`, `rounded-full`) + 이름(위)·날짜·조회수(아래) 수직 정렬(좌) + 팔로우 버튼(`bg-lightBlue rounded-sm`, 우)
- **구분 바**: `mx-8 h-px bg-gray-100`
- **내용칸** (`px-8 pt-6 pb-8`)
  - 본문(`whitespace-pre-wrap`) + 해시태그 목업(`MOCK_HASHTAGS`, `rounded-full bg-gray-100`)
  - 액션 버튼 `justify-center gap-3`: 좋아요 / 공유 / 스크랩
    - 기본: `rounded-full border border-gray-200 bg-white px-4 py-2`
    - 좋아요 클릭 시: `bg-blue text-white border-blue` (하트 아이콘 `currentColor` 연동)
    - hover: 좋아요 `bg-lightBlue text-blue`, 공유 `bg-lightBlue text-blue`, 스크랩 `bg-yellow-50 text-yellow-500`

#### PCBoardDetailPage — 댓글 카드

- `CommentSection isPC` prop
  - 댓글 입력창 `fixed` 해제 → 카드 하단 자연 흐름 배치
  - `pb-[140px]` 제거, 댓글 헤더 `border-t` 제거, 입력칸 위 구분선 제거, 댓글 간 `border-b` 제거
- 댓글 수 숫자 `text-blue`, 헤더 `text-md`
- 입력창 `rounded-md`, 등록 버튼 `bg-blue text-white rounded-md px-6`

#### 댓글 좋아요 기능 (`useLikeComment`)

- Firestore 컬렉션: `commentLikes/{commentId}` (카운트), `isLiked/{uid}/commentVotes/{commentId}` (상태)
- `onSnapshot` 실시간 구독 + Optimistic update + rollback
- `CommentItem` 답글 달기 좌측에 하트 아이콘 + 좋아요 수 추가 (클릭 시 `text-blue`)

---

### 버그 수정 / 예외 처리

| 항목                    | 내용                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 연속 클릭 중복 트랜잭션 | `useLikeComment`, `useLikeBoard` 모두 `processingRef: Set<string>` 추가 — 트랜잭션 진행 중 재클릭 차단, `finally`로 해제 |

**원인**: `handleClickLike`는 async 함수로 `await` 지점에서 JS 제어권을 반환하기 때문에, 첫 번째 트랜잭션이 네트워크 대기 중일 때 두 번째 클릭이 진입 가능. `processingRef.add`는 동기 코드라 `await` 이전에 즉시 잠금되어 두 번째 클릭을 차단.

---

### 개발 규칙 검증 및 수정

| 위반                                                  | 수정                                                                                                                  |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `MOCK_HASHTAGS` 상수가 `ui/` 파일에 정의됨            | `boardPageConstants.ts`로 이동 후 import                                                                              |
| `OwnerMenu`가 `useState`를 가지고 `ui/` 파일에 정의됨 | `menuOpen`/`setMenuOpen`을 `usePCBoardDetailPage` 훅으로 이동, `OwnerMenu`는 props만 받는 순수 렌더링 컴포넌트로 변경 |

---

### 수정 파일 목록

| 파일                                              | 변경 내용                                                |
| ------------------------------------------------- | -------------------------------------------------------- |
| `src/pages/Board/ui/PCBoardDetailPage.tsx`        | 신규 생성 — PC 상세 페이지 레이아웃                      |
| `src/pages/Board/hooks/usePCBoardDetailPage.ts`   | 수정 — `menuOpen`/`setMenuOpen` 상태 추가                |
| `src/features/Board/hooks/useLikeComment.ts`      | 신규 생성 — 댓글 좋아요 훅                               |
| `src/features/Board/hooks/useLikeBoard.ts`        | `processingRef` 추가 — 중복 트랜잭션 방지                |
| `src/pages/Board/ui/BoardDetailPage.tsx`          | `hidden lg:block` / `lg:hidden` 반응형 분기 추가         |
| `src/widgets/Board/ui/CommentSection.tsx`         | `isPC` prop, `HeartIcon`, `useLikeComment` 연동, UI 수정 |
| `src/pages/Board/constants/boardPageConstants.ts` | `MOCK_HASHTAGS` 추가                                     |
| `src/pages/Board/hooks/usePCBoardPage.ts`         | `getDetailNav` board 경로 `/board/board/detail`로 통일   |
| `src/pages/Board/ui/PCBoardPage.tsx`              | 실시간인기 board 네비게이션 `/board/board/detail`로 복원 |
| `src/app/routes.tsx`                              | 불필요한 `/board/pc/board/detail` 라우트 제거            |

---

## 2026-06-29 — PC 여행지 후기 목록 페이지 신규 구현

### 작업 개요

PC 전용 여행지 후기 목록 페이지(`PCTravelReviewListPage`)를 신규 구현했다. 기존 모바일 `TravelReviewListPage`를 대체하여 `/travel/review/list` 라우트에 연결했다. 개발 규칙 검증으로 `StarPicker` 중복 정의 위반 1건을 수정했다.

---

### 구현 내용

#### 레이아웃

- PCTopNav + PCSidebar + `px-64` 좌우 여백

#### 제목 칸

- 좌측: `< 게시판` 뒤로가기, 여행지 후기 대제목, 소제목
- 우측: 후기 작성 버튼 (클릭 시 취소로 전환)

#### 후기 작성 카드 (제목칸 아래)

- 역 선택: 검색 input + 역 버튼 리스트 → 선택 시 뱃지 표시 + 변경 버튼
- 별점 소제목 + StarPicker
- 제목·내용 input
- 등록 버튼 (역·제목·내용 없으면 비활성)

#### 검색 칸

- 돋보기 아이콘 + 역 이름으로 검색 input + 전체 n개 역 (n은 파란색)

#### 여행지 카드 리스트 (`grid-cols-3`, 9개/페이지)

- 좌측: 이름 첫 글자 프로필(연한 배경 + 동일 색 텍스트, `rounded-md`) + 도시명 + 별점/점수 수직 정렬
- 우측: 후기 개수(파란색) + "후기" 소제목 수직 정렬

#### 페이지네이션

- 이전 버튼 + 숫자 버튼(`goToPage`) + 다음 버튼
- 활성 페이지 `bg-blue text-white`

---

### 개발 규칙 검증 및 수정

| 위반                                        | 수정                                                           |
| ------------------------------------------- | -------------------------------------------------------------- |
| `StarPicker`가 4개 `ui/` 파일에 중복 정의됨 | `shared/ui/StarPicker.tsx`로 추출, 4개 파일 모두 import로 교체 |

---

### 기타 변경

- `usePagination`에 `goToPage(n)` 추가 (특정 페이지 직접 이동)

---

### 수정 파일 목록

| 파일                                                        | 변경 내용                                             |
| ----------------------------------------------------------- | ----------------------------------------------------- |
| `src/pages/TravelReview/ui/PCTravelReviewListPage.tsx`      | 신규 생성 — PC 목록 레이아웃                          |
| `src/pages/TravelReview/hooks/usePCTravelReviewListPage.ts` | 신규 생성 — 검색·작성·페이지네이션 상태 관리          |
| `src/shared/ui/StarPicker.tsx`                              | 신규 생성 — 중복 제거 후 공통 컴포넌트로 추출         |
| `src/features/TravelReview/hooks/usePagination.ts`          | `goToPage` 추가                                       |
| `src/app/routes.tsx`                                        | `/travel/review/list` → `PCTravelReviewListPage` 교체 |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`          | 로컬 StarPicker 제거, shared import                   |
| `src/pages/TravelReview/ui/TravelReviewPage.tsx`            | 로컬 StarPicker 제거, shared import                   |
| `src/pages/TravelReview/ui/TravelReviewListPage.tsx`        | 로컬 StarPicker 제거, shared import                   |

---

## 2026-06-29 — PC 여행지 후기 상세 페이지 후기 작성 기능 추가

### 작업 개요

`PCTravelReviewPage`에 인라인 후기 작성 카드를 추가했다. 후기 작성 버튼 클릭 시 제목칸 아래, 별점 카드 위에 작성 폼이 나타나며, 등록 완료 후 자동으로 닫힌다. 개발 규칙 검증으로 FSD 위반 2건을 수정했다.

---

### 구현 내용

#### 후기 작성 카드 UI

- 후기 작성 버튼 클릭 → `showWriteForm: true`, 버튼이 취소로 전환 (동일 색상 유지)
- 카드 구조 (제목칸 바로 아래, 별점 카드 위):
  - 별점 소제목 + StarPicker (클릭으로 선택)
  - 제목 input
  - 내용 textarea (마우스 드래그로 크기 조절 가능)
  - 등록 버튼 — 제목·내용 비어있으면 `disabled:opacity-30`
- 등록 완료 시 폼 초기화 + 페이지 새로고침

#### 상태 및 로직 — `usePCTravelReviewPage`

- `showWriteForm`, `writeTitle`, `writeContent`, `writeRating`, `submitting` 상태 추가
- `handleWriteSubmit`: `useCreateTravelReview` 호출, 완료 후 초기화
- `reviews`를 파라미터로 받아 `processedReviews`, `ratingCounts`를 훅 내부에서 계산 후 반환

---

### 개발 규칙 검증 및 수정

| 위반                                                  | 수정                                                                       |
| ----------------------------------------------------- | -------------------------------------------------------------------------- |
| `processedReviews·ratingCounts`를 `ui/`에서 직접 계산 | `reviews`를 훅 파라미터로 전달, 훅 내부 계산 후 반환                       |
| `formatDate` 순수 유틸이 `hooks/`에 정의됨            | `shared/lib/formatDate.ts`에 `formatReviewDate`로 추가, ui에서 직접 import |

---

### 수정 파일 목록

| 파일                                                    | 변경 내용                                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| `src/pages/TravelReview/hooks/usePCTravelReviewPage.ts` | 후기 작성 상태·핸들러 추가, `reviews` 파라미터화, `formatDate` 제거 |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`      | 후기 작성 카드 UI, 버튼 전환 로직                                   |
| `src/shared/lib/formatDate.ts`                          | `formatReviewDate` 추가                                             |

---

## 2026-06-29 — PC 여행지 후기 상세 페이지 신규 구현

### 작업 개요

PC 전용 여행지 후기 상세 페이지(`PCTravelReviewPage`)를 신규 구현했다. 기존 모바일 페이지(`TravelReviewPage`)를 대체하여 `/travel/review` 라우트에 연결했다. 개발 규칙 검증으로 FSD 위반 4건을 수정했다.

---

### 구현 내용

#### 레이아웃

- PCTopNav + PCSidebar + `px-64` 좌우 여백

#### 제목 칸

- 좌측: `< 여행지 후기 목록` 뒤로가기 버튼, 비행기 아이콘 + "여행지 후기" 뱃지(퍼플 `#ede9fe`/`#7c3aed`), 도시명 대제목, 소제목
- 우측: 후기 작성 버튼 (수직 중앙 정렬)

#### 별점 카드 (`grid-cols-[1fr_3fr]`)

- 좌측: 평균 점수(`text-5xl font-semibold`) + StarRating + 후기 n개
- 우측: 5점~1점 수평 bar 그래프 (`bg-[#fbbf24]`) + 개수, 점수 텍스트 `text-gray-400`

#### 검색 칸

- 돋보기 아이콘 + input + `appearance-none` 커스텀 드롭다운(최신순/별점순)
  - 커스텀 SVG 화살표로 아이콘 위치 제어
  - `textAlignLast: 'left'`로 텍스트 왼쪽 정렬

#### 게시물 카드

- 상단: 이름 첫 글자 프로필 원 + 이름+날짜(수직) | StarRating + `...` 메뉴
- 하단: 제목 + 내용(수직)
- `...` 메뉴: 수정/삭제 드롭다운, 외부 클릭 시 닫힘
- 스켈레톤 로딩 3행

---

### 개발 규칙 검증 및 수정

| 위반                                                           | 수정                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `MoreMenu`의 `useState·useEffect·useRef`가 `ui/`에 직접 사용됨 | `useMoreMenu.ts` 훅으로 분리, `MoreMenu`는 훅 호출만   |
| `processedReviews·ratingCounts` 연산이 `ui/`에 있음            | `getProcessedReviews·getRatingCounts` 함수로 훅에 이동 |
| `PROFILE_COLORS·getProfileColor`가 `ui/`에 정의됨              | `constants/travelReviewPageConstants.ts`로 분리        |
| `SortOption` 타입이 `hooks/`에 정의됨                          | `types/travelReviewPageType.ts`로 분리                 |

---

### 라우팅 변경

- `/travel/review/pc` 별도 라우트 제거 (FSD 위반 아니나 프로젝트 패턴 불일치)
- `/travel/review` → `PCTravelReviewPage`로 교체 (기존 모바일 페이지 대체)
- 티커 네비게이션 `/travel/review`로 복원

---

### 수정 파일 목록

| 파일                                                            | 변경 내용                                    |
| --------------------------------------------------------------- | -------------------------------------------- |
| `src/pages/TravelReview/ui/PCTravelReviewPage.tsx`              | 신규 생성 — PC 전용 레이아웃                 |
| `src/pages/TravelReview/hooks/usePCTravelReviewPage.ts`         | 신규 생성 — 검색·정렬·수정·삭제 로직         |
| `src/pages/TravelReview/hooks/useMoreMenu.ts`                   | 신규 생성 — ... 드롭다운 상태 훅             |
| `src/pages/TravelReview/types/travelReviewPageType.ts`          | 신규 생성 — `SortOption` 타입                |
| `src/pages/TravelReview/constants/travelReviewPageConstants.ts` | 신규 생성 — 프로필 색상 상수·유틸            |
| `src/app/routes.tsx`                                            | `/travel/review` → `PCTravelReviewPage` 교체 |
| `src/widgets/TravelReview/ui/TravelReviewTicker.tsx`            | 네비게이션 경로 복원                         |

---

## 2026-06-27 — PC 게시판 페이지 UI 전면 개선

### 작업 개요

PC 게시판 허브 페이지(`PCBoardPage`)의 레이아웃을 전면 재설계했다. 베스트 여행지 후기 슬라이더, 실시간 인기 게시물, 통합게시판, 카테고리 섹션을 각각 개선했으며, 개발 규칙 검증으로 FSD 위반 5건을 수정했다.

---

### 구현 내용

#### 레이아웃 재구성

- 기존 2×2 그리드 → 풀 width 베스트 여행지 후기 + 1행 2열 그리드(통합게시판 4fr / 우측 1fr)로 변경
- 우측 컬럼: 실시간 인기 + 카테고리 수직 적층
- 통합게시판: 우측 컬럼 전체 높이에 맞게 `flex-1` stretch
- 좌우 여백 `px-32`로 콘텐츠 폭 축소

#### 베스트 여행지 후기 (`TravelReviewTicker`)

- 슬라이더 구조 순수 CSS 퍼센트 방식으로 전환 (`width: 200%`, 카드 10장 × `10%`)
- `translateX(-50%)` 무한 루프 — 갭 없이 5번째 이후 첫 번째로 끊김 없이 루프
- 카드 레이아웃: 상단 2/3 이미지 영역 + 하단 1/3 정보 영역 (`height: 200px`)
- 카드 간 구분: `border-x-[6px] border-gray-50` (페이지 배경색 트릭으로 gap 효과)
- 스켈레톤: 실제 카드 구조와 동일하게 상단 이미지 영역 + 하단 정보 영역 2줄
- `TICKER_COUNT` 4 → 5로 변경

#### 실시간 인기 (`useTopViewedPost`)

- `topPost: TopPost | null` → `topPosts: TopPost[]` (상위 5개)
- boardViews를 조회수 내림차순 정렬 후 `slice(0, 5)`
- UI: 🔥 이모지 + 1~5위 순위 리스트
  - 1위 `#ef4444`, 2위 `#f97316`, 3위 `#ca8a04`, 4~5위 `#9ca3af`
  - 제목(윗줄) + 게시물종류 - 조회수(아랫줄) 구조
  - `divide-y divide-gray-100` 구분선
  - 데이터 미달 시 항상 5줄 렌더링 (빈 슬롯 `-` 표시)

#### 통합게시판

- 제목 카드 내부로 이동, 분류바(헤더 행) 제거
- 필터 탭(전체·공지·자유·후기): 클릭 시 페이지 이동 → 인라인 필터링으로 변경
  - 활성 탭 `bg-blue text-white`, 탭 컨테이너 `rounded-[3px] bg-gray-100`
- 게시물 각 항목: 분류 뱃지(`rounded-[3px]`) + 제목(`text-base font-bold`) + `[댓글수]` + NEW 뱃지 + 작성자·날짜·조회수
  - NEW 뱃지: 원형→`bg-lightImpossible text-red rounded-[3px]`
  - 댓글 수 0이면 미표시
  - 클릭 시 상세 게시물 페이지로 이동 (notice/event/board 분기)
- 구분선: `absolute inset-x-5 bottom-0 border-b border-gray-100` (양쪽 여백 인셋)
- 스켈레톤: `isLoading` 상태 추가, 뱃지·제목·작성자·날짜·조회수 위치 맞춤 4행

#### 카테고리

- 아이콘 제거, `divide-y divide-gray-100` 구분선 추가
- 개수 뱃지: `bg-lightBlue text-blue`

#### `SeasonBanner`

- 높이 축소: `py-6` → `py-3`, 아이콘 `h-16 w-16` → `h-11 w-11`, 제목 `text-2xl` → `text-lg`

#### `useLatestPosts`

- 각 게시물에 `id`, `commentCount` 필드 추가
- `boardComments/{id}/items` 컬렉션 크기를 병렬 조회해 `commentCount` 반환
- `isLoading` 상태 추가

---

### 개발 규칙 검증 및 수정

| 위반                                                                 | 수정                                       |
| -------------------------------------------------------------------- | ------------------------------------------ |
| `BoardFilter` 타입이 `hooks/`에 정의됨                               | `types/boardPageType.ts` 신규 생성 후 이동 |
| `FILTER_TABS` 상수가 `ui/`에 정의됨                                  | `constants/boardPageConstants.ts`로 이동   |
| `filteredBoards` 필터 로직이 `ui/`에 있음                            | `usePCBoardPage` 훅으로 이동               |
| 상세 네비게이션 로직(`detailPath·stateKey·postState`)이 `ui/`에 있음 | `getDetailNav()` 함수로 추출해 훅으로 이동 |
| `BoardPage.tsx`에서 폐기된 `topPost` 사용                            | `topPosts[0] ?? null` 호환 처리            |

---

### 수정 파일 목록

| 파일                                                      | 변경 내용                                                               |
| --------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/pages/Board/ui/PCBoardPage.tsx`                      | 레이아웃 전면 재구성, 통합게시판 필터·스켈레톤·댓글수·NEW 뱃지·상세이동 |
| `src/pages/Board/hooks/usePCBoardPage.ts`                 | `activeFilter`, `filteredBoards`, `getDetailNav` 추가                   |
| `src/pages/Board/types/boardPageType.ts`                  | `BoardFilter` 타입 신규 생성                                            |
| `src/pages/Board/constants/boardPageConstants.ts`         | `FILTER_TABS` 추가                                                      |
| `src/pages/Board/ui/BoardPage.tsx`                        | `topPost` → `topPosts[0]` 호환 처리                                     |
| `src/features/Board/hooks/useTopViewedPost.ts`            | 단일 → 상위 5개 배열 반환으로 변경                                      |
| `src/features/Board/hooks/useLatestPosts.ts`              | `id`, `commentCount`, `isLoading` 추가                                  |
| `src/features/Board/types/boardType.ts`                   | `LatestPost`에 `id`, `commentCount` 필드 추가                           |
| `src/widgets/TravelReview/ui/TravelReviewTicker.tsx`      | 순수 CSS 슬라이더, 카드 구조 개편, 스켈레톤 개선                        |
| `src/widgets/TravelReview/hooks/useTravelReviewTicker.ts` | `TICKER_COUNT` 4 → 5                                                    |
| `src/widgets/Season/ui/SeasonBanner.tsx`                  | 높이 축소                                                               |

---

## 2026-06-24 — PC 결제 모달 UI 개선 및 카드 할인 로직 구현

### 작업 개요

`PayModal` PC 결제 모달의 결제수단·카드사 선택 UI를 전면 개선하고, 카드사별 할인 로직(즉시할인·페이백·청구할인)을 구현했다. 개발 규칙 검증으로 FSD 위반 2건을 수정했다.

---

### 구현 내용

#### `PayModal.tsx` — 결제수단 카드

- `PAYMENT_METHOD_ICONS` 모듈 레벨 SVG 맵 추가 (신용카드·간편결제·계좌이체)
- 버튼 구조: `flex flex-col items-center gap-1.5 rounded-lg py-3` — 아이콘 상단, 텍스트 하단 수직 정렬
- 선택 시 `border-blue text-blue` (배경색 없음), 미선택 시 `text-gray-400`
- 소제목 `text-gray-400`, `font-bold` 유지

#### `PayModal.tsx` — 카드사 선택 카드

- 카드사 컨테이너: `rounded-xl border border-gray-100 bg-gray-50 p-3` (소제목 내부 배치)
- 카드 버튼: `relative flex flex-col items-center gap-1.5 rounded border py-2.5 text-xs`
- 브랜드 뱃지: `h-4 w-8 rounded-full text-[8px] font-black` — 카드사 고유 색상 inline style
  - 국민(`KB`·`#FFBC00`), 신한(#0046FF), 삼성(#1428A0), 현대(#002C5F), 롯데(#E40001), 농협(`NH`·#009644), 하나(#01AA5B), BC(#F04E23)
- 오퍼 뱃지: `absolute -right-1.5 -top-1.5 rounded-full px-1.5 py-0.5 text-[9px]` — 국민·신한·현대만 표시
- 이벤트 배너: 카드사 `bannerColor` 기반 — 배경 `hex+'18'`, 텍스트·아이콘 동일 색, 선물 SVG 아이콘 + 왼쪽 정렬

#### `PayModal.tsx` — 헤더 및 기타 UI

- PC 제목 `결제하기`, 소제목 `결제 하실 금액`
- 금액: `text-3xl font-semibold`
- 이벤트 select: `appearance-none rounded-lg py-2.5` + 커스텀 회색 chevron SVG (`absolute right-3`)
- 포인트 input: `h-9 rounded-lg`, 비활성화 시 `placeholder="0"` + `disabled:bg-gray-50`
- 모두 사용 버튼: `rounded-lg px-4`, 비활성화 시 `disabled:text-gray-300 disabled:bg-gray-50`
- 금액 요약 카드 할인 항목: 💳 이모지 + `cardDiscountRate`%, 페이백 항목: `cardPaybackRate`% + `text-teal-400`
- 취소·결제 버튼: `rounded-xl`

#### `payModalConstants.ts` — CARD_LIST 필드 확장

| 필드          | 설명                                                                 |
| ------------- | -------------------------------------------------------------------- |
| `badge`       | 뱃지 표시 텍스트 (국민→`KB`, 농협→`NH`)                              |
| `note`        | 오퍼 뱃지 텍스트 (국민·신한·현대만)                                  |
| `noteColor`   | 오퍼 뱃지 배경색                                                     |
| `bannerColor` | 이벤트 배너 색상 (국민#0062FF·신한#F97316·현대#2DD4BF·나머지#7C3AED) |
| `discount`    | 즉시할인율 (신한 0.10, 나머지 기존값, 국민·현대 0)                   |
| `payback`     | 페이백율 (현대 0.20, 나머지 0)                                       |

#### `usePayModal.ts` — 파생값·핸들러 추가

- `cardPayback`: `finalPrice * selectedCardData.payback` — 결제 후 `updatePoint`에 가산
- `cardDiscountRate`, `cardPaybackRate`: `Math.round(rate * 100)` 파생값
- `bannerText`: `note` 유무 분기 → 텍스트 생성
- `processedCardList`: `CARD_LIST` 매핑 — `note`·`noteColor` 추출 (TypeScript narrowing UI 제거)
- `handleEventChange`: `ChangeEvent<HTMLSelectElement>` 핸들러 (raw setter 대체)

---

### 개발 규칙 검증 및 수정

| 위반                                                                                        | 수정                                                                                               |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PayModal.tsx` — `'note' in rest` 추출·`Math.round` 계산 로직이 ui/에 존재                  | `usePayModal.ts`의 `processedCardList`, `cardDiscountRate`, `cardPaybackRate`, `bannerText`로 이동 |
| `PayModal.tsx` — `setEventSelected(e.target.value as ...)` raw setter 직접 호출 + 타입 단언 | `usePayModal.ts`에 `handleEventChange` 추가, UI는 핸들러만 호출                                    |

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/widgets/TicketReserve/ui/PayModal.tsx`                | 결제수단·카드사 UI 전면 개선 — 아이콘, 뱃지, 배너, 헤더, 금액 표시, input/버튼 스타일                             |
| `src/widgets/TicketReserve/hooks/usePayModal.ts`           | `cardPayback`, `cardDiscountRate`, `cardPaybackRate`, `bannerText`, `processedCardList`, `handleEventChange` 추가 |
| `src/widgets/TicketReserve/constants/payModalConstants.ts` | `badge`, `note`, `noteColor`, `bannerColor`, `discount`(재정의), `payback` 필드 추가                              |

---

## 2026-06-24 — PC 이벤트(계절 할인) 모달 UI 개선

### 작업 개요

PC 이벤트 모달(`PCSeasonModal`)을 전면 개선했다. 계절별 이미지·색상·레이아웃을 재설계하고, 개발 규칙 검증을 통해 FSD 위반을 수정했다.

---

### 구현 내용

#### 레이아웃 구조

- **상단 이미지 구간 (190px)**
  - 계절별 이미지: 여름→강릉, 겨울→부산, 봄→춘천, 가을→전주
  - 아래로 갈수록 계절 메인색이 진해지는 그라디언트 오버레이
  - SPECIAL DISCOUNT 배지 + 대제목 + 소제목 텍스트 (하단 중앙)
- **하단 콘텐츠 구간 (`rounded-t-2xl`, `-mt-4` 겹침)**
  - 위치 아이콘 + 추천 여행지 소제목
  - 지역 카드 2열 그리드
  - 안내 문구 카드 (파란 아이콘, `bg-gray-100`)
  - 닫기 버튼

#### 지역 카드 아이콘 배경·색상 규칙

| 위치           | 배경                       | 아이콘 |
| -------------- | -------------------------- | ------ |
| 왼쪽 홀수 행   | 계절 메인색 (`primaryHex`) | 흰색   |
| 왼쪽 짝수 행   | 연한 회색 (`#e5e7eb`)      | 회색   |
| 오른쪽 홀수 행 | 연한 메인색 (`lightHex`)   | 메인색 |
| 오른쪽 짝수 행 | 중간 메인색 (`midHex`)     | 메인색 |

#### 모달 UX

- `animate-fade-up` 활성화 애니메이션
- 배경 클릭 시 닫힘
- 오버레이 `px-[35%]`로 좌우 여백 → 모달 너비 제어
- 상단바·사이드바 제외 오버레이 (`lg:left-[220px] lg:top-14`)
- `h-fit` 으로 콘텐츠 높이에 맞게 자동 조절

#### `SEASON_STYLE` 확장

`seasonStations.ts`에 계절별 hex 색상 필드 추가:

- `primaryHex`: 메인 색상 hex
- `lightHex`: 연한 버전 hex
- `midHex`: 중간 버전 hex
- `overlayColor`: 이미지 오버레이 색상

여름 색상 `amber` → `blue` 계열로 변경

---

### 개발 규칙 검증 및 수정

| 위반                                                       | 수정                                          |
| ---------------------------------------------------------- | --------------------------------------------- |
| `PCSeasonModal.tsx` — `useCurrentSeason` ui/에서 직접 호출 | `hooks/usePCSeasonModal.ts` 신규 생성 후 위임 |

---

### 수정 파일 목록

| 파일                                           | 변경 내용                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| `src/widgets/Season/ui/PCSeasonModal.tsx`      | 전면 개선 — 이미지, 색상, 레이아웃, 지역 카드                                |
| `src/widgets/Season/hooks/usePCSeasonModal.ts` | 신규 생성 — 계절 데이터·이미지 매핑                                          |
| `src/widgets/Season/ui/SeasonBanner.tsx`       | PCSeasonModal 추가 렌더, PCSeasonModal lg 전용                               |
| `src/widgets/Season/ui/SeasonModal.tsx`        | `lg:hidden` 추가 (모바일 전용)                                               |
| `src/widgets/Season/types/SeasonModalType.ts`  | `PCSeasonModalProps` 추가                                                    |
| `src/shared/constants/seasonStations.ts`       | `primaryHex`, `lightHex`, `midHex`, `overlayColor` 필드 추가, 여름 색상 변경 |

---

## 2026-06-24 — PC 모달 UX 개선 및 FSD 규칙 정비

### 작업 개요

PC 환경 모달들의 오버레이 처리를 개선하고(상단바·사이드바 제외, blur 효과), 페이지 이동 시 모달 자동 비활성화 기능을 추가했다. 아울러 `PayModal` FSD 위반 수정, 결제 모달 PC화, 반환 모달 UX 개선 등을 진행했다.

---

### 구현 내용

#### 모달 오버레이 개선 — 상단바·사이드바 제외 + blur

PC에서 모달 활성화 시 오버레이가 전체 화면을 덮던 것을 사이드바(220px)·상단바(56px) 영역을 제외하도록 변경하고, 배경에 `backdrop-blur-sm` 적용.

| 파일                                              | 변경 내용                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `widgets/TicketReserve/ui/Modal.tsx`              | `lg:left-[220px] lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:w-[calc(100%-220px)]` |
| `widgets/TicketReserve/ui/ChoiceResultModal.tsx`  | `lg:backdrop-blur-sm` + 시간 크기 증가(`lg:text-xl`), 소제목 수평 정렬        |
| `widgets/TicketReserve/ui/PayModal.tsx`           | `lg:justify-center lg:backdrop-blur-sm`, PC 헤더(제목+X버튼) 추가             |
| `widgets/Season/ui/SeasonModal.tsx`               | `lg:left-[220px] lg:top-14 lg:backdrop-blur-sm`                               |
| `widgets/TicketReserve/ui/PCDestinationModal.tsx` | `lg:left-[220px] lg:top-14 lg:backdrop-blur-sm`, `animate-fade-up` 추가       |
| `widgets/TicketReturn/ui/PCTicketReturnModal.tsx` | `lg:left-[220px] lg:top-14 lg:backdrop-blur-sm`, 배경 클릭 시 닫기 추가       |

#### 페이지 이동 시 모달 자동 비활성화

Zustand 스토어의 `isShow` 상태가 페이지 이동 후에도 유지되어 다른 페이지에서 모달이 재개방되는 문제를 수정.

- `app/hooks/useModalRouteReset.ts` 신규 생성 — `pathname` 변경 감지 시 Reserve·Return 모달 스토어 초기화
- `app/routes.tsx`에 `ModalRouteReset` 컴포넌트 추가 — `BrowserRouter` 내부에 전역 등록

#### 결제 모달 PC화 (`PayModal`)

- PC: 중앙 배치(`lg:justify-center`), fade-up 애니메이션, 제목+X버튼 헤더
- 모바일: 핸들바·바텀시트 유지

#### 반환 모달 기능 추가

- 배경 클릭 시 모달 비활성화
- 반환 완료 후 페이지 이탈 없이 반환 목록 페이지 유지 (`navigate(-1)` 제거)
- 빈 승차권 목록 대체 UI 추가 (PCTicketListPage 동일 구조)

---

### 개발 규칙 검증 및 수정

| 위반 파일                               | 위반 내용                | 수정                                     |
| --------------------------------------- | ------------------------ | ---------------------------------------- |
| `widgets/TicketReserve/ui/Modal.tsx`    | `@role/@rule` 주석 누락  | 추가                                     |
| `widgets/TicketReserve/ui/PayModal.tsx` | `ui/`에 상태·로직 인라인 | `hooks/usePayModal.ts`로 분리            |
| `app/routes.tsx` (ModalRouteReset)      | `useEffect` 로직 인라인  | `app/hooks/useModalRouteReset.ts`로 분리 |

---

### 수정 파일 목록

| 파일                                                    | 변경 내용                             |
| ------------------------------------------------------- | ------------------------------------- |
| `src/app/hooks/useModalRouteReset.ts`                   | 신규 — 라우트 변경 시 모달 초기화     |
| `src/app/routes.tsx`                                    | ModalRouteReset 컴포넌트 추가         |
| `src/widgets/TicketReserve/hooks/usePayModal.ts`        | 신규 — PayModal 로직 분리             |
| `src/widgets/TicketReserve/ui/PayModal.tsx`             | 로직 제거, PC화, @role/@rule 추가     |
| `src/widgets/TicketReserve/ui/Modal.tsx`                | 오버레이 위치 조정, @role/@rule 추가  |
| `src/widgets/TicketReserve/ui/ChoiceResultModal.tsx`    | blur, 시간 크기, 소제목 정렬          |
| `src/widgets/Season/ui/SeasonModal.tsx`                 | blur, 오버레이 위치                   |
| `src/widgets/TicketReserve/ui/PCDestinationModal.tsx`   | blur, 오버레이 위치, fade-up          |
| `src/widgets/TicketReturn/ui/PCTicketReturnModal.tsx`   | blur, 오버레이 위치, 배경 클릭 닫기   |
| `src/widgets/TicketReturn/ui/Modal.tsx`                 | 불필요한 useEffect 제거               |
| `src/features/TicketReturn/hooks/useTicketReturn.ts`    | navigate(-1) 제거                     |
| `src/pages/TicketReturn/hooks/usePCTicketReturnPage.ts` | isEmpty 추가, handleNavigateHome 분리 |
| `src/pages/TicketReturn/ui/PCTicketReturnPage.tsx`      | 빈 상태 UI 추가                       |

---

## 2026-06-23 — PC 승차권 반환 확인 모달 구현 및 FSD 위반 수정

### 작업 개요

PC 버전 반환하기 버튼 클릭 시 `/return` 페이지 이동 없이 모달을 직접 띄우도록 변경하고, 반환 확인 모달 UI를 새로 구현했다. 개발 규칙 검증 과정에서 `seatsReturnDataStore`의 레이어 위반을 발견해 `pages` → `features`로 이동했다.

---

### 구현 내용

#### PC 반환 확인 모달 (`PCTicketReturnModal`)

- `createPortal` + `fixed inset-0 z-[60] hidden lg:flex` — 전체 화면 오버레이, PC 전용
- `animate-fade-up` 등장 애니메이션
- 모달 내 구성
  - 대제목 "승차권 반환" + 우상단 X 닫기 버튼
  - 승차권 정보 카드: 열차종류/날짜 → 출발시간/역 + 불릿 선 연결(선 사이 소요시간) + 도착시간/역 → 실선 구분 → 인원수(중앙)
  - 빨간 배경 경고 카드: 느낌표 아이콘 + "반환 후에는 되돌릴 수 없어요."
  - 취소 / 반환하기(빨간색) 버튼

#### PC 클릭 플로우 변경

- 기존: 반환하기 → `/return` 페이지 이동
- 변경: 반환하기 → `setSeatsReturnData` + `openModal` → 모달 직접 노출
- `MiniTicket`에 `onReturnPC` prop 추가, PC 페이지에서 핸들러 주입

#### 새로고침 시 승차권 미표시 버그 수정

- `TicketReturnPage` 마운트 시 `clearAllSeatsCache()` + `prefetchAllSeats()` 추가 (`TicketListPage`와 동일 패턴)

---

### 개발 규칙 검증 및 수정

#### FSD 레이어 위반 수정

- **위반**: `widgets/TicketReturn/hooks/usePCTicketReturnModal.ts`가 `pages/TicketReturn/models/seatsReturnDataStore` 참조 (`widgets` → `pages` 금지)
- **수정**: `seatsReturnDataStore`를 `features/TicketReturn/model/`로 이동, 모든 참조 경로 일괄 수정

---

### 수정 파일 목록

| 파일                                                       | 변경 내용                                        |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `src/features/TicketReturn/model/seatsReturnDataStore.ts`  | 신규 생성 — pages에서 이동, @role/@rule 추가     |
| `src/features/TicketReturn/types/SeatsReturnDataStore.ts`  | 신규 생성 — pages에서 이동                       |
| `src/widgets/TicketReturn/hooks/usePCTicketReturnModal.ts` | 신규 생성 — 모달 데이터·핸들러, import 경로 수정 |
| `src/widgets/TicketReturn/ui/PCTicketReturnModal.tsx`      | 신규 생성 — PC 반환 확인 모달 UI                 |
| `src/widgets/TicketReturn/ui/Modal.tsx`                    | 모바일/PC 분기 추가, @role/@rule 추가            |
| `src/widgets/TicketReturn/hooks/useMiniTicket.ts`          | groups 반환 추가                                 |
| `src/widgets/TicketReturn/ui/MiniTicket.tsx`               | onReturnPC prop 추가, 클릭 분기 처리             |
| `src/widgets/TicketReturn/types/TicketReturnType.ts`       | MiniTicketProps 추가                             |
| `src/pages/TicketReturn/hooks/usePCTicketReturnPage.ts`    | 신규 생성 — handleReturnPC 핸들러                |
| `src/pages/TicketReturn/ui/PCTicketReturnPage.tsx`         | 훅 연결, onReturnPC 전달, Modal 렌더 추가        |
| `src/pages/TicketReturn/ui/TicketReturnPage.tsx`           | clearAllSeatsCache + prefetchAllSeats 추가       |
| `src/pages/TicketReturn/ui/SeatReturnPage.tsx`             | import 경로 수정                                 |
| `src/pages/TicketReturn/hooks/usePCTicketReturnPage.ts`    | import 경로 수정                                 |
| `src/features/TicketReturn/hooks/useTicketReturn.ts`       | import 경로 수정                                 |

---

## 2026-06-23 — PC 승차권 반환 페이지 UI 개선

### 작업 개요

PC 승차권 반환 페이지에 상단바·사이드바를 추가하고, 반환용 승차권 카드를 티켓 형식으로 전면 개선했다.

---

### 구현 내용

#### PC 승차권 반환 페이지 신규 구현 (`PCTicketReturnPage`)

- `PCTopNav` + `PCSidebar` 레이아웃 적용
- 파란 배경 제목 카드: "승차권 반환" 대제목 + "예매한 승차권을 확인하고 반환할 수 있어요" 소제목
- 카드 하단으로 티켓 목록 나열

#### 반환용 승차권 티켓 UI 개선 (`MiniTicket`)

- 기존 단순 카드 → 티켓 형식으로 전면 개편
- **1/3 구간 (메타 정보)**
  - 열차종류 + 예약완료 배지 수평 정렬 (동일 `bg-lightBlue text-blue` 스타일)
  - 날짜 (`text-gray-400`)
  - 인원 수 (어른/어린이)
- **1/3 ~ 3/4 구분선**: 점선 컷아웃 구분선 (위아래 반원 파임)
- **3/4 구간 (여정)**
  - 출발·도착 시간 대제목(`text-2xl font-bold`), 역명 소제목(`text-base`)
  - 불릿(파란색) + 점선 연한 회색 연결 + 중간 기차 SVG 아이콘(연한 회색) + 소요시간
- **점선 구분 (컷아웃)**: 메인 영역과 스텁 구분
- **오른쪽 스텁**: JARINARE(`text-gray-300`) + 반환하기 버튼, 중앙 정렬

#### FSD 규칙 준수

- 기존 `MiniTicket.tsx`에 인라인으로 있던 `calcDuration`, `trainTypeName` 계산, `navigate` 등 로직 전체를 `hooks/useMiniTicket.ts`로 분리

#### PC/모바일 분기

- `TicketReturnPage.tsx`에 `lg:block / lg:hidden` 분기 추가 (`TicketListPage`와 동일 패턴)

---

### 개발 규칙 검증 결과

이상 없음 — 위반 사항 없음

---

### 수정 파일 목록

| 파일                                               | 변경 내용                                    |
| -------------------------------------------------- | -------------------------------------------- |
| `src/widgets/TicketReturn/hooks/useMiniTicket.ts`  | 신규 생성 — MiniTicket 파생 데이터·핸들러    |
| `src/widgets/TicketReturn/ui/MiniTicket.tsx`       | 티켓 UI 전면 개선, 로직 훅으로 분리          |
| `src/pages/TicketReturn/ui/PCTicketReturnPage.tsx` | 신규 생성 — PC 반환 페이지                   |
| `src/pages/TicketReturn/ui/TicketReturnPage.tsx`   | PC/모바일 분기 추가, `@role/@rule` 주석 추가 |

---

## 2026-06-22 — PC 추천여행지 모달 열차 선택 UX 개선

### 작업 개요

열차 선택 전 인원을 별도 섹션에서 먼저 입력해야 했던 흐름을 제거하고, 열차 카드를 클릭했을 때 해당 카드 내부에 인원 선택 UI가 인라인으로 펼쳐지는 방식으로 변경했다.

---

### 구현 내용

#### 열차 카드 인라인 인원 선택

- 기존: 모달 상단 고정 인원 섹션 → 열차 선택 시 즉시 이동
- 변경: 열차 카드 클릭 → 카드 하단 인원 선택 패널 펼침 → 확정 버튼으로 이동
- `pendingTrain` 토글 방식 — 한 번에 하나의 카드만 펼쳐지도록 제어
- 확정 버튼: 인원 0명이면 비활성화(`bg-gray-300`), 1명 이상이면 활성화(`bg-blue`)

#### FSD 규칙 위반 수정

- `CountAdultButton` / `CountKidButton` — `ui/`에서 `trainDataStore` 직접 참조 제거
- `useCountAdultButton.ts` / `useCountKidButton.ts` 신규 생성 후 상태·이벤트 위임

---

### 수정 파일 목록

| 파일                                                          | 변경 내용                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| `src/widgets/TicketReserve/hooks/useCountAdultButton.ts`      | 신규 생성 — CountAdultButton 상태·이벤트                              |
| `src/widgets/TicketReserve/hooks/useCountKidButton.ts`        | 신규 생성 — CountKidButton 상태·이벤트                                |
| `src/widgets/TicketReserve/hooks/usePCDestinationModal.ts`    | pendingTrain 상태 추가, handleTrainClick/handleConfirmPassengers 분리 |
| `src/widgets/TicketReserve/ui/CountAdultButton.tsx`           | trainDataStore 제거 → useCountAdultButton 위임, 버튼 스타일 변경      |
| `src/widgets/TicketReserve/ui/CountKidButton.tsx`             | trainDataStore 제거 → useCountKidButton 위임, 버튼 스타일 변경        |
| `src/widgets/TicketReserve/ui/PCDestinationModal.tsx`         | 상단 인원 섹션 제거, 열차 카드 내 인라인 인원 선택 패널 추가          |
| `src/widgets/TicketReserve/types/RecommendDestinationType.ts` | PCDestinationModalProps 추가                                          |

---

## 2026-06-22 — 홈 이벤트 모달 PC 구조 개선 및 개발 규칙 검증

### 작업 개요

홈/게시판 이벤트 배너 모달(`SeasonModal`)을 PC 환경에서 열차선택 모달과 동일한 구조로 개선하고, 개발 규칙 검증 후 위반 사항을 수정했다.

---

### 구현 내용

- `fixed inset-0 z-[60]` 적용 — 상단바(`z-50`) 포함 전체 화면 오버레이
- PC 고정 너비 `lg:w-[400px] lg:mx-0` — 화면 중앙 배치
- `lg:animate-fade-up` 추가 — PC 모달 등장 애니메이션

---

### 개발 규칙 검증 및 수정

#### 1. 인라인 타입 정의

- **위반**: `{ onClose: () => void }` 타입이 ui/에 인라인 정의
- **수정**: `types/SeasonModalType.ts` 신규 생성 후 `SeasonModalProps` import

#### 2. `ui/`에서 훅 직접 호출

- **위반**: `useCurrentSeason()` 를 ui/에서 직접 호출
- **수정**: `hooks/useSeasonModal.ts` 신규 생성 후 위임

---

### 수정 파일 목록

| 파일                                          | 변경 내용                                             |
| --------------------------------------------- | ----------------------------------------------------- |
| `src/widgets/Season/ui/SeasonModal.tsx`       | fixed 포지셔닝, z-[60], PC 너비·애니메이션, 로직 제거 |
| `src/widgets/Season/hooks/useSeasonModal.ts`  | 신규 생성 — useCurrentSeason 위임                     |
| `src/widgets/Season/types/SeasonModalType.ts` | 신규 생성 — SeasonModalProps                          |

---

## 2026-06-22 — PC 열차 선택 모달 UI 개선 및 개발 규칙 검증

### 작업 개요

PC 열차 선택 모달(`ChoiceResultModal`) UI를 개선하고, `ReserveTicket` 컴포넌트 로직을 분리했다.
개발 규칙 검증 후 위반 사항을 수정했다.

---

### 구현 내용

#### PC 열차 선택 모달 UI 개선 (`ChoiceResultModal`)

- 모달 활성화 시 화면 중앙 배치 (`lg:justify-center`)
- 비활성화 배경 전체 화면 적용 — `Modal.tsx` 컨테이너에 `z-[60]` 추가 (`PCTopNav z-50` 위로 오버레이)
- 모달 등장 애니메이션: 바텀시트(`animate-slide-up`) → PC는 중앙 페이드인(`animate-fade-up 0.2s`)
- X 버튼 추가 (PC 헤더 우측)
- 내부 순서 재정렬: 시간 → 열차/요금 → 인원 → 취소/좌석조회
- 소제목 한국어 유지 (시간/열차/요금/인원), 텍스트 크기 일관성 통일

#### 홈 승차권 위젯 (`ReserveTicket`)

- 기존 디자인 유지 (사용자 롤백으로 원복)

---

### 개발 규칙 검증 및 수정

#### 1. `ChoiceResultModal.tsx` — `ui/`에 로직 포함

- **위반**: `calcDuration` 함수, `durationText` 계산, `trainDataStore`·`useModalStore`·`useNavigation` 직접 접근, `@role/@rule` 주석 없음
- **수정**: `hooks/useChoiceResultModal.ts` 신규 생성 후 로직 이동, 주석 추가

#### 2. `ReserveTicket.tsx` — `ui/`에 로직 포함

- **위반**: `calcDuration` 함수, `trainTypeName`·`startLabel`·`endLabel` 파생 계산, `handleDetail` 이벤트 핸들러, store 직접 접근, `@role/@rule` 주석 없음
- **수정**: `hooks/useReserveTicket.ts` 신규 생성 후 로직 이동, 주석 추가

---

### 수정 파일 목록

| 파일                                                      | 변경 내용                                       |
| --------------------------------------------------------- | ----------------------------------------------- |
| `src/widgets/TicketReserve/ui/ChoiceResultModal.tsx`      | PC UI 개선, 로직 제거, `@role/@rule` 추가       |
| `src/widgets/TicketReserve/hooks/useChoiceResultModal.ts` | 신규 생성 — ChoiceResultModal 상태·로직         |
| `src/widgets/TicketReserve/ui/ReserveTicket.tsx`          | 로직 제거, `@role/@rule` 추가                   |
| `src/widgets/TicketReserve/hooks/useReserveTicket.ts`     | 신규 생성 — ReserveTicket 파생 데이터·핸들러    |
| `src/widgets/TicketReserve/ui/Modal.tsx`                  | `z-[60]` 추가 — 상단바 위 오버레이              |
| `tailwind.config.js`                                      | `fade-up` 애니메이션 속도 0.4s→0.2s, delay 제거 |

---

## 2026-06-22 — PC 좌석 선택 페이지 구현 및 개발 규칙 검증

### 작업 개요

PC 버전 좌석 선택 페이지(`PCSeatCheckPage`)를 신규 구현했다.
FSD 세그먼트 분리(ui/hooks/types)를 준수하고, 개발 규칙 검증 후 위반 사항을 수정했다.

---

### 구현 내용

#### PC 좌석 선택 페이지 신규 구현

**제목칸 (카드 외부)**

- 뒤로가기 화살표 + 좌석 선택 텍스트
- `TRAIN SELECTION` 소제목
- 열차 종류 대제목 (`selectTrainType`)
- 출발역 → 도착역 소제목
- 호차 선택 드롭다운 (제목과 수평 배치, 우측 끝)
  - 모달 대신 인라인 드롭다운 — 외부 클릭 시 닫힘
  - 호차별 잔여 석수 + 혼잡도 뱃지(여유/보통/혼잡)

**좌석 선택 카드**

- 타이틀 칸: 불릿 범례 (선택됨/이용불가/이용가능), 배경 `bg-gray-50/50`
- 좌석 선택칸: A/B/C/D 열 헤더 + 행 번호, 각 좌석 내부에 번호(`A1` 등) 표시

**하단 고정 예매 카드 (`fixed bottom-6`)**

- SELECTION 칸 (1) / SELECTED SEATS 칸 (10) — 1:10 비율 배치
- SELECTED SEATS: 선택 수만큼 둥근 네모 도형으로 시각화
- 자동선택 버튼 (반전 스타일: `border-blue bg-white text-blue`) / 예매 버튼
- 카드 중앙 정렬: 사이드바(`220px`) 기준 메인 영역 중앙 (`left: calc(110px + 50vw)`)

---

### 개발 규칙 검증 및 수정

#### 1. `ui/`에 로직 포함

- **위반**: `trainNoSeatsCount` 계산, `useResetSeatsState()` 호출이 ui/에 있음
- **수정**: `usePCSeatCheckPage.ts`로 이동

#### 2. 상수가 `hooks/`에 정의

- **위반**: `TOTAL_SEATS = 24` 가 hooks 파일에 정의됨
- **수정**: `SEATS_PER_CAR`로 명명해 `constants/PCTrainCheckConstants.ts`에 추가 후 import

#### 3. 타입이 `ui/`에 인라인 정의

- **위반**: `PCSeatProps`가 `PCSeat.tsx`에 인라인 정의
- **수정**: `widgets/TicketReserve/types/ReserveType.ts`에 추가 후 import

---

### 수정 파일 목록

| 파일                                                         | 변경 내용                                  |
| ------------------------------------------------------------ | ------------------------------------------ |
| `src/pages/TicketReserve/ui/PCSeatCheckPage.tsx`             | 신규 생성 — PC 좌석 선택 페이지            |
| `src/pages/TicketReserve/hooks/usePCSeatCheckPage.ts`        | 신규 생성 — PC 좌석 선택 훅                |
| `src/widgets/TicketReserve/ui/PCSeat.tsx`                    | 신규 생성 — PC 좌석 컴포넌트 (번호 표시)   |
| `src/widgets/TicketReserve/types/ReserveType.ts`             | `PCSeatProps` 추가                         |
| `src/pages/TicketReserve/constants/PCTrainCheckConstants.ts` | `SEATS_PER_CAR` 추가                       |
| `src/pages/TicketReserve/ui/SeatCheckPage.tsx`               | `lg:block / lg:hidden` PC/모바일 분기 추가 |

---

## 2026-06-21 — PC 열차조회 페이지 추가 수정

### 작업 개요

PC 열차조회 페이지 구현 이후 추가 UI 수정, 버그 수정, PC 스켈레톤 추가를 진행했다.

---

### 구현 내용

#### PC 스켈레톤 추가

- `PCSkeletonScreen.tsx` 신규 생성 — PC 열차 카드 구조(시간 구간/점선 구분선/요금 구간)를 반영한 5개짜리 pulse 스켈레톤
- 기존 모바일용 `SkeletonScreen` 대신 `PCTrainCheckPage`에 적용

#### 버그 수정

##### 홈에서 선택한 날짜가 열차조회 페이지에 반영되지 않는 문제

- **원인**: `selectedDate` 초기값이 항상 `today`로 고정되어, `trainDataStore.startDay`(홈에서 선택한 날짜)를 무시함
- **수정**: `startDay`("20260624" 형식)를 파싱해 `selectedDate` 초기값으로 사용

#### UI 수정

- 잔여 좌석 수 표시 (`useAllSeatsInfo` 캐시 연동)
- 불릿 파란색, 연한 파란 실선으로 변경 (불릿·선 사이 gap 제거)
- 출발·도착역명 시간 아래 중앙정렬로 추가
- 요금 텍스트 크기 확대 (`text-xl`), `Number().toLocaleString` 쉼표 포맷
- 시간/요금 구분선 점선 + 티켓 컷아웃 효과 (위아래 반원 파임)
- 기차 종류·시간대 드롭다운 소제목 버튼 바깥으로 분리
- 선택 버튼 가로 확장 (`w-full`)
- 카드 배경 흰색 고정
- 열차 선택 소제목 제거

---

### 수정 파일 목록

| 파일                                                   | 변경 내용                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `src/widgets/layouts/ui/PCSkeletonScreen.tsx`          | 신규 생성 — PC 열차 카드 스켈레톤                                 |
| `src/pages/TicketReserve/hooks/usePCTrainCheckPage.ts` | selectedDate 초기값을 startDay 기준으로 수정, 잔여 좌석 계산 추가 |
| `src/pages/TicketReserve/ui/PCTrainCheckPage.tsx`      | UI 개선 전반                                                      |

---

## 2026-06-21 — PC 열차조회 페이지 구현 및 개발 규칙 검증

### 작업 개요

PC 버전 열차조회 페이지(`PCTrainCheckPage`)를 신규 구현했다.
FSD 세그먼트 분리(ui/hooks/constants/types)를 준수하고, 구현 후 개발 규칙 검증을 통해 위반 사항을 수정했다.

---

### 구현 내용

#### PC 열차조회 페이지 신규 구현

- `PCTopNav` + `PCSidebar` 레이아웃 적용
- 오늘 기준 7일 캘린더 날짜 선택 UI
- 기차 종류 / 시간대 드롭다운 필터 (소제목 분리)
- 열차 목록 카드
  - 출발·도착 시간 + 역명 중앙정렬
  - 소요시간 + 불릿(파란색)·연한 파란 실선 연결
  - 티켓 컷아웃 효과: 구분선(점선) 위아래에 반원형 파인 부분
  - 잔여 좌석 수 표시 (`useAllSeatsInfo` 캐시 연동, TOTAL_SEATS 96석 기준)
  - 요금 텍스트 크기 확대 + 쉼표 포맷 (`Number.toLocaleString`)
  - 선택 버튼 가로 확장
  - 매진 시 회색 처리

#### TrainCheckPage 분기 처리

- `lg:block` / `lg:hidden`으로 PC/모바일 분기

---

### 개발 규칙 검증 및 수정

#### 1. 상수가 `ui/`·`hooks/`에 정의됨

- **위반**: `DAYS_KO`, `TRAIN_OPTIONS`, `TIME_OPTIONS`, `TOTAL_SEATS`가 ui/hooks에 인라인 정의
- **수정**: `constants/PCTrainCheckConstants.ts` 신규 생성 후 이동

#### 2. 타입이 `hooks/`에 인라인 정의됨

- **위반**: `DropdownType`이 hooks 파일에 export type으로 정의
- **수정**: `types/PCTrainCheckTypes.ts` 신규 생성 후 이동

#### 3. 순수 함수가 `ui/`에 정의됨

- **위반**: `isSameDay`, `getCardStyle`이 ui 파일에 정의
- **수정**: 훅 내부 private 함수로 이동, 연산 결과를 반환 데이터에 포함
  - `weekDays` → `weekDaysWithSelection` (`isSelected`, `dow` 포함)
  - `trains` 각 항목에 `cardStyle` 추가

#### 4. 미사용 반환값

- **위반**: `startDayForView`를 훅에서 반환하지만 UI에서 미사용
- **수정**: destructuring 및 return에서 제거

---

### 수정 파일 목록

| 파일                                                         | 변경 내용                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `src/pages/TicketReserve/ui/PCTrainCheckPage.tsx`            | 신규 생성 — PC 열차조회 UI                                    |
| `src/pages/TicketReserve/hooks/usePCTrainCheckPage.ts`       | 신규 생성 — PC 열차조회 훅                                    |
| `src/pages/TicketReserve/constants/PCTrainCheckConstants.ts` | 신규 생성 — DAYS_KO, TRAIN_OPTIONS, TIME_OPTIONS, TOTAL_SEATS |
| `src/pages/TicketReserve/types/PCTrainCheckTypes.ts`         | 신규 생성 — DropdownType                                      |
| `src/pages/TicketReserve/ui/TrainCheckPage.tsx`              | PCTrainCheckPage 분기 추가                                    |

---

## 2026-06-20 — 개발 규칙 검증 및 FSD 위반 수정

### 작업 개요

이번 세션에서 수정한 파일들을 CLAUDE.md 개발 규칙 기준으로 검증하고 위반 사항을 수정했다.

---

### 발견 및 수정된 위반 사항

#### 1. `ui/` 세그먼트에 로직 인라인 작성

- **위반**: `MiniTicket.tsx`에 `calcDuration`, `WEEK_DAYS`, `trainTypeName` 계산 등 로직이 직접 포함됨
- **수정**: 모든 파생 데이터 계산을 `hooks/useMiniTicket.ts`로 분리

#### 2. `@role`/`@rule` 주석 누락

- **위반**: `MiniTicket.tsx`, 내부 컴포넌트 `QRCodePlaceholder`, `ArrowIcon`에 주석 없음
- **수정**: `MiniTicket.tsx`, `useMiniTicket.ts`에 주석 추가, 내부 컴포넌트에 `// @role` 주석 추가

#### 3. 상수가 `hooks/` 세그먼트에 정의됨

- **위반**: `WEEK_DAYS` 상수가 `useMiniTicket.ts` 내에 정의됨
- **수정**: `constants/miniTicketConstants.ts` 신규 생성 후 import

#### 4. `MiniTicketVariantProps` 인라인 정의

- **위반**: `variant?: 'pc'` 타입이 ui 파일에 인라인 `interface`로 정의됨
- **수정**: `types/MiniTicketType.ts`에 `MiniTicketVariantProps` 추가, ui에서 import

#### 5. 고아 타입 제거

- **발견**: `widgets/TicketList/types/MiniTicketType.ts`의 `MiniTicketProps`가 실제로는 `shared/types/MiniTicketType.ts`의 중복 복사본으로 어디서도 사용되지 않음
- **수정**: 고아 타입 삭제, `MiniTicketVariantProps`만 유지

---

### 수정 파일 목록

| 파일                                                      | 변경 내용                                     |
| --------------------------------------------------------- | --------------------------------------------- |
| `src/widgets/TicketList/hooks/useMiniTicket.ts`           | 신규 생성 — MiniTicket 파생 데이터 계산 로직  |
| `src/widgets/TicketList/constants/miniTicketConstants.ts` | 신규 생성 — `WEEK_DAYS` 상수                  |
| `src/widgets/TicketList/ui/MiniTicket.tsx`                | 로직 제거, 주석 추가, types import            |
| `src/widgets/TicketList/types/MiniTicketType.ts`          | 고아 타입 제거, `MiniTicketVariantProps` 추가 |

---

## 2026-06-20 — 내 승차권 UI 개선 (MiniTicket 리디자인)

### 작업 개요

모바일 및 PC 버전 내 승차권 카드(`MiniTicket.tsx`) UI를 전면 개선했다.
소제목 체계 도입, 아이콘 교체, 시간 포맷 변경, QR 섹션 리디자인, 빈 상태 UI 추가 등을 포함한다.

---

### 구현 내용

#### 소제목(Label) 체계 도입

- 모든 데이터 필드 위에 영문 대문자 소제목 추가
  - 열차 종류: `TRAIN` (연한 파란색 뱃지 `bg-lightBlue text-blue`)
  - 날짜: `DATE`
  - 출발역: `출발역` (한글 유지)
  - 도착역: `도착역` (한글 유지)
  - 하단 출발/도착 시간: `DEPARTURE` / `ARRIVAL`
  - 좌석 번호: `SEAT`
  - QR 상단: `BOARDING PASS`
  - QR 하단: `TICKET NO.`

#### 날짜 포맷 변경

- 기존 `6월 20일 (금)` → 두 줄 표시
  - 첫째 줄: `2026.06.20` (`startTime`에서 파싱)
  - 둘째 줄: `6월 20일(금)` (괄호 앞 공백 제거)

#### 아이콘 교체

- 🚄 이모지 → 수평바 + 오른쪽 화살표 SVG (`——→`)
- 점선 길이: `flex-1` → `w-4`(PC) / `w-3`(모바일) 로 단축

#### 시간 포맷 변경

- `오전/오후 HH:MM` → `HH:MM` 24시간제 (`formatTimeView` 직접 사용)
- 역 이름 아래: `오전`/`오후` + 시간 한 줄 연결 (예: `오후 14:30`)
- 하단 푸터: `DEPARTURE` / `ARRIVAL` 각각 분리 표시, 간격 `gap-16`(PC) / `gap-10`(모바일)

#### 상세보기 버튼 제거 → 좌석 번호 텍스트로 대체

- `상세보기` 버튼 삭제
- `SEAT` 소제목 + 좌석 번호 파란색 텍스트로 표시 (예: `A1, B2`)

#### 소요시간 → DIRECT 텍스트로 변경

- 화살표 아래 소요시간(`2시간 30분`) → `DIRECT` 텍스트

#### QR 섹션 리디자인 (PC 전용)

- QR 배경: `bg-gray-50` → `bg-white`
- 구조: `BOARDING PASS` 소제목 → 카드(`shadow-md`) → 내부 점선 테두리(`border-dashed`) → QR (크기 `h-14 w-14`)
- 카드 외부 패딩 `p-2`, 내부 점선 패딩 `p-8` (점선이 카드 모서리와 근접)
- `TICKET NO.`: `JR-{연도2자리}{출발시간4자리}-{좌석번호}` 형식 (예: `JR-261430-A1`), 모노스페이스 폰트
- 하단: `탑승전 QR코드를 준비해주세요.` 안내 문구

#### 텍스트 크기 전체 확대

- 모바일: 역 이름 `text-xl` → `text-2xl`, 시간/날짜 `text-xs` → `text-sm`
- PC: 역 이름 `text-4xl` → `text-5xl`, 시간/날짜 `text-sm` → `text-base`

#### 빈 상태 UI 추가

- 모바일: 승차권 목록 하단에 기존 🗒️ 빈 상태 UI 항상 표시
- PC: 승차권 목록 하단에 가방 아이콘 없는 축소형 빈 상태 UI 추가 (`PCTicketListPage.tsx`)
  - 아이콘 제거, 높이 최소화, "승차권 예매하기" 버튼 유지

---

### 수정 파일 목록

| 파일                                           | 변경 내용                                             |
| ---------------------------------------------- | ----------------------------------------------------- |
| `src/widgets/TicketList/ui/MiniTicket.tsx`     | 전면 리디자인 — 소제목, 시간 포맷, 아이콘, QR 섹션 등 |
| `src/pages/TicketList/ui/PCTicketListPage.tsx` | 티켓 하단 축소형 빈 상태 UI 추가                      |

---

## 2026-06-19 — 추천여행지 PC 예매 플로우 구축 및 버그 수정

### 작업 개요

PC 버전 추천여행지 모달에서 직접 기차 예매까지 이어지는 플로우를 구축하고,
발생한 버그들을 순차적으로 수정했다.

---

### 구현 내용

#### 추천여행지 모달 재설계 (`PCDestinationModal.tsx`, `usePCDestinationModal.ts`)

- 출발지 선택 방식을 칩 버튼 → 검색 입력 + 자동완성 드롭다운으로 변경
- Leg 기반 구간 조회: 서울→대전→동대구→구포→부산 식으로 경로를 분할해 각 구간별 기차 시간 표시
- `useQueries`로 구간별 병렬 API 호출
- 체이닝 로직: 이전 구간 도착 시간(`arrplandtime`) 이후의 열차만 다음 구간에 표시
- 인원 선택 UI 추가 (`CountAdultButton`, `CountKidButton`)
- 출발역 없을 때 / 인원 0명일 때 안내 메시지 표시

#### PC 게시판 레이아웃 (`PCBoardPage.tsx`)

- 메인 콘텐츠 영역 `px-64` → `px-16` 으로 넓힘

#### 역 ID 조회 방식 변경 (`PCDestinationConstants.ts`)

- 하드코딩된 `KNOWN_STATION_IDS` 제거
- `fetchAllStations` API 캐시 기반으로만 역 ID 조회 (`stations.find()`)

---

### 버그 수정

#### 1. Firebase 경로 오염 (`no/161/seats/A1`)

- **원인**: `setTrainNo(String(train.trainno))`로 API 열차 고유번호를 호차 번호에 저장
- **수정**: `setTrainNo('1')` 고정

#### 2. 좌석 클릭 불가 (추천여행지 진입 시)

- **원인**: `trainNo = ''` → lock 리스너 `if (!trainNo) return` 조기 종료 → `isLocksLoaded = false` → `onClick = null`
- **수정**: `setTrainNo('1')` 고정

#### 3. 구간 전환 시 이전 좌석 페이지 잔류

- **원인**: `docIds` 변경 시 `seatsInfo` 미초기화
- **수정**: `useSeatQueryData.ts`에 `useEffect(() => { setSeatsInfo([]); }, [docIds])` 추가

#### 4. 예매 후 홈/내 승차권에 티켓 미반영

- **원인**: `useAllSeatsInfo`가 캐시 존재 시 listener 등록 생략
- **수정**: 캐시 유무 무관하게 항상 listener 등록

#### 5. 추천여행지 예매 시 `id`만 Firebase 저장 — stale closure

- **원인**: `createSelectedSeats`가 렌더 시점 클로저 값 사용 → 상태 업데이트 전 값 읽음
- **수정**: `trainDataStore.getState()` / `seatsStateStore.getState()` 로 실행 시점 직접 읽기

#### 6. 추천여행지 예매 시 `id`만 Firebase 저장 — seatsStateCount 잔류

- **원인**: 예매 완료 후 언마운트 타이밍에 `useEffect([seatsState])`가 실행 안 됨 → `seatsStateCount = 1` 잔류 → 다음 SeatCheckPage 첫 렌더에서 좌석 미선택 상태로 `isAllSelected = true` → `filtered = []` → `Promise.all([])` 즉시 완료 → `{id}` 만 저장
- **수정**:
  - 예매 완료 시 `setSeatsStateCount(0)` 명시적 호출
  - `filtered.length === 0` 이면 저장 차단 가드 추가
  - `useResetSeatsState`에서도 `setSeatsStateCount(0)` 동기 리셋

---

### 수정 파일 목록

| 파일                                                            | 변경 내용                                                                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `src/widgets/TicketReserve/ui/PCDestinationModal.tsx`           | 검색 입력, 인원 선택, 구간별 열차 UI                                                                                       |
| `src/widgets/TicketReserve/hooks/usePCDestinationModal.ts`      | leg 기반 useQueries, 체이닝, 검색 자동완성                                                                                 |
| `src/widgets/TicketReserve/constants/PCDestinationConstants.ts` | KNOWN_STATION_IDS 제거                                                                                                     |
| `src/features/TicketReserve/hooks/useSeatQueryData.ts`          | getState() 사용, filtered 가드, seatsStateCount 리셋, docIds 변경 시 seatsInfo 초기화, clearAllSeatsCache/prefetchAllSeats |
| `src/features/TicketReserve/hooks/useAllSeatsInfo.ts`           | 항상 listener 등록                                                                                                         |
| `src/features/TicketReserve/hooks/useResetSeatsState.ts`        | seatsStateCount 동기 리셋 추가                                                                                             |
| `src/pages/TicketList/ui/TicketListPage.tsx`                    | clearAllSeatsCache + prefetchAllSeats on mount                                                                             |
| `src/pages/Board/ui/PCBoardPage.tsx`                            | px-64 → px-16                                                                                                              |

---

### 현재 상태

- 추천여행지 → 구간 선택 → 좌석 선택 → 예매 플로우 정상 동작 확인
- 기존 예매방식과 추천여행지 예매방식 Firebase 저장 구조 동일
- 미완료 사항: 없음 (현재 기준 알려진 버그 없음)

---

## 2026-11-04 — 감사 로그 스케줄러 연결 및 누락 테스트 보완

### 작업 개요

3번 작업(감사 로그 인프라 구축)에서 누락된 연결 코드와 테스트를 보완했다. 수동 스케줄러 실행 시 `triggeredBy`/`params`가 실제로 저장되도록 컨트롤러를 수정하고, `admin_audit_logs`에도 기록되도록 `AuditService`를 연결했다.

---

### 백엔드

**스케줄러 수동 실행 → `triggeredBy`/`params` 실제 저장**

- `train-time-sync.service.ts` — `enqueueRange(dto, triggeredBy?)` 파라미터 추가, `enqueue()` 호출 시 `triggeredBy`와 `params: dto` 전달
- `admin-trains.controller.ts` — `@CurrentUser()`로 어드민 idx를 받아 `BigInt(user.idx)` 전달
- 수정 전: 컬럼은 있었지만 항상 `null` / 수정 후: 수동 실행 시 어드민 idx와 요청 dto 저장

**감사 로그 연결 (`admin_audit_logs`)**

- `admin-trains.controller.ts` — 수동 실행 후 `audit.log({ actorIdx, action: "scheduler.run", targetType: "scheduler", targetId: "train-time-sync", after: { runId, ...dto }, ip })` 호출
- `trains.module.ts` — `AuditModule` import 추가
- Winston `audit-*.log` + `admin_audit_logs` DB 양쪽에 동시 기록 확인

**수동 실행 시 전체 흐름**

```
POST /api/admin/trains/times/sync
  → enqueueRange(dto, adminIdx)
      → scheduler_run_log: triggeredBy=adminIdx, params=dto
  → audit.log(...)
      → audit-YYYYMMDD.log (Winston 파일)
      → admin_audit_logs (DB, fire-and-forget)
```

**누락 테스트 파일 추가**

- `audit/audit.service.spec.ts` — 이전 커밋에서 파일 누락. `log()` / `list()` / `get()` / `pruneOldLogs()` 12개 테스트
- `scheduler/scheduler-run-log.service.spec.ts` — 신규. `triggeredBy` 필터·직렬화, `params` 반환, `NotFoundException`, `summary()` 8개 테스트
- `scheduler/job-queue.service.spec.ts` — `Row` 인터페이스에 `triggeredBy`/`params` 추가, `enqueue()` 시 두 필드 DB 저장 테스트 1개 추가

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/trains/train-time-sync.service.ts` | `enqueueRange()` `triggeredBy` 파라미터 추가 |
| `src/trains/admin-trains.controller.ts` | `@CurrentUser()` 추가, `audit.log()` 호출 |
| `src/trains/trains.module.ts` | `AuditModule` import 추가 |
| `src/audit/audit.service.spec.ts` | 신규 — 12개 테스트 |
| `src/scheduler/scheduler-run-log.service.spec.ts` | 신규 — 8개 테스트 |
| `src/scheduler/job-queue.service.spec.ts` | `triggeredBy`/`params` 테스트 추가 |

---

### 현재 상태

- 수동 스케줄러 실행 시 `triggeredBy`/`params` 정상 저장 확인
- `admin_audit_logs` 및 `audit-*.log` 파일 양쪽 기록 확인
- 미완료: 나머지 어드민 기능(할인율·포인트·정지·권한 변경 등)은 해당 기능 구현 시 `audit.log()` 연결 예정

---

## 2026-11-04 — 감사 로그 나머지 엔드포인트 연결 · 테스트 추가 · 주석 복구

### 작업 개요

stations/sync · scheduler/cancel · notification/partition 3곳에 `AuditService.log()` 연결을 완료하고, 누락된 테스트와 지워진 주석을 복구했다.

---

### 백엔드

**나머지 어드민 엔드포인트 감사 로그 연결**

| 엔드포인트 | action |
|-----------|--------|
| `POST /admin/stations/sync` | `scheduler.station_sync` |
| `POST /admin/scheduler/runs/:runId/cancel` | `scheduler.cancel` |
| `DELETE /admin/notification/partition` | `notification.partition_drop` |
| `POST /admin/notification/partition/drop-old` | `notification.partition_drop` |

- `AdminStationsController` — `@CurrentUser()` + `audit.log()` 추가, `StationsModule`에 `AuditModule` import
- `AdminSchedulerController` — cancel 시 `audit.log()` 추가, `SchedulerModule`에 `AuditModule` import
- `NotificationAdminController` — 두 파티션 엔드포인트에 `audit.log()` 추가, `NotificationModule`에 `AuditModule` import

**테스트 추가**

- `audit.service.spec.ts` — `list()` 필터 조건 3개 추가 (`targetType`, `targetId`, `action`)
- `role-permissions.service.spec.ts` — 신규 파일 8개 (캐시 TTL 히트, TTL 만료 재조회, `invalidate()` 무효화, `hasPermission()`)

**주석 복구**

- `prisma/schema.prisma` — `SchedulerRunLog` 기존 필드 9개 설명 주석 복구 (감사 로그 커밋 때 누락)
- `winston.config.ts` — `backend-*.log` transport `zippedArchive`/`maxFiles` 설명 주석 4줄 복구

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/stations/admin-stations.controller.ts` | `audit.log()` 연결 |
| `src/stations/stations.module.ts` | `AuditModule` import |
| `src/scheduler/admin-scheduler.controller.ts` | cancel `audit.log()` 연결 |
| `src/scheduler/scheduler.module.ts` | `AuditModule` import |
| `src/notification/notification-admin.controller.ts` | 파티션 2곳 `audit.log()` 연결 |
| `src/notification/notification.module.ts` | `AuditModule` import |
| `src/audit/audit.service.spec.ts` | list 필터 테스트 3개 추가 |
| `src/role-permissions/role-permissions.service.spec.ts` | 신규 — 8개 테스트 |
| `prisma/schema.prisma` | SchedulerRunLog 필드 주석 복구 |
| `src/common/logger/winston.config.ts` | 보관 기간 주석 복구 |

---

### 현재 상태

- 어드민 엔드포인트 4곳 모두 `audit.log()` 연결 완료
- `admin_audit_logs` + `audit-*.log` 양쪽 기록 확인
- 미완료: 나머지 어드민 기능(할인율·포인트·정지·권한 변경 등)은 해당 기능 구현 시 `audit.log()` 연결 예정

---

## 2026-11-04 — trust proxy 설정 · BigInt 직렬화 · action 이름 통일

### 작업 개요

감사 로그 품질 개선 3건을 처리했다. 실제 접속자 IP 기록, BigInt 포함 Prisma 행 전달 시 500 방지, action 이름 통일.

---

### 백엔드

**trust proxy 설정 (`main.ts`)**

- `app.set("trust proxy", ...)` 추가 — 프록시(ngrok, Vercel) 뒤에서 `X-Forwarded-For` 헤더로 실제 접속자 IP를 읽도록 설정
- 환경변수 `TRUST_PROXY`로 단계 수 조정 가능 (기본값 `1`)
- `true`로 열면 헤더 위조 가능하므로 숫자로 지정

**AuditService BigInt 직렬화 (`audit/audit.service.ts`)**

- `bigIntReplacer` 추가 — `JSON.stringify` 시 BigInt를 문자열로 변환 (`42n` → `"42"`)
- `toJsonValue` 추가 — DB 저장 전 before/after도 동일하게 직렬화
- `log()` 전체를 `try/catch`로 감싸 직렬화 실패 등 어떤 예외도 호출부로 나가지 않음
- 수정 전: `before: user`처럼 Prisma 행 넘기면 500 에러 + 로그 미기록 → 수정 후: BigInt 자동 변환 후 정상 기록

**action 이름 통일 (`admin-trains.controller.ts`)**

- `scheduler.run` → `scheduler.train_time_sync` 로 변경

**테스트 추가 (`audit.service.spec.ts`)**

- `before에 BigInt가 포함돼도 예외를 던지지 않는다` — DB create 호출 확인
- `before의 BigInt가 문자열로 직렬화돼 Winston에 기록된다` — `"idx":"42"` 확인

---

### 수정 파일 목록

| 파일 | 변경 내용 |
|------|----------|
| `src/main.ts` | trust proxy 설정 추가 |
| `src/audit/audit.service.ts` | BigInt replacer, toJsonValue, log() try/catch |
| `src/audit/audit.service.spec.ts` | BigInt 테스트 2개 추가 |
| `src/trains/admin-trains.controller.ts` | action 이름 `scheduler.run` → `scheduler.train_time_sync` |

---

### 현재 상태

- trust proxy 설정 완료 — ngrok/Vercel 환경에서 실제 IP 기록 가능
- BigInt 포함 Prisma 행 넘겨도 로그 정상 기록
- 전체 테스트 149개 통과
