# Loop Shop Demo Front

Loop Shop Demo Front는 Loop Ad SDK를 실제 쇼핑몰 UI에 붙여 보는 React/Vite 데모입니다.

이 README는 데모를 로컬에서 실행하고, 현재 화면에 붙은 SDK 연동이 정상인지 확인하는 how-to guide입니다. 조직의 전체 저장소 목록이나 오래된 실험 저장소 상태는 여기서 관리하지 않습니다.

## 이 레포의 범위

- 데모 쇼핑몰 화면, 상품 fixture, 라우팅을 제공합니다.
- 홈 화면의 `C1_MAIN_TOP`, `W1_WING` 광고 지면을 렌더링합니다.
- Event SDK를 앱 시작 시 초기화합니다.
- Advertisement SDK가 광고 지면을 채우도록 target DOM을 넘깁니다.
- SDK 로드, 광고 요청, 광고 렌더링이 실패하면 로컬 fallback 광고 decision으로 대체합니다.

SDK 패키지 배포, Event Collector 배포, 광고 API 배포, 인프라 endpoint 계약은 이 프론트 레포의 책임 범위가 아닙니다. 해당 값이 바뀌었는지는 실제 SDK/API 배포 결과를 기준으로 확인합니다.

## 실행하기

```bash
npm install
npm run dev
```

Vite 기본 주소는 `http://localhost:5173`입니다. 이미 사용 중인 포트가 있으면 Vite가 다음 포트를 사용합니다.

## SDK 설정하기

앱은 SDK npm 패키지를 설치하지 않고 GitHub Pages에 배포된 IIFE bundle을 동적으로 로드합니다. script 요청에는 cache-busting query를 붙여 새 배포가 브라우저 캐시에 묶이지 않게 합니다.

```text
https://krafton-jungle-project-4team.github.io/loop-ad_event_sdk/loop-ad-event-sdk.iife.js
https://krafton-jungle-project-4team.github.io/loop-ad_advertisement_sdk/loop-ad-advertisement-sdk.iife.js
```

필요한 경우 `.env.local`에서 값을 덮어씁니다.

```bash
VITE_LOOP_AD_PROJECT_ID=demo-shoppingmall
VITE_LOOP_AD_AD_API_BASE_URL=https://dashboard.api.dev.loop-ad.org/api
VITE_LOOP_AD_DEBUG=true
```

- `VITE_LOOP_AD_PROJECT_ID`: 두 SDK가 공유하는 프로젝트 ID입니다.
- `VITE_LOOP_AD_AD_API_BASE_URL`: Advertisement SDK가 광고 serve API를 호출할 때 쓰는 base URL입니다.
- `VITE_LOOP_AD_DEBUG`: SDK 연동 로그를 확인할 때 `true`로 둡니다.

로컬 Vite 개발 서버에서는 기본 API base URL로 `/api`를 사용하고, Vite proxy가 `https://dashboard.api.dev.loop-ad.org`로 전달합니다. 배포 빌드의 기본 API base URL은 `https://dashboard.api.dev.loop-ad.org/api`입니다.

Event Collector endpoint는 Event SDK bundle 내부 계약을 따릅니다. 이 프론트에서는 Event Collector 주소를 직접 조립하지 않습니다.

## 연동 확인하기

1. 앱을 실행하고 `/` 화면을 엽니다.
2. Network 탭에서 Event SDK와 Advertisement SDK script가 로드되는지 확인합니다.
3. 홈 화면의 `C1_MAIN_TOP` 지면이 광고 SDK로 채워지는지 확인합니다.
4. 1200px 이상 화면에서 `W1_WING` 지면이 보이고 광고 SDK로 채워지는지 확인합니다.
5. 광고 API가 비어 있거나 실패할 때 로컬 fallback 광고가 남아 있는지 확인합니다.
6. 광고 노출과 클릭 이벤트가 Event SDK를 통해 전송되는지 확인합니다.

fallback 광고의 노출/클릭도 같은 이벤트 이름으로 추적하며, fallback용 tracking id와 `source: "advertisement_fallback"` 속성을 함께 보냅니다.

```ts
sdk.track("ad_impression", {
  channel: "demo-shoppingmall",
  device: "desktop",
  creativeId: "loop-c1-summer-sale",
  properties: {
    slot_id: "C1_MAIN_TOP",
    placement_key: "C1_MAIN_TOP",
    page: "/",
    source: "fallback"
  }
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

배포 대상 값은 repository variables로 관리합니다.

```text
LOOPAD_DEV_AWS_REGION
LOOPAD_DEV_DEPLOY_ROLE_ARN
LOOPAD_DEMO_SHOPPINGMALL_WEB_S3_BUCKET
LOOPAD_DEMO_SHOPPINGMALL_WEB_CLOUDFRONT_DISTRIBUTION_ID
```
