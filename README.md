# 🚆 자리나래
### 기차 통합 예매 플랫폼

<blockquote>
  <ul>
    <li>개발기간: 2025.02.07 - 2025.09.24 - 추가 개발중</li>
    <li>개발인원: 1명</li>
  </ul>
</blockquote>

<br>

## 🔗 배포 링크
https://jarinare.vercel.app/

<br>

## 📚 기술 스택

  <tr>
    <td>
      <h3>1. Front-End</h3>
      <blockquote>
      <ul>
        <li>React.js (Ver 19.0)</li>
        <li>Zustand (Ver 5.0.3)</li>
        <li>Tanstack Query (Ver 5.74.3)</li>
      </ul>
      </blockquote>
    </td>
    <td>
      <h3>2. CSS</h3>
      <blockquote>
      <ul>
        <li>TailwindCSS (Ver 3.4.0)</li>
      </ul>
      </blockquote>
    </td>
  </tr>
  <tr>
    <td>
      <h3>3. Back-End Service</h3>
      <blockquote>
      <ul>
        <li>Firebase (Auth, Firestore, Realtime DB) (Ver 11.6.0)</li>
      </ul>
      </blockquote>
    </td>
    <td>
      <h3>4. Deployment</h3>
      <blockquote>
      <ul>
        <li>Vercel</li>
      </ul>
      </blockquote>
    </td>
  </tr>

<br>

## 🖌 UI 디자인
<blockquote>
  Figma
</blockquote>
👉 [ 자리나래 디자인 ]
<br>
https://www.figma.com/design/teybASghDsTKX21SB6P9XS/%EC%9E%90%EB%A6%AC%EB%82%98%EB%A0%88?node-id=0-1&t=5p8SWi8THEdGacsW-1
<br>

<br>

## 🗒️ 기획
<blockquote>
  Notion
</blockquote>
👉 [ 자리나래 기획 ]
<br>
https://www.notion.so/26deaf50d3388003992cf43087c76bd1?v=26deaf50d3388138b8be000cbde5b245
<br>

<br>

## ⚙️ 기능 정의

### 1. 메인 홈
<ul>
  <li>
    예매
    <ul>
      <li>출발역, 도착역, 날짜, 인원수 선택</li>
      <br/>
    </ul>
  </li>
  <li>
    내 승차권
    <ul>
      <li>가장 최신 승차권 정보 조회</li>
      <li>좌석변경 및 상세 조회 버튼</li>
      <br/>
    </ul>
  </li>
  <li>
    추천 여행지
    <ul>
      <li>지역별 추천 여행지 조회</li>
      <br/>
    </ul>
  </li>
</ul>

<div>
  <img width="1907" height="958" alt="Image" src="https://github.com/user-attachments/assets/cee9d261-09fd-4b77-bcb6-3cccaa492d75" />
</div>


### 2. 추천 여행지

<ul>
  <li>출발역 선택 시 목적지까지 실시간 경로 자동 조회</li>
</ul>

<div>
  <img width="1907" height="958" alt="Image" src="https://github.com/user-attachments/assets/d8f8d483-20b9-4feb-9896-f56a5db6a158" />
</div>


### 3. 로그인 및 회원가입

<ul>
  <li>자체 계정 생성 및 로그인</li>
  <li>소셜 로그인 / 회원가입(구글,깃허브,카카오)</li>
</ul>

#### [ 회원가입 ]
<img width="1907" height="958" alt="Image" src="https://github.com/user-attachments/assets/6d28c681-05ad-4dec-878d-0fbc2c9fbc26" />
<br>

#### [ 로그인 ]
<img width="1907" height="958" alt="Image" src="https://github.com/user-attachments/assets/2aaad016-f1c9-4bbf-87c8-6f8808cd26e9" />
<br>

<br>

### 4. 좌석 예매

#### [ 좌석 조회 ]
<ul>
  <li>실제 기차 운행 스케줄을 연동하여 해당 열차 시간대 기준으로 좌석 현황 제공</li>
</ul>

<img width="1907" height="958" alt="Image" src="https://github.com/user-attachments/assets/a81109ce-d14c-4a99-85c3-7ae269bca1e2" />

#### [ 좌석 선택 ] 
<ul>
  <li>단일/다중 좌석 선택</li>
  <li>자동 좌석 배정(랜덤 단일/복수 좌석 지정)</li>
  <li>실시간 좌석 선택 반영(좌석 잠금/해제, 동시 사용자의 중복 선택 방지)</li>
</ul>

<div>
  <img width="450" height="506" alt="Image" src="https://github.com/user-attachments/assets/2e793f12-ae2d-4554-b0b0-a1aaf18dc0fe" />
  <img width="450" height="506" alt="Image" src="https://github.com/user-attachments/assets/99a7fbc3-b02f-4662-81a5-60f4192520b3" />
</div>

<br>

### 5. 좌석 변경

#### [ 좌석 교환 요청 ]
<ul>
  <li>이미 선택한 좌석을 다른 좌석으로 변경 요청 가능</li>
</ul>

#### [ 알림 전송 ]
<ul>
  <li>변경 요청이 발생하면 해당 좌석을 보유한 사용자에게 알림 전송</li>
</ul>

#### [ 승인 및 보상 처리 ]
<ul>
  <li>좌석 보유자가 요청을 수락하거나 거절할 수 있음</li>
  <li>수락 시, 보유자에게 포인트 자동 지급</li>
</ul>

#### [ 공통 예외처리 ]
<ul>
  <li>좌석 변경 요청을 보낸 좌석은 상대방들에겐 변경 요청 가능한 좌석이므로 변경 요청 데이터가 있을 시 좌석 선택 불가</li>
  <li>좌석 변경 요청을 보낸 티켓 안에 또 다른 본인의 좌석이 있다면, 그 좌석의 티켓에서는 좌석 변경 불가(본인과본인의 불필요한 좌석 변경 방지)</li>
</ul>


#### [ 빈 좌석과 변경 ]
<img width="800" height="742" alt="좌석변경1" src="https://github.com/user-attachments/assets/9b5e2ff4-69e5-4019-b68e-39b1e0a1acde" />
<br>

<br>

#### [ 상대방의 좌석과 변경 ]
<ul>
  <li>서로 보유한 좌석 수가 동일한 경우</li>
</ul>
<img width="800" height="742" alt="좌석변경2" src="https://github.com/user-attachments/assets/282d28f9-7b24-4c88-980a-cc08cd17f009" />
<br>

<br>

#### [ 상대방의 좌석과 변경 ]
<ul>
  <li>상대방의 좌석과 빈 좌석을 혼합하여 좌석 수가 동일한 경우</li>
</ul>

<ul>
  <li>예외처리</li>
  <ul>
    <li>변경 요청 데이터에 빈좌석 + 상대방 좌석가 존재하고 내가 선택한 좌석이 빈좌석 + 상대방 좌석이라면 변경 요청 불가</li>
    <li>빈 좌석은 변동이 있어도 상대방 좌석은 고정적이므로 변경 요청 데이터에는 포함되기 때문에 변경 요청 불가</li>
  </ul>
</ul>
<img width="800" height="742" alt="좌석변경3" src="https://github.com/user-attachments/assets/010ca122-494a-43b6-bf5b-eec2fe39ca10" />
<br>

<br>

### 6. 좌석 결제
<ul>
  <li>계절별 이벤트 할인</li>
  <li>포인트 적용</li>
  <li>카드사별 할인 혜택</li>
</ul>

<img width="800" height="742" alt="결제" src="https://github.com/user-attachments/assets/9bc25060-1077-407a-b116-b2d32a444789" />

<br>

### 7. 좌석 반환
<ul>
  <li>예매 취소 및 좌석 반환</li>
</ul>

<img width="1907" height="958" alt="반환" src="https://github.com/user-attachments/assets/d0d26efc-e28e-44c1-b88e-295c5e216e15" />
<br>

<br>

### 8. 알림
<ul>
  <li>좌석 변경 요청에 대한 알림 및 요청 수락/거절에 대한 알림</li>
  <li>토글로 알림 활성화/비활성화 제어</li>
  <li>출발 5분 전부터 1분 전까지 출발 알림 표시 및 알림 클릭 시 해당 티켓으로 이동</li>
</ul>

#### [ 좌석 변경 요청 알림 ]
<img width="1907" height="958" alt="변경수락" src="https://github.com/user-attachments/assets/d4c0f05e-60c7-46ee-b30a-a6bae69020d8" />

#### [ 수락/거절 알림 ]
<img width="458" height="500" alt="스크린샷 2026-07-07 오후 7 53 55" src="https://github.com/user-attachments/assets/aba233fb-5c34-41fb-aee7-26a6d49d909b" />

#### [ 알림 활성화/비활성화 ]
<img width="1907" height="958" alt="알림설정" src="https://github.com/user-attachments/assets/54057763-04e9-468d-886a-73bf57eb8d26" />

#### [ 출발 알림 ]
<div>
  <img width="400" height="557" alt="Image" src="https://github.com/user-attachments/assets/11c31b4f-8ab3-4635-9388-abb4cbca6739" />
  <img width="400" height="557" alt="Image" src="https://github.com/user-attachments/assets/fca94dde-4a07-4ca9-ac6e-7e06901381c8" />
</div>
<br>

<br>

### 9. 포인트 적립 및 업데이트
<ul>
  <li>포인트 적립</li>
  <li>결제 및 활동에 따른 포인트 업데이트</li>
</ul>

<img width="273" height="557" alt="Image" src="https://github.com/user-attachments/assets/3ed2158f-8135-42bb-87cb-d239a4cf5999" />
<br>

<br>

### 10. 열차 구간 및 지도
<ul>
  <li>
    QR 코드
    <ul>
      <li>카메라로 QR 코드 접속 시 티켓 조회</li>
      <br/>
    </ul>
  </li>
  <li>
    구간 및 지도
    <ul>
      <li>실시간 열차 위치 확인</li>
      <br/>
    </ul>
  </li>
</ul>
<img width="1907" height="958" alt="구간" src="https://github.com/user-attachments/assets/6cf7b19c-2d73-4378-ad34-686d16606e54" />
<br>

<br>

## 📝 트러블슈팅

### 1. API 중복 호출 문제 해결 및 디바운싱 적용
### 🚨 문제 배경
기차 시간을 조회할 때마다 API 호출이 반복적으로 발생하여 네트워크 요청 수가 불필요하게 늘어나고, 조회 결과를 가져오는 시간이 지연되는 문제가 있었습니다.

### 🌟 해결 방법
네트워크 로그 분석 결과 날짜 변경으로 인한 불필요한 api 중복 호출을 확인했습니다. <br>
이를 해결하기 위해 요청 시점 제어 로직을 제어하여 조건 변경이 완료되는 시점에만 한 번 호출되도록 개선하고,<br>
<b>디바운싱(Debouncing) 기법</b>을 추가 적용해 연속 입력시에도 중복 호출을 방지했습니다.

### 🙌 이전 코드와 비교
<table>
  <tr>
    <td align="center">
      <b>수정 전</b><br/>
      <img width="273" height="64" alt="Image" src="https://github.com/user-attachments/assets/890b44fb-f995-4817-8238-415b1c477d94" />
      <br>
      <img width="273" height="557" alt="Image1" src="https://github.com/user-attachments/assets/162f509b-1983-484d-8858-65a7860baa16" />
      <br>
    </td>
    <td align="center">
      <b>수정 후</b><br/>
      <img width="273" height="21" alt="Image" src="https://github.com/user-attachments/assets/bf8518ba-4797-41cc-8f76-c99ec939e107" />
      <br>
      <img width="273" height="557" alt="Image2" src="https://github.com/user-attachments/assets/7d157d7d-5fcc-491e-a0ab-a5c64274b338" />
    </td>
  </tr>
</table>

### 🤩 해당 경험을 통해 알게 된 점
네트워크 로그 분석을 통해 불필요한 API 문제를 발견하고, 디바운싱 기법을 적용하여 빠른 중복 호출을 방지할 수 있음을 배웠습니다. 이를 통해 렌더링 효율과 사용자 경험을 함께 경험할 수 있음을 체감했습니다.

<br>

### 2. 좌석 변경 불일치 문제 해결
### 🚨 문제 배경
좌석 변경 기능을 구현하면서 내 좌석과 상대방 좌석을 동시에 변경해야 하기 위해
Firestore의 updateDoc를 사용하여 각각의 좌석을 업데이트했지만 동시 접근 시 상대방에게 좌석이 다 몰리는 문제가 발생했습니다.

### 🌟 해결 방법
Firebase 공식문서를 보고 runTransaction 기능을 알게 되었고, 이를 사용하면 한 <b>트랜잭션</b> 안에서 여러 문서를 동시에 읽고 쓰는 처리가 가능하다는 것을 알게 되었습니다.
<b>트랜잭션</b>을 적용하여 내 좌석과 상대방 좌석을 동시에 교체하도록 코드를 수정했습니다.

### 🙌 이전 코드와 비교
<table>
  <tr>
    <td align="center">
      <b>updateDoc을 사용했을 때</b><br/>
      <img width="273" height="557" alt="Image1" src="https://github.com/user-attachments/assets/b22c52fe-4a3a-457f-99c8-25921dfcfbde" />
    </td>
    <td align="center">
      <b>runTranscation을 사용했을 때</b><br/>
      <img width="273" height="557" alt="Image2" src="https://github.com/user-attachments/assets/fa6c7cc9-3a9b-4d44-915e-daa251854ecf" />
    </td>
  </tr>
</table>

### 🤩 해당 경험을 통해 알게 된 점
Firestore에서 updateDoc만 사용할 경우 동시 요청 시 데이터 불일치가 발생할 수 있다는 문제를 경험했습니다.
<br>
runTransaction에 대해 알게 되었고, 어떠한 상황에서 사용해야하는지 알게되었습니다.
