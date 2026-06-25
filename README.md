# 광고 슬롯 목업 사이트 — PR 분할형 Codex 개발 패키지

이 패키지는 **새 폴더에서 시작하는 정적 광고 슬롯 목업 사이트**를 Codex와 개발하되, 변경사항을 리뷰하기 쉬운 크기의 Pull Request로 나누기 위한 문서 세트입니다.

## 한 줄 목표

상품·카테고리·회원·주문 데이터 없이 쇼핑몰처럼 보이는 반응형 단일 페이지를 만들고, 아래 두 광고 슬롯의 표시와 이벤트만 시연합니다.

- `C1_MAIN_TOP`: 데스크톱·태블릿·모바일 메인 상단 광고
- `W1_WING`: 넓은 데스크톱의 우측 윙 광고

모바일에서는 C1의 모바일 소재를 사용하고 W1은 숨깁니다.

## 핵심 작업 원칙

```text
Codex 작업 1개 = 브랜치 1개 = PR 1개
```

- 한 번의 Codex 작업은 사용자가 지정한 PR 하나만 구현합니다.
- 현재 PR이 병합되기 전에는 다음 PR을 시작하지 않습니다.
- 다음 PR의 코드를 미리 작성하지 않습니다.
- 범위 밖 문제는 구현하지 않고 PR 설명의 `Follow-up`에 기록합니다.
- 멀티 에이전트·subagent·병렬 worktree는 사용하지 않습니다.

## PR 순서

| 순서 | PR ID | 브랜치 | 목적 |
|---:|---|---|---|
| 1 | PR-01 | `chore/project-foundation` | React·Vite·Tailwind·shadcn 기반 |
| 2 | PR-02 | `feat/storefront-shell` | 광고 기능이 없는 반응형 쇼핑몰 shell |
| 3 | PR-03 | `feat/ad-slot-rendering` | C1·W1 렌더링과 이미지 fallback |
| 4 | PR-04 | `feat/ad-events-a11y` | 광고 이벤트·접근성·단위 테스트 |
| 5 | PR-05 | `test/release-readiness` | 반응형 E2E·최종 QA·문서화 |

상세 포함·제외 범위는 `docs/07_PR_PLAN.md`를 기준으로 합니다.

## 시작 전에 문서 기준선 만들기

이 ZIP을 새 저장소 루트에 푼 뒤, 제품 코드를 만들기 전에 문서만 먼저 `main`에 반영합니다.

```bash
git init
git add AGENTS.md TASKS.md README.md FILE_LIST.md .github docs
git commit -m "docs: add Codex PR workflow"
```

조직 정책상 `main` 직접 커밋이 불가능하면 이 문서 세트만 담은 선택적 `PR-00`을 먼저 올려 병합합니다. 제품 구현 PR은 `PR-01`부터 시작합니다.

## Codex 실행 방법

Codex는 저장소의 `AGENTS.md`를 공통 지침으로 사용합니다. `.github/agents/00-ad-slot-demo-builder.agent.md`는 보조 역할 문서이므로 각 프롬프트에서 명시적으로 읽게 합니다.

각 PR은 **새 Codex 작업 또는 새 스레드**에서 실행합니다.

1. 이전 PR을 사람이 리뷰하고 `main`에 병합합니다.
2. 로컬 `main`을 최신 상태로 갱신합니다.
3. `docs/prompts/`의 다음 PR 프롬프트를 복사해 Codex에 전달합니다.
4. Codex가 해당 브랜치의 커밋과 Draft PR을 준비하면 작업을 종료합니다.
5. 리뷰 수정은 같은 PR 브랜치에서만 수행합니다.

준비된 프롬프트:

- `docs/prompts/01_PR_01_PROJECT_FOUNDATION.md`
- `docs/prompts/02_PR_02_STOREFRONT_SHELL.md`
- `docs/prompts/03_PR_03_AD_SLOT_RENDERING.md`
- `docs/prompts/04_PR_04_AD_EVENTS_A11Y.md`
- `docs/prompts/05_PR_05_RELEASE_READINESS.md`

## 기술 기준

- React
- TypeScript strict mode
- Vite
- Tailwind CSS v4
- shadcn/ui 초기 설정
- 서버 없는 정적 프런트엔드

shadcn/ui는 프로젝트 기반을 통일하기 위해 초기화하지만, 이 목업에 필요하지 않은 컴포넌트는 추가하지 않습니다.

## 명시적 제외 범위

- 상품·카테고리·쿠폰·회원·주문 dummy data
- JSON fixture
- 실제 검색·로그인·장바구니·결제 기능
- API·백엔드·데이터베이스
- PWA·Service Worker·푸시 알림
- 광고 관리자·CMS·광고 서버
- 광고 캐로셀·자동 재생·타게팅
- C1·W1 외 광고 슬롯
- 실제 쿠팡 로고·상표·문구·이미지 복제

## 문서 구조

```text
.
├── AGENTS.md
├── TASKS.md
├── README.md
├── FILE_LIST.md
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── agents/
│       └── 00-ad-slot-demo-builder.agent.md
└── docs/
    ├── 00_SCOPE.md
    ├── 01_PROJECT_SETUP.md
    ├── 02_AD_SLOT_SPEC.md
    ├── 03_EVENT_SPEC.md
    ├── 04_RESPONSIVE_QA.md
    ├── 05_EXECUTION_ORDER.md
    ├── 06_ASSET_HANDOFF.md
    ├── 07_PR_PLAN.md
    ├── 08_REVIEW_GUIDE.md
    └── prompts/
        ├── 01_PR_01_PROJECT_FOUNDATION.md
        ├── 02_PR_02_STOREFRONT_SHELL.md
        ├── 03_PR_03_AD_SLOT_RENDERING.md
        ├── 04_PR_04_AD_EVENTS_A11Y.md
        └── 05_PR_05_RELEASE_READINESS.md
```
