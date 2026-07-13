# StayLoop Booking Demo Front

StayLoop Booking Demo Front는 Loop Ad SDK를 숙소 예약 UI에 붙여 보는 React/Vite 데모입니다.

이 README는 데모를 로컬에서 실행하고, 현재 화면에 붙은 SDK 연동이 정상인지 확인하는 how-to guide입니다. 조직의 전체 저장소 목록이나 오래된 실험 저장소 상태는 여기서 관리하지 않습니다.

## 이 레포의 범위

- 데모 숙소 예약 화면, 호텔 fixture, 검색/예약 라우팅을 제공합니다.
- 홈 화면의 `C1_MAIN_TOP`, 검색 결과 화면의 `W1_WING` 광고 지면을 렌더링합니다.
- Event SDK를 앱 시작 시 초기화합니다.
- Advertisement SDK가 광고 지면을 채우도록 target DOM을 넘깁니다.
- SDK 로드, 광고 요청, 광고 렌더링이 실패하면 광고 지면은 빈 회색 슬롯으로 남깁니다.

SDK 패키지 배포, Event Collector 배포, 광고 API 배포, 인프라 endpoint 계약은 이 프론트 레포의 책임 범위가 아닙니다. 해당 값이 바뀌었는지는 실제 SDK/API 배포 결과를 기준으로 확인합니다.

## 실행하기

```bash
npm install
npm run dev
```

Vite 기본 주소는 `http://localhost:5173`입니다. 이미 사용 중인 포트가 있으면 Vite가 다음 포트를 사용합니다.

## SDK 설정하기

Event SDK와 Advertisement SDK는 GitHub Pages의 공개 IIFE bundle을 동적으로 로드합니다.
npm registry 설정이나 패키지 토큰은 사용하지 않습니다.

Event SDK Connection URL은 `VITE_LOOP_AD_CONNECTION_URL`을 사용합니다. 값이 없으면
개발 데모용 공개 URL을 fallback으로 사용합니다.

```text
https://dashboard.api.dev.loop-ad.org/api/public/v1/sdk/connections/wk_b35b42ee88bb4469becef289cdf29c57
```

Tracking Plan 이벤트와 스키마의 등록·게시는 infra에서 담당합니다.

```text
https://krafton-jungle-project-4team.github.io/loop-ad_event_sdk/loop-ad-event-sdk.iife.js
https://krafton-jungle-project-4team.github.io/loop-ad_advertisement_sdk/loop-ad-advertisement-sdk.iife.js
```

필요한 경우 `.env.local`에서 값을 덮어씁니다.

```bash
VITE_LOOP_AD_PROJECT_ID=demo_project
VITE_LOOP_AD_CONNECTION_URL=https://dashboard.api.dev.loop-ad.org/api/public/v1/sdk/connections/wk_b35b42ee88bb4469becef289cdf29c57
VITE_LOOP_AD_PROMOTION_RUN_ID=demo_project
VITE_LOOP_AD_AD_API_BASE_URL=https://dashboard.api.dev.loop-ad.org/api
VITE_LOOP_AD_DEBUG=true
```

- `VITE_LOOP_AD_PROJECT_ID`: 두 SDK가 공유하는 프로젝트 ID입니다.
- `VITE_LOOP_AD_CONNECTION_URL`: Dashboard가 게시한 Event SDK Connection URL입니다.
- `VITE_LOOP_AD_PROMOTION_RUN_ID`: Advertisement SDK가 banner resolve API에 넘기는 promotion run ID입니다.
- `VITE_LOOP_AD_AD_API_BASE_URL`: Advertisement SDK가 광고 serve API를 호출할 때 쓰는 base URL입니다.
- `VITE_LOOP_AD_DEBUG`: SDK 연동 로그를 확인할 때 `true`로 둡니다.

배포 workflow도 같은 이름의 GitHub Actions 변수를 Vite 빌드에 전달합니다.

로컬 Vite 개발 서버에서는 기본 API base URL로 `/api`를 사용하고, Vite proxy가 `https://dashboard.api.dev.loop-ad.org`로 전달합니다. 배포 빌드의 기본 API base URL은 `https://dashboard.api.dev.loop-ad.org/api`입니다.

Event SDK Connection URL도 로컬에서는 같은 Vite proxy를 사용합니다. proxy는 Dashboard에
등록된 dev 배포 origin으로 요청하므로 localhost의 origin allowlist 오류를 피합니다.

Event Collector endpoint는 Event SDK bundle 내부 계약을 따릅니다. 이 프론트에서는 Event Collector 주소를 직접 조립하지 않습니다.

## 연동 확인하기

1. 앱을 실행하고 `/` 화면을 엽니다.
2. Network 탭에서 connection API와 Advertisement SDK script가 로드되는지 확인합니다.
3. 홈 화면의 `C1_MAIN_TOP` 지면이 광고 SDK로 채워지는지 확인합니다.
4. `/search` 화면의 1200px 이상 레이아웃에서 `W1_WING` 지면이 보이고 광고 SDK로 채워지는지 확인합니다.
5. 광고 API가 비어 있거나 실패할 때 지면이 클릭/문구/이벤트 없는 빈 회색 슬롯으로 남는지 확인합니다.
6. 광고 노출/클릭과 예약 흐름 이벤트가 Event SDK를 통해 전송되는지 확인합니다.

필수 이벤트 11개는 아래 흐름에서 보냅니다.

| 분류 | event_name | 데모 발생 지점 |
| --- | --- | --- |
| 공통 | `page_view` | 라우트 진입/변경 |
| 프로모션 | `promotion_impression` | 실제 광고 decision이 노출될 때 |
| 프로모션 | `promotion_click` | 실제 광고 decision 클릭 |
| 프로모션 | `campaign_redirect_click` | `campaign_id`, `utm_campaign`, `redirect_id`, `deal` 등 캠페인 파라미터가 붙은 URL 첫 진입 |
| 프로모션 | `campaign_landing` | 캠페인 파라미터가 붙은 랜딩 페이지 도착 |
| 호텔 탐색 | `hotel_search` | 검색 폼 제출 |
| 호텔 탐색 | `hotel_click` | 검색 결과 호텔 카드/목록 클릭 |
| 호텔 탐색 | `hotel_detail_view` | 호텔 상세 페이지 조회 |
| 예약 | `booking_start` | 체크아웃 페이지 진입 |
| 예약 | `booking_complete` | 예약 완료 |
| 예약 | `booking_cancel` | 내 예약 화면에서 예약 취소 |

광고 SDK가 실제 광고 decision을 반환한 경우에만 `promotion_impression`, `promotion_click`을 보냅니다. 빈 지면 상태에서는 fallback tracking event를 보내지 않습니다.

```ts
sdk.track("promotion_impression", {
  promotion_channel: "onsite_banner",
  placement_id: "C1_MAIN_TOP",
  device: "desktop",
  content_id: "loop-c1-summer-sale",
  slot_id: "C1_MAIN_TOP",
  placement_page: "/",
  source: "advertisement_sdk"
});
```

## 검증하기

전체 검증은 아래 명령으로 실행합니다.

```bash
npm run verify
```

개별 단계가 필요하면 아래 명령을 사용합니다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## 배포하기

`main` 브랜치에 push되면 GitHub Actions가 `npm run verify`를 통과한 뒤 `npm run build`로 `dist`를 만들고, 인프라 레포의 reusable frontend deploy workflow를 호출해 S3와 CloudFront로 배포합니다. 수동 배포가 필요하면 `Deploy Demo Shoppingmall Web` workflow를 `workflow_dispatch`로 실행합니다.

dashboard web 배포 workflow와 같은 GitHub Actions variables를 사용합니다.

```text
LOOPAD_DEV_AWS_REGION
LOOPAD_DEV_DEPLOY_ROLE_ARN
LOOPAD_DEMO_SHOPPINGMALL_WEB_CLOUDFRONT_DISTRIBUTION_ID
```

S3 bucket은 dashboard web 배포처럼 workflow 입력에 직접 둡니다.

```text
loop-ad-dev-demo-shoppingmall-web
```
