# Tennis Playbook 구현 계획

## 아키텍처 결정

| 결정 | 선택 | 이유 |
|---|---|---|
| 네비게이션 | App Router `(main)` 그룹 레이아웃 + 라우트 기반 화면 전환 | wireframe이 화면별 독립 라우트로 표현; 탭바·FAB을 공유 레이아웃으로 구성해 중복 제거 |
| 상태·지속성 | `localStorage` + `useDiary` 커스텀 훅 | 외부 API 없음; 외부 상태 관리 라이브러리 불필요; SSR hydration guard는 `useEffect` 처리 |
| 플레이북 생성 | 시뮬레이션 — 전체 느낀점을 문장 단위로 분리, 상위 5개 선별 | 이번 사이클은 동작 가정 검증; 실제 AI 연동은 다음 사이클 |
| 플레이북 항목 수 | 5개 고정 | spec 권장 범위(3-5) 내; 충분한 포인트 표시 |
| 다크 모드 | `next-themes` `defaultTheme="system"` | 불변 규칙: 시스템 설정 자동 연동; `next-themes` 이미 설치됨 |
| 유형·기간·결과 선택 UI | shadcn `ToggleGroup` | shadcn 규칙: 2-5 선택지는 ToggleGroup |
| Add/Edit 화면 | `(main)` 그룹 내 별도 라우트 (`/add`, `/edit/[id]`) | wireframe이 탭바가 유지된 채 전환되는 full-screen으로 표현 |

## 인프라 리소스

None

## 데이터 모델

### DiaryEntry
- `id: string` (required) — `crypto.randomUUID()`
- `type: 'lesson' | 'match'` (required)
- `date: string` (required) — YYYY-MM-DD
- `duration: number` (required) — 분(正整數)
- `notes: string` — 빈 문자열 허용
- `score?: string` — match 전용
- `result?: 'win' | 'lose'` — match 전용
- `createdAt: string` — ISO timestamp

### Playbook
- `items: PlaybookItem[]`
- `updatedAt: string` — ISO timestamp

### PlaybookItem
- `id: string`
- `text: string`

## 필요 스킬

| 스킬 | 적용 Task | 용도 |
|---|---|---|
| shadcn | 2, 3, 4, 5, 7 | ToggleGroup·Field·Card·AlertDialog 컴포넌트 선택 및 사용 |
| next-best-practices | 2 | `'use client'` 배치, RSC 경계, hydration 처리 |
| vercel-react-best-practices | 1, 2 | localStorage 스키마 설계, `rendering-hydration-no-flicker` |
| vercel-composition-patterns | 3, 4 | 명시적 variants, 조건부 렌더링 패턴 |

## 영향 받는 파일

| 파일 경로 | 변경 유형 | 관련 Task |
|---|---|---|
| `types/diary.ts` | New | Task 1 |
| `lib/storage.ts` | New | Task 1 |
| `lib/time.ts` | New | Task 1 |
| `lib/playbook.ts` | New | Task 1 |
| `lib/storage.test.ts` | New | Task 1 |
| `lib/time.test.ts` | New | Task 1 |
| `hooks/useDiary.ts` | New | Task 2 |
| `hooks/useDiary.test.ts` | New | Task 2 |
| `components/diary/TabBar.tsx` | New | Task 2 |
| `app/(main)/layout.tsx` | New | Task 2 |
| `app/(main)/playbook/page.tsx` | New | Task 2 → Task 5 |
| `app/(main)/history/page.tsx` | New | Task 2 → Task 3 |
| `app/(main)/add/page.tsx` | New | Task 2 → Task 3 |
| `app/(main)/edit/[id]/page.tsx` | New | Task 6 |
| `components/diary/RecordForm.tsx` | New | Task 3 |
| `components/diary/RecordForm.test.tsx` | New | Task 3, 4 |
| `components/diary/RecordCard.tsx` | New | Task 3 |
| `components/diary/RecordCard.test.tsx` | New | Task 3 |
| `components/diary/PlaybookList.tsx` | New | Task 5 |
| `components/diary/PlaybookList.test.tsx` | New | Task 5 |
| `components/diary/FabBubble.tsx` | New | Task 5 |
| `components/diary/DeleteDialog.tsx` | New | Task 7 |
| `components/diary/DeleteDialog.test.tsx` | New | Task 7 |
| `components/diary/TimeSummary.tsx` | New | Task 8 |
| `components/diary/TimeSummary.test.tsx` | New | Task 8 |
| `app/layout.tsx` | Modify | Task 9 |
| `app/page.tsx` | Modify | Task 9 |

## Tasks

### Task 1: 타입 + 스토리지 서비스 + 시간 포맷

- **담당 시나리오**: 없음 (foundational — 모든 시나리오의 불변 규칙 "데이터 지속성"·"시간 표시" 지원)
- **크기**: M (4 소스 파일)
- **의존성**: None
- **참조**:
  - vercel-react-best-practices — `client-localstorage-schema`
- **구현 대상**:
  - `types/diary.ts` — DiaryEntry, Playbook, PlaybookItem 타입 정의
  - `lib/storage.ts` — `getEntries`, `addEntry`, `updateEntry`, `deleteEntry`, `getPlaybook`, `savePlaybook`
  - `lib/time.ts` — `formatDuration(minutes: number): string` (90 → "1시간 30분", 60 → "1시간", 30 → "30분")
  - `lib/playbook.ts` — `generatePlaybook(entries: DiaryEntry[]): PlaybookItem[]` (느낀점 문장 분리 → 상위 5개)
  - `lib/storage.test.ts`
  - `lib/time.test.ts`
- **수용 기준**:
  - [x] `addEntry(entry)` 후 `getEntries()`가 해당 항목을 포함한 배열을 반환한다
  - [x] `deleteEntry(id)` 후 `getEntries()`에 해당 id가 없다
  - [x] `updateEntry(id, patch)` 후 `getEntries()`에서 해당 entry 필드가 변경된다
  - [x] `formatDuration(90)` → `"1시간 30분"`, `formatDuration(60)` → `"1시간"`, `formatDuration(30)` → `"30분"`
- **검증**: `bun run test -- storage time`

---

### Task 2: useDiary 훅 + 앱 라우팅 뼈대

- **담당 시나리오**: 없음 (infrastructure — 불변 규칙 "데이터 지속성" 구현, "갱신 순서" 보장)
- **크기**: M (5 소스 파일)
- **의존성**: Task 1
- **참조**:
  - next-best-practices — `rsc-boundaries`, `directives`
  - vercel-react-best-practices — `rendering-hydration-no-flicker`
  - shadcn — `Button`, `Lucide` 아이콘 (`Star`, `ClipboardList`, `Plus`)
- **구현 대상**:
  - `hooks/useDiary.ts` — entries 상태, CRUD 액션, 저장 성공 후 playbook 자동 갱신; SSR hydration guard
  - `hooks/useDiary.test.ts`
  - `components/diary/TabBar.tsx` — 하단 탭바(플레이북/히스토리) + 중앙 FAB; `'use client'`
  - `app/(main)/layout.tsx` — TabBar를 포함한 공유 레이아웃; `'use client'`
  - `app/(main)/playbook/page.tsx` — "플레이북" 제목 placeholder
  - `app/(main)/history/page.tsx` — "히스토리" 제목 placeholder
  - `app/(main)/add/page.tsx` — "기록 추가" 제목 placeholder
- **수용 기준**:
  - [x] `addEntry()` 호출 시 `entries` 상태에 새 항목이 추가되고 `playbook.items`가 채워진다
  - [x] `deleteEntry(id)` 후 `entries`에 해당 id가 없다
  - [x] 스토리지 쓰기 실패(`addEntry`·`updateEntry`·`deleteEntry` 예외) 시 `playbook`이 이전 상태 그대로 유지된다
  - [x] `/playbook`, `/history`, `/add` 경로가 각각 해당 placeholder를 렌더링한다
- **검증**:
  - `bun run test -- useDiary`
  - `bun run build`

---

### Task 3: 레슨 기록 추가 + 히스토리 카드 표시

- **담당 시나리오**: Scenario 1 (full)
- **크기**: M (4 소스 파일)
- **의존성**: Task 2
- **참조**:
  - shadcn — `Field`, `ToggleGroup` (레슨/경기), `Card`, `Button`
  - vercel-composition-patterns — `patterns-explicit-variants`
  - wireframe — screen-4 (기록 추가 레슨), screen-3 (히스토리)
- **구현 대상**:
  - `components/diary/RecordForm.tsx` — 날짜·소요 시간·느낀점 폼 (레슨 모드); 유효성 검사; `'use client'`
  - `components/diary/RecordForm.test.tsx`
  - `components/diary/RecordCard.tsx` — 히스토리 카드 (유형·날짜·소요 시간·느낀점·편집·삭제 버튼); `'use client'`
  - `components/diary/RecordCard.test.tsx`
  - `app/(main)/add/page.tsx` (Modify) — RecordForm 연결; 저장 성공 후 `/playbook` 이동
  - `app/(main)/history/page.tsx` (Modify) — RecordCard 날짜 역순 목록 연결
- **수용 기준**:
  - [x] 날짜가 빈 채 저장하면 "날짜를 입력하세요" 메시지가 필드 아래에 표시된다
  - [x] 소요 시간이 비어 있거나 0 이하인 채 저장하면 "소요 시간을 입력하세요" 메시지가 표시된다
  - [x] 저장 성공 후 `/playbook`으로 이동한다
  - [x] 저장 성공 후 폼이 초기화되고, 날짜 필드에 오늘 날짜가 기본값으로 설정된다
  - [x] 히스토리 탭에 방금 입력한 날짜·유형·소요 시간·느낀점이 표시된다
- **검증**:
  - `bun run test -- RecordForm RecordCard`
  - Browser MCP — `/add` 진입, 날짜 빈 채 저장 → 오류 메시지 단언; 정상 저장 후 `/history`에서 카드 확인, 증거 `artifacts/tennis-playbook/evidence/task3.png` 저장

---

### Checkpoint: Tasks 1-3 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 레슨 기록을 `/add`에서 추가하면 `/history`에 카드가 나타나는 vertical slice가 end-to-end로 동작

---

### Task 4: 경기 기록 조건부 필드

- **담당 시나리오**: Scenario 2 (full)
- **크기**: S (1 소스 파일 수정)
- **의존성**: Task 3
- **참조**:
  - shadcn — `ToggleGroup` (승/패), `Input` (스코어)
  - vercel-composition-patterns — 조건부 렌더링
  - wireframe — screen-5 (기록 추가 경기)
- **구현 대상**:
  - `components/diary/RecordForm.tsx` (Modify) — 유형 "경기" 선택 시 스코어·승패 필드 조건부 표시
  - `components/diary/RecordForm.test.tsx` (Modify) — 경기 필드 표시/숨김 케이스 추가
  - `components/diary/RecordCard.tsx` (Modify) — 경기 카드에 스코어·승/패 표시
  - `components/diary/RecordCard.test.tsx` (Modify) — 경기 카드 렌더링 케이스 추가
- **수용 기준**:
  - [x] 유형이 "경기"일 때만 스코어·승패 필드가 화면에 표시된다
  - [x] 유형을 "레슨"으로 바꾸면 스코어·승패 필드가 사라진다
  - [x] 히스토리의 경기 카드에 스코어와 승/패가 표시된다
- **검증**: `bun run test -- RecordForm RecordCard`

---

### Task 5: 플레이북 탭 (자동 갱신 + 빈 상태 + FAB 버블)

- **담당 시나리오**: Scenario 3 (full), Scenario 4 (full)
- **크기**: M (3 소스 파일)
- **의존성**: Task 4
- **참조**:
  - shadcn — `Card`, `Empty` (빈 상태)
  - wireframe — screen-1 (플레이북 항목 있음), screen-2 (플레이북 빈+버블)
- **구현 대상**:
  - `components/diary/PlaybookList.tsx` — 번호·항목 목록 + 체크리스트 카드 하단에 "마지막 갱신: [날짜 시각]" + 빈 상태 ("아직 기록이 없어요."); `'use client'`
  - `components/diary/PlaybookList.test.tsx`
  - `components/diary/FabBubble.tsx` — FAB 위 말풍선 ("첫 기록을 남겨보세요!"); 기록 0개일 때만 표시
  - `app/(main)/playbook/page.tsx` (Modify) — PlaybookList + useDiary 연결
  - `app/(main)/layout.tsx` (Modify) — FabBubble 조건부 표시 (entries.length === 0 + playbook 탭 활성 시)
- **수용 기준**:
  - [x] 기록을 저장한 직후 플레이북 탭에 항목 목록이 표시된다
  - [x] 새 기록 저장 시 이전 플레이북 항목은 사라지고 새 항목으로 교체된다
  - [x] 플레이북 화면에 "마지막 갱신: [날짜 시각]"이 표시된다
  - [x] 기록이 0개일 때 "아직 기록이 없어요." 문구가 표시된다
  - [x] 기록이 0개일 때 FAB 위에 "첫 기록을 남겨보세요!" 말풍선이 표시된다
  - [x] FAB을 탭하면 `/add`로 이동한다
- **검증**:
  - `bun run test -- PlaybookList`
  - Browser MCP — 기록 없는 상태로 `/playbook` 진입, 빈 상태 + 말풍선 확인; 기록 추가 후 플레이북 항목 확인, 증거 `artifacts/tennis-playbook/evidence/task5.png` 저장

---

### Checkpoint: Tasks 4-5 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 경기 기록 추가 + 플레이북 자동 갱신 + 빈 상태 + FAB 버블이 end-to-end로 동작

---

### Task 6: 기록 편집

- **담당 시나리오**: Scenario 5 (full)
- **크기**: S (2 소스 파일)
- **의존성**: Task 3
- **참조**:
  - shadcn — `Button` (저장/취소)
  - wireframe — screen-6 (기록 편집)
- **구현 대상**:
  - `app/(main)/edit/[id]/page.tsx` — 기존 데이터로 채워진 RecordForm; 저장 → `/history` 복귀 + 플레이북 갱신; `'use client'`
  - `components/diary/RecordCard.tsx` (Modify) — 편집 버튼 → `/edit/[id]` 이동 연결
- **수용 기준**:
  - [x] 편집 버튼 클릭 시 해당 기록의 날짜·유형·소요 시간·느낀점이 폼에 채워진다
  - [x] 편집 후 저장하면 히스토리 카드에 수정 내용이 반영된다
  - [x] 편집 저장 시 플레이북이 갱신된다
  - [x] 취소 버튼 클릭 시 변경 없이 히스토리 화면으로 복귀한다
- **검증**:
  - Browser MCP — 히스토리 카드 편집 클릭, 폼 내용 확인, 수정 후 저장, 히스토리 변경 확인, 증거 `artifacts/tennis-playbook/evidence/task6.png` 저장

---

### Task 7: 기록 삭제

- **담당 시나리오**: Scenario 6 (full)
- **크기**: S (1 소스 파일)
- **의존성**: Task 3
- **참조**:
  - shadcn — `AlertDialog`
  - wireframe — screen-7 (삭제 확인)
- **구현 대상**:
  - `components/diary/DeleteDialog.tsx` — AlertDialog 래퍼; "기록을 삭제하시겠습니까?" + 취소/삭제 버튼; `'use client'`
  - `components/diary/DeleteDialog.test.tsx`
  - `components/diary/RecordCard.tsx` (Modify) — DeleteDialog 연결
- **수용 기준**:
  - [x] 삭제 버튼 탭 시 "기록을 삭제하시겠습니까?" 확인 다이얼로그가 표시된다
  - [x] 확인 후 해당 카드가 히스토리에서 사라진다
  - [x] 삭제 후 플레이북이 남은 기록 기반으로 갱신된다
  - [x] 모든 기록이 삭제되면 플레이북에 "아직 기록이 없어요." 메시지가 표시된다
- **검증**: `bun run test -- DeleteDialog`

---

### Task 8: 히스토리 시간 요약

- **담당 시나리오**: Scenario 7 (full)
- **크기**: S (1 소스 파일)
- **의존성**: Task 3
- **참조**:
  - shadcn — `ToggleGroup` (주/월/년/전체), `Card`
  - wireframe — screen-3 상단 요약 카드
- **구현 대상**:
  - `components/diary/TimeSummary.tsx` — 기간 탭(주/월/년/전체) + 해당 기간 소요 시간 합산; `formatDuration` 사용; `'use client'`
  - `components/diary/TimeSummary.test.tsx`
  - `app/(main)/history/page.tsx` (Modify) — TimeSummary를 목록 상단에 추가
- **수용 기준**:
  - [x] 기본으로 이번 달 기록의 소요 시간 합계가 표시된다
  - [x] "주" 탭을 누르면 이번 주 합계로, "년" 탭을 누르면 올해 합계로 바뀐다
  - [x] "전체" 탭을 누르면 첫 기록 날짜부터의 누적 합계가 "YY년 MM월 DD일부터 X시간 Y분" 형식으로 표시된다
  - [x] 해당 기간에 기록이 없으면 "0분"이 표시된다
- **검증**: `bun run test -- TimeSummary`

---

### Checkpoint: Tasks 6-8 이후
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 편집·삭제·히스토리 시간 요약이 end-to-end로 동작

---

### Task 9: 랜딩 페이지 + 다크 모드

- **담당 시나리오**: 없음 (불변 규칙: "다크 모드"; spec 범위: "랜딩 페이지")
- **크기**: S (2 소스 파일 수정)
- **의존성**: Task 2
- **참조**:
  - next-best-practices — `hydration-error` (다크 모드 flicker 방지)
  - wireframe — screen-0 (랜딩)
- **구현 대상**:
  - `app/page.tsx` (Modify) — 랜딩 페이지 (앱 소개 + 시작하기 버튼); `localStorage hasVisited` 없을 때만 표시, 있으면 `/playbook` 리다이렉트
  - `app/layout.tsx` (Modify) — `ThemeProvider` `defaultTheme="system"` 변경
- **수용 기준**:
  - [x] `hasVisited` 플래그 없는 최초 진입 시 랜딩 페이지가 표시된다
  - [x] "시작하기" 버튼 클릭 시 `/playbook`으로 이동한다
  - [x] 재방문(`hasVisited` 있음) 시 `/`에서 `/playbook`으로 즉시 리다이렉트된다
  - [x] 기기 다크 모드 설정 변경 시 앱 전체가 자동으로 전환된다
- **검증**:
  - Browser MCP — localStorage 초기화 후 `/` 진입, 랜딩 확인, 시작하기 클릭, `/playbook` 도달 확인, 증거 `artifacts/tennis-playbook/evidence/task9.png` 저장
  - Human review — 시스템 다크 모드 토글 후 전체 화면 전환 확인; 리뷰어: 개발자; 기준: 모든 화면이 다크/라이트로 플리커 없이 전환됨

---

### Checkpoint: Task 9 이후 (Final)
- [ ] 모든 테스트 통과: `bun run test`
- [ ] 빌드 성공: `bun run build`
- [ ] 랜딩 → 플레이북 → 기록 추가 → 히스토리 → 편집 → 삭제 전체 플로우 end-to-end 동작
- [ ] 다크 모드 시스템 설정 자동 연동 동작
- [ ] Human review — Vercel 배포 후 프로덕션 URL에서 전체 플로우 확인

## 미결정 항목

없음 (플레이북 항목 수 5개로 결정)
