"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import type { Playbook } from "@/types/diary";

interface PlaybookListProps {
  playbook: Playbook | null;
  hasEntries: boolean;
}

function formatUpdatedAt(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`;
}

export function PlaybookList({ playbook, hasEntries }: PlaybookListProps) {
  if (!hasEntries || !playbook || playbook.items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>아직 기록이 없어요.</EmptyTitle>
          <EmptyDescription>기록을 남기면 플레이북이 자동으로 채워져요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>경기 전 체크리스트</CardTitle>
        <CardDescription>최근 느낀점에서 자동 선별된 항목</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="flex flex-col gap-3">
          {playbook.items.map((item, index) => (
            <li key={item.id} className="flex gap-3 text-sm">
              <span className="font-medium text-muted-foreground">{index + 1}.</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ol>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          마지막 갱신: {formatUpdatedAt(playbook.updatedAt)}
        </p>
      </CardFooter>
    </Card>
  );
}
