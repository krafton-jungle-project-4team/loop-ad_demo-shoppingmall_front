# AI 에이전트 기반 커머스 데모 개발 패키지 — shadcn/ui 버전

- 문서 버전: 3.1
- 기준일: 2026-06-25
- 제품 형태: 데스크톱·태블릿·모바일 반응형 웹 + 설치형 PWA
- 실행 구조: Frontend-only, 정적 호스팅, 번들된 dummy 데이터, 브라우저 상태
- UI 구조: React + Vite + Tailwind CSS v4 + shadcn/ui(Radix 기반)
- 금지 범위: Backend API, 애플리케이션 서버, Database, 실제 결제·로그인·푸시 발송

## 먼저 알아둘 점

이전 패키지의 `Bootstrap Architect`는 Bootstrap CSS 프레임워크가 아니라 프로젝트를 초기화한다는 뜻의 역할명이었다. 실제 이전 스타일링 기준은 CSS Modules였다.

이 버전에서는 오해를 없애기 위해 역할명을 `Foundation & shadcn Architect`로 변경하고, 스타일링 기준을 Tailwind CSS와 shadcn/ui로 명시적으로 교체했다.

shadcn/ui는 완성된 UI 패키지를 런타임에 가져다 쓰는 방식이 아니라, 선택한 컴포넌트 소스를 저장소의 `src/components/ui/**`에 생성한 뒤 팀이 소유·검토하는 방식이다. 따라서 AI 에이전트의 파일 소유권과 CLI 실행 규칙을 엄격하게 적용한다.

## 이 패키지가 해결하는 것

이 패키지는 사람이 역할별 문서를 읽고 직접 분업하는 방식이 아니라, AI 코딩 에이전트들이 충돌 없이 순차·병렬로 구현하도록 지시하는 실행 패키지다.

두 종류의 파일을 함께 제공한다.

1. `AGENTS.md`: 저장소 전체에 적용되는 공통 규칙
2. `.github/agents/*.agent.md`: 역할별 전문 에이전트 정의

`AGENTS.md`만 지원하는 도구에서도 개발할 수 있고, `.agent.md`를 지원하는 VS Code/GitHub Copilot 계열에서는 역할별 에이전트를 선택해 실행할 수 있다.

## 가장 먼저 읽을 파일

1. [`AGENTS.md`](./AGENTS.md)
2. [`docs/00_PROJECT_SPEC.md`](./docs/00_PROJECT_SPEC.md)
3. [`docs/10_SHADCN_WORKFLOW.md`](./docs/10_SHADCN_WORKFLOW.md)
4. [`docs/05_EXECUTION_ORDER.md`](./docs/05_EXECUTION_ORDER.md)
5. [`TASKS.md`](./TASKS.md)
6. [`PLANS.md`](./PLANS.md)

## 권장 실행 방식

- 한 개의 **Orchestrator Agent**가 전체 작업 큐와 의존성을 관리한다.
- 가장 먼저 Foundation & shadcn Architect가 Vite, Tailwind, shadcn, 테스트와 공통 계약을 고정한다.
- Design System Agent가 shadcn primitives를 기반으로 브랜드 토큰과 커머스 조합 컴포넌트를 만든다.
- 기능 에이전트는 기존 primitives를 소비하며 `components.json` 또는 `src/components/ui/**`를 직접 변경하지 않는다.
- 병렬 실행은 서로 다른 파일 경로를 소유하는 작업에만 허용한다.
- 모든 작업은 코드·테스트·문서·handoff가 함께 완료되어야 한다.

## 에이전트 목록

| 순서 | 에이전트 | 파일 | 주 책임 |
|---:|---|---|---|
| 0 | Orchestrator | `.github/agents/00-orchestrator.agent.md` | 계획, 작업 배정, 의존성, 통합 게이트 |
| 1 | Foundation & shadcn Architect | `.github/agents/01-foundation-shadcn-architect.agent.md` | Vite/Tailwind/shadcn 초기화, 계약, 테스트 기반 |
| 2 | Demo Data | `.github/agents/02-demo-data.agent.md` | dummy 데이터, 스키마, 검증 |
| 3 | Design System | `.github/agents/03-design-system.agent.md` | shadcn 토큰, 공통 UI, 반응형 앱 셸 |
| 4 | Discovery | `.github/agents/04-discovery.agent.md` | 홈, 검색, 카테고리, 상품 목록 |
| 5 | Product & Campaign | `.github/agents/05-product-detail-campaign.agent.md` | 캠페인 랜딩, 상품 상세, 옵션 |
| 6 | Cart & Pricing | `.github/agents/06-cart-pricing.agent.md` | 장바구니, 가격, 쿠폰, 영속화 |
| 7 | Checkout & Orders | `.github/agents/07-checkout-orders.agent.md` | 주문서, 모의 결제, 주문 내역 |
| 8 | PWA Platform | `.github/agents/08-pwa-platform.agent.md` | 설치, 캐시, 업데이트, 정적 배포 기반 |
| 9 | Integration | `.github/agents/09-integration.agent.md` | 전체 라우팅, 이벤트 로그, Reset, 종단 연결 |
| 10 | QA Review | `.github/agents/10-qa-review.agent.md` | 자동화, 접근성, 반응형, 회귀 검증 |
| 11 | Release | `.github/agents/11-release.agent.md` | 최종 빌드, smoke test, 데모 릴리스 |

## 시작 명령 예시

AI 도구에 다음과 같이 지시한다.

```text
저장소 루트의 AGENTS.md, PLANS.md, TASKS.md,
docs/00_PROJECT_SPEC.md, docs/05_EXECUTION_ORDER.md,
docs/10_SHADCN_WORKFLOW.md를 모두 읽어라.

.github/agents/00-orchestrator.agent.md 역할로 작업하라.
코드를 작성하기 전에 master ExecPlan과 충돌 없는 작업 배치 계획을 만들고,
TASKS.md의 Phase 0부터 진행하라.

UI 기반은 Tailwind CSS v4 + shadcn/ui이며 Radix base와 CSS variables를 사용한다.
기능 에이전트가 components.json 또는 src/components/ui/**를 수정하지 못하게
파일 소유권과 shared-file lock을 먼저 확정하라.
```

구체적인 에이전트 실행 순서와 복사 가능한 프롬프트는 [`docs/05_EXECUTION_ORDER.md`](./docs/05_EXECUTION_ORDER.md)에 있다.
