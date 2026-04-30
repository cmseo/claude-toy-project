import type { DiaryEntry } from "@/types/diary";

const TYPE_LABELS: Record<string, string> = {
  lesson: "레슨",
  match: "경기",
};

export function buildPrompt(entries: DiaryEntry[]): string {
  const diary = entries
    .map(
      (entry) =>
        `[${entry.date} / ${TYPE_LABELS[entry.type] ?? entry.type}] ${entry.notes}`
    )
    .join("\n");

  return `당신은 테니스 코치입니다. 아래는 사용자의 테니스 다이어리 기록입니다.

${diary}

위 기록을 모두 분석하여, 다음 경기 전에 30초 안에 읽을 수 있는 한국어 행동 지침 체크리스트 5개를 생성하세요.

규칙:
- 각 항목은 구체적이고 실천 가능한 행동으로 작성
- 한국어로 작성
- 최근 기록과 반복되는 패턴에 우선순위를 부여
- 각 항목은 한 문장, 20자 이내 권장
- JSON 배열로 반환: ["항목1", "항목2", "항목3", "항목4", "항목5"]`;
}
