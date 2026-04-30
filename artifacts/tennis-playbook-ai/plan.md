# Tennis Playbook AI 연동 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| AI Provider | Google Gemini Flash (`gemini-2.0-flash`) via Vercel AI SDK | 무료 tier 충분 (15 RPM, 100만 토큰/일), 한국어 품질 우수 |
| SDK | `ai` + `@ai-sdk/google` | provider 교체 용이, Next.js Route Handler와 자연스러운 통합, structured output 지원 |
| API 호출 위치 | Next.js Route Handler (`app/api/playbook/route.ts`) | API 키 서버 사이드 관리, Vercel 배포 호환 |
| 비동기 상태 관리 | `useDiary` 훅에 `isGenerating`, `generationError`, `regeneratePlaybook()` 추가 | 기존 구조 최소 변경 |
| 플레이북 생성 트리거 | CRUD 후 localStorage에 `playbook-stale` 플래그 → 플레이북 페이지 마운트 시 자동 트리거 | 페이지 이동 시 async 상태 소멸 문제 해결 — `/add`에서 시작된 AI 호출이 네비게이션으로 끊기지 않음 |
| 에러 알림 | shadcn Sonner (toast) | 경량, shadcn 생태계 일관성 |
| 기록 저장과 플레이북 생성 분리 | 기록은 동기 저장(localStorage) 후, 플레이북은 비동기 API 호출 | 불변 규칙: 기록 저장 독립성 보장 |
| 타임아웃 | 클라이언트 fetch에 10초 AbortController 타임아웃 | 불변 규칙: 응답 시간 10초 이내 |
| 기존 시뮬레이션 | `generatePlaybook` 함수 제거, `buildPrompt` 헬퍼로 대체 | AI가 완전히 대체하므로 시뮬레이션 코드 불필요 |

## 인프라 리소스

| 리소스 | 유형 | 선언 위치 | 생성 Task |
|---|---|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Env var | `.env.local` (로컬) / Vercel 환경변수 (배포) | Task 1 |

## 데이터 모델

기존 모델 변경 없음. `Playbook`, `PlaybookItem` 타입 그대로 유지.

localStorage 추가 키:
- `tennis-playbook:playbook-stale:v1` — `"true"` | 없음. CRUD 후 설정, 플레이북 생성 성공 후 제거.

API Route Request:
- `entries: DiaryEntry[]` (POST body)

API Route Response (200):
- `items: PlaybookItem[]`
- `updatedAt: string`

API Route Error (400/500):
- `error: string` (에러 메시지)

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| next-best-practices | Task 1 | Route Handler 작성, async API patterns |
| vercel-react-best-practices | Task 2 | 비동기 상태 관리, hydration 안전성 |
| shadcn | Task 3 | Sonner(toast) 컴포넌트 추가, Button |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `app/api/playbook/route.ts` | New | Task 1 |
| `lib/playbook.ts` | Modify | Task 1 |
| `lib/playbook.test.ts` | Modify | Task 1 |
| `hooks/useDiary.ts` | Modify | Task 2 |
| `hooks/useDiary.test.ts` | Modify | Task 2 |
| `components/diary/PlaybookList.tsx` | Modify | Task 2, 3 |
| `components/diary/PlaybookList.test.tsx` | Modify | Task 2, 3 |
| `app/(main)/playbook/page.tsx` | Modify | Task 2, 3 |
| `app/(main)/add/page.tsx` | Modify | Task 2 |
| `app/(main)/edit/[id]/page.tsx` | Modify | Task 2 |
| `app/layout.tsx` | Modify | Task 3 |

## Tasks

### Task 1: API Route + AI 서비스 설정

- **담당 시나리오**: Scenario 1 (서버 측 생성 로직 — happy path)
- **크기**: S (2 소스 파일)
- **의존성**: None
- **참조**:
  - next-best-practices — `route-handlers`
  - Vercel AI SDK docs: https://sdk.vercel.ai/docs/ai-sdk-core/generating-text
- **구현 대상**:
  - `app/api/playbook/route.ts` — POST handler; entries를 받아 Gemini에 프롬프트 전송, PlaybookItem[] 반환; 빈 배열 시 400; AI 실패 시 500 + `{ error: string }`
  - `lib/playbook.ts` (Modify) — 기존 `generatePlaybook` 제거, `buildPrompt(entries): string` 헬퍼 추출 (한국어 행동 지침 체크리스트 5개 생성을 지시하는 시스템/유저 프롬프트)
  - `lib/playbook.test.ts` (Modify) — 기존 시뮬레이션 테스트 제거, `buildPrompt` 단위 테스트로 교체
- **수용 기준**:
  - [ ] POST `/api/playbook`에 entries 배열을 보내면 200 응답으로 `{ items: PlaybookItem[], updatedAt: string }`이 반환된다
  - [ ] entries가 빈 배열이면 400 응답과 `{ error: string }`이 반환된다
  - [ ] AI 서비스 오류 시 500 응답과 `{ error: string }`이 반환된다
  - [ ] `buildPrompt(entries)`가 모든 entry의 notes를 포함하고, "한국어 행동 지침 체크리스트 5개"를 요구하는 프롬프트 문자열을 생성한다
- **검증**:
  - `bun run test -- playbook`
  - `bun run build`

---

### Task 2: useDiary 비동기 전환 + 로딩 UI

- **담당 시나리오**: Scenario 1 (full), Scenario 4 (full)
- **크기**: M (5 파일 수정)
- **의존성**: Task 1
- **참조**:
  - vercel-react-best-practices — `client-async-patterns`
- **구현 대상**:
  - `hooks/useDiary.ts` (Modify) — CRUD 함수에서 `playbook-stale` 플래그 설정; `regeneratePlaybook()` async 함수 (fetch + 10초 AbortController 타임아웃); `isGenerating`, `generationError` 상태; 성공 시 localStorage에 playbook 저장 + stale 플래그 제거
  - `hooks/useDiary.test.ts` (Modify) — 비동기 플레이북 생성 테스트 (fetch mock); 타임아웃 테스트; stale 플래그 테스트
  - `components/diary/PlaybookList.tsx` (Modify) — `isLoading` prop 추가; 로딩 시 스피너 + "플레이북 생성 중..." 표시
  - `components/diary/PlaybookList.test.tsx` (Modify) — 로딩 상태 렌더링 테스트
  - `app/(main)/playbook/page.tsx` (Modify) — 마운트 시 `playbook-stale` 감지하면 `regeneratePlaybook()` 자동 호출; `isGenerating` prop 연결
  - `app/(main)/add/page.tsx` (Modify) — `addEntry` 호출 후 동기 플레이북 생성 로직 제거 (stale 플래그만 설정됨)
  - `app/(main)/edit/[id]/page.tsx` (Modify) — 동일
- **수용 기준**:
  - [ ] 기록 저장 후 `/playbook`으로 이동하면 스피너와 "플레이북 생성 중..." 텍스트가 표시된다
  - [ ] API 응답 완료 후 플레이북에 5개 항목이 표시된다
  - [ ] 이전 플레이북 항목은 사라지고 새 항목으로 교체된다
  - [ ] "마지막 갱신" 시각이 업데이트된다
  - [ ] 생성된 항목은 한국어 행동 지침 형태이다
  - [ ] 첫 기록 저장 후 빈 상태 문구가 사라지고 플레이북 항목이 표시된다
  - [ ] 첫 기록 저장 후 FAB 버블 가이드가 사라진다
  - [ ] 기록 저장은 AI 호출과 독립적으로 항상 localStorage에 성공한다
  - [ ] 기록 삭제 후 `/playbook` 진입 시에도 플레이북이 재생성된다
  - [ ] AI 호출이 10초 내에 완료되지 않으면 타임아웃 에러로 처리된다
  - [ ] 기존 기록 CRUD 흐름(추가·편집·삭제·히스토리 표시)이 정상 동작한다
- **검증**:
  - `bun run test -- useDiary PlaybookList`
  - `bun run build`
  - `bun run test` (전체 — regression 확인)

---

### Checkpoint: Tasks 1-2 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 기록 저장 → 페이지 이동 → 로딩 → AI 플레이북 갱신의 end-to-end 흐름이 동작

---

### Task 3: 에러 핸들링 + 새로고침 버튼

- **담당 시나리오**: Scenario 2 (full), Scenario 3 (full)
- **크기**: S (3 파일)
- **의존성**: Task 2
- **참조**:
  - shadcn — `sonner` (toast)
- **구현 대상**:
  - `components/diary/PlaybookList.tsx` (Modify) — "새로고침" 버튼 추가 (기록 1개 이상 + 로딩 중 아닐 때만 표시); `onRefresh` prop
  - `components/diary/PlaybookList.test.tsx` (Modify) — 새로고침 버튼 렌더링·클릭 테스트; 기록 0개일 때 비표시 테스트
  - `app/(main)/playbook/page.tsx` (Modify) — `generationError` 감지 시 toast 호출; `regeneratePlaybook`을 `onRefresh`로 전달
  - `app/layout.tsx` (Modify) — `<Toaster />` 컴포넌트 마운트
- **수용 기준**:
  - [ ] AI 호출 실패 시 "플레이북 생성에 실패했습니다" 토스트가 표시된다
  - [ ] 실패 후 기존 플레이북 항목이 그대로 유지된다
  - [ ] 실패 후 "마지막 갱신" 시각이 변경되지 않는다
  - [ ] 플레이북 탭에 "새로고침" 버튼이 표시된다
  - [ ] "새로고침" 버튼 탭 시 로딩 → 새 플레이북 생성 흐름이 동작한다
  - [ ] 기록이 0개일 때는 "새로고침" 버튼이 표시되지 않는다
- **검증**:
  - `bun run test -- PlaybookList`
  - `bun run build`

---

### Checkpoint: Task 3 이후 (Final)
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] AI 실패 시 에러 토스트 + 기존 플레이북 유지 동작
- [ ] 새로고침 버튼으로 수동 재생성 동작
- [ ] 전체 flow: 기록 저장 → 페이지 이동 → 로딩 → AI 플레이북 생성/실패 → 토스트/교체 end-to-end 동작
- [ ] 기존 cycle 1 기능 regression 없음

## 미결정 항목

없음
