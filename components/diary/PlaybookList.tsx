"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Loader2, RefreshCw } from "lucide-react";
import type { Playbook } from "@/types/diary";

interface PlaybookListProps {
  playbook: Playbook | null;
  hasEntries: boolean;
  isLoading: boolean;
  onRefresh?: () => void;
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

export function PlaybookList({ playbook, hasEntries, isLoading, onRefresh }: PlaybookListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">플레이북 생성 중...</p>
        </CardContent>
      </Card>
    );
  }

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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>경기 전 체크리스트</CardTitle>
          <CardDescription>최근 느낀점에서 자동 선별된 항목</CardDescription>
        </div>
        <Button variant="ghost" size="icon" aria-label="새로고침" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
