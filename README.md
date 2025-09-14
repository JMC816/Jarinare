# 🚆 자리나래
### 기차 통합 예매 플랫폼

<blockquote>
  <ul>
    <li>개발기간: 2025.02.07-09.08</li>
    <li>개발인원: 1명</li>
  </ul>
</blockquote>

<br>

## 📚 기술 스택
##### 1. Front-end
<blockquote>
  React.js
</blockquote>

##### 2. Back-end Service
<blockquote>
  Firebase (Auth, Firestore, Realtime DB)
</blockquote>

##### 3. Deployment
<blockquote>
  Vercel
</blockquote>

<br>

## 🖌 UI 디자인
<blockquote>
  Figma
</blockquote>
👉 [ 자리나레 디자인 ]
<br>
https://www.figma.com/design/teybASghDsTKX21SB6P9XS/%EC%9E%90%EB%A6%AC%EB%82%98%EB%A0%88?node-id=0-1&t=5p8SWi8THEdGacsW-1
<br>

<br>

## 📝 기획
<blockquote>
  Notion
</blockquote>
👉 [ 자리나레 기획 ]
<br>
https://www.notion.so/26deaf50d3388003992cf43087c76bd1?v=26deaf50d3388138b8be000cbde5b245
<br>

<br>

## ⚙️ 기능 정의

### 1. 로그인 및 회원가입

<ul>
  <li>자체 계정 생성 및 로그인</li>
  <li>소셜 로그인 / 회원가입(구글,깃허브,카카오)</li>
</ul>
<br>
<img width="273" height="557" alt="Image" src="https://github.com/user-attachments/assets/3aff8a7b-6844-4d33-9b36-7e0647f1c7f5" />
<br>

<br>

### 2. 좌석 예매

#### [ 좌석 조회 ]
<ul>
  <li>실제 기차 운행 스케줄을 연동하여 해당 열차 시간대 기준으로 좌석 현황 제공</li>
</ul>

![Image](https://github.com/user-attachments/assets/4d9b6fcb-58fb-4d97-a2b4-c571961ef2c4)

#### [ 좌석 선택 ] 
<ul>
  <li>단일/다중 좌석 선택</li>
  <li>자동 좌석 배정(랜덤 단일/복수 좌석 지정)</li>
  <li>실시간 좌석 선택 반영(좌석 잠금/해제, 동시 사용자의 중복 선택 방지)</li>
</ul>

![Image](https://github.com/user-attachments/assets/94817645-56d0-4951-b5d0-cd489c635267)

<br>

### 3. 좌석 변경

#### [ 좌석 교환 요청 ]
<ul>
  <li>이미 선택한 좌석 좌석을 다른 좌석으로 변경 요청 가능</li>
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

#### [ 빈 좌석과 변경 ]
![Image](https://github.com/user-attachments/assets/efc78d97-fca5-428a-af8b-9c16f2b8aad6)

#### [ 상대방의 좌석과 변경 ]
<ul>
  <li>서로 보유한 좌석 수가 동일한 경우</li>
</ul>

![Image](https://github.com/user-attachments/assets/f5731d2d-b43f-4975-ae39-398b40751d10)

#### [ 상대방의 좌석과 변경 ]
<ul>
  <li>상대방의 좌석과 빈 좌석을 혼합하여 좌석 수가 동일한 경우</li>
</ul>

![Image](https://github.com/user-attachments/assets/5a2138f9-f016-40bc-96f8-7a6e21462b71)

<br>

### 4. 좌석 결제
<ul>
  <li>예매된 좌석 결제 기능(포인트로 결제 가능)</li>
</ul>

![Image](https://github.com/user-attachments/assets/1d867650-285c-4bfa-a173-0215915e83a4)

<br>

### 5. 좌석 반환
<ul>
  <li>예매 취소 및 좌석 반환</li>
</ul>

![Image](https://github.com/user-attachments/assets/2cb39e0e-11d5-424d-814e-9100d369bfff)

<br>

### 6. 알림
<ul>
  <li>좌석 변경 요청에 대한 알림 및 요청 수락/거절에 대한 알림</li>
</ul>

![Image](https://github.com/user-attachments/assets/c50d4f14-79c9-44bb-92a4-380fdbd46c5e)

<br>

### 7. 포인트 적립 및 업데이트
<ul>
  <li>포인트 적립</li>
  <li>결제 및 활동에 따른 포인트 업데이트</li>
</ul>

<div>
<img width="268" height="546" alt="Image" src="https://github.com/user-attachments/assets/bc2dd0c4-ff49-484b-a841-32c03c8ba16c" />
<img width="266" height="548" alt="Image" src="https://github.com/user-attachments/assets/1a88d166-8b82-42e2-b7c0-1e8691862ca8" />
</div>

