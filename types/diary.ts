export type DiaryEntryType = "lesson" | "match";

export type MatchResult = "win" | "lose";

export interface DiaryEntry {
  id: string;
  type: DiaryEntryType;
  date: string;
  duration: number;
  notes: string;
  score?: string;
  result?: MatchResult;
  createdAt: string;
}

export interface PlaybookItem {
  id: string;
  text: string;
}

export interface Playbook {
  items: PlaybookItem[];
  updatedAt: string;
}
