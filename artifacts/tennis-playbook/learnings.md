# Tennis Playbook — Learnings

## Step 2: Task 실행 순서

plan.md의 1→2→3→CP1→4→5→CP2→6→7→8→CP3→9→CP4 그대로 따른다.

근거:
- Task 1(types/lib)은 다른 모든 Task의 import 기반 → 1번
- Task 2(hooks/routing)는 Task 3의 페이지 진입점 → 2번
- Task 3(레슨+히스토리)은 vertical slice → Task 4(경기), 6(편집), 7(삭제), 8(요약)이 모두 의존
- Task 4(경기)는 Task 3의 RecordForm 확장 — 단독 vertical slice
- Task 5(플레이북)는 Task 4 이후 (시뮬레이션은 모든 entry 사용)
- Task 6/7/8은 Task 3 이후 병렬 가능하지만 plan.md 순서를 따라 단순성 유지
- Task 9(랜딩+다크)는 다른 변경에 영향 받지 않으므로 마지막

재정렬·병합 결정 없음 — plan.md 그대로.

---

---
category: tooling
applied: rule
---
## vitest는 e2e/ 폴더를 명시적으로 제외해야 한다

**상황**: CP1 `bun run test` 실행 시 Vitest가 `e2e/smoke.spec.ts`(Playwright)를 import해서 "test() called in a wrong place" 에러 발생.
**판단**: `vitest.config.ts`의 `test.exclude` 배열에 `"e2e/**"` 추가. 근본 원인 수정 — 우회 없음. CLAUDE.md Testing 섹션이 Vitest는 colocated, Playwright는 `e2e/`로 분리한다고 명시했으므로 일반화 가능한 규칙.
**다시 마주칠 가능성**: 낮음 — 한번 고치면 끝나는 설정. 하지만 동일 stack 새 프로젝트에서 재발 가능.

---

---
category: tooling
applied: rule
---
## radix ToggleGroup type=single → role="radio"

**상황**: Task 4 RecordForm 테스트에서 `getByRole("button", { name: "레슨" })`이 실패. 렌더 출력을 보니 `<button role="radio" aria-checked>`로 나오는 걸 확인.
**판단**: type="single"인 ToggleGroupItem은 RadioGroup semantics를 따른다 (radix). 테스트 쿼리는 `getByRole("radio", ...)` 사용. type="multiple"이면 button. 일반화 가능.
**다시 마주칠 가능성**: 높음 — 이 프로젝트에서 ToggleGroup을 더 쓸 가능성 높고, 다른 프로젝트도 마찬가지.

---

---
category: code-review
applied: rule
---
## 리뷰어가 지적한 "Critical"이 실은 테스트 커버리지 갭이었다

**상황**: code-reviewer가 `useDiary.updateEntry`/`deleteEntry`가 storage 실패 시 invariant("기록 저장 실패 시 갱신이 발생하지 않는다")를 어긴다고 Critical로 표시. 코드를 다시 보니 storage 함수가 throw하면 throw가 propagate되어 후속 라인이 실행되지 않으므로 runtime은 안전. 하지만 테스트 커버리지는 `addEntry` 한 케이스뿐이었다.
**판단**: runtime 수정은 불필요(거짓 양성). 그러나 테스트 갭은 실재 → `updateEntry`/`deleteEntry`에 대한 storage 실패 테스트 2개 추가. 이렇게 하면 (1) reviewer의 우려가 해소되고 (2) 미래 회귀를 막는 실제 가드가 된다.
**다시 마주칠 가능성**: 높음 — invariant가 코드는 만족해도 테스트가 같은 invariant를 모든 변형에 대해 verify하지 않는 패턴은 흔하다. "invariant test는 모든 분기에 대해 작성한다"가 일반화 가능한 규칙.

---

---
category: code-review
applied: not-yet
---
## useDiary는 페이지마다 별도 인스턴스 — 공유 상태 아님

**상황**: code-reviewer가 PlaybookPage·HistoryPage·AddPage·EditPage가 각자 `useDiary()`를 호출해 별개 상태를 만든다고 Important로 지적. 현재는 페이지 간 full remount + localStorage가 source of truth이므로 동작.
**판단**: 즉시 수정 안 함. 이번 cycle 범위 밖, 동작에 영향 없음. shared layout이나 multi-tab 시나리오 들어오면 (main)/layout.tsx에 React Context 도입 필요. learnings에 메모만.
**다시 마주칠 가능성**: 중간 — 같은 stack에서 재발 가능. compound 단계에서 비슷한 신호 누적되면 "client-only feature는 layout context로 lift" 규칙 후보.

---

---
category: code-review
applied: discarded
---
## (main)/layout.tsx에 'use client' 강제는 잘못된 조언

**상황**: reviewer가 layout.tsx가 TabBar(클라이언트 컴포넌트)를 import하므로 직접 `'use client'` 마킹해야 한다고 Important로 지적. plan.md Task 2에도 동일 문구 있었음.
**판단**: 기각. RSC가 client 컴포넌트를 import하는 것은 정상 패턴 — 'use client' boundary는 TabBar에서 자체적으로 그어진다. layout 자체에 'use client'를 붙이면 layout 트리 전체가 client 번들로 들어가 next-best-practices의 `rsc-boundaries` 가이드를 거스른다.
**다시 마주칠 가능성**: 중간 — plan/리뷰 모두에서 같은 오해가 자주 보임. "client 컴포넌트 import = 'use client' 마킹 불필요"는 명시화할 가치 있는 규칙.

---

---
category: code-review
applied: not-yet
---
## 작은 신호: Korean sentence split, formatDate null-safety, localStorage write quota

**상황**: reviewer Suggestion·Important에 깔린 약한 신호 3개:
- `lib/playbook.ts` 문장 분리 정규식이 한국어 마침표(`，`/`·`) 미커버
- `RecordCard.formatDate`가 빈/잘못된 ISO에 대해 `undefined.undefined.undefined` 가능
- `localStorage.setItem`의 QuotaExceeded는 silently 데이터 손실 가능 (현재는 throw 그대로 propagate)
**판단**: 모두 spec 범위 밖 또는 비현실적 엣지케이스 (date는 form validation으로 보장, notes는 quota 도달 전에 사용자가 알아챌 수준). 이번 cycle 변경 안 함. 누적되면 robustness 사이클에서 함께 처리.
**다시 마주칠 가능성**: 낮음 — 각각 별개 신호. 합쳐서 "client-storage robustness" 패턴으로 묶일 수 있음.

---
