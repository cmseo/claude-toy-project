"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatDuration } from "@/lib/time";
import type { DiaryEntry } from "@/types/diary";

type Period = "week" | "month" | "year" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  week: "주",
  month: "월",
  year: "년",
  all: "전체",
};

interface TimeSummaryProps {
  entries: DiaryEntry[];
  now?: Date;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfYear(now: Date): Date {
  return new Date(now.getFullYear(), 0, 1);
}

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function sumWithin(entries: DiaryEntry[], from: Date | null): number {
  return entries
    .filter((e) => {
      if (from === null) return true;
      const dt = parseDate(e.date);
      return dt.getTime() >= from.getTime();
    })
    .reduce((acc, e) => acc + e.duration, 0);
}

function firstEntryDate(entries: DiaryEntry[]): Date | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
  return parseDate(sorted[0].date);
}

function formatFirstDate(d: Date): string {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}년 ${mm}월 ${dd}일`;
}

export function TimeSummary({ entries, now = new Date() }: TimeSummaryProps) {
  const [period, setPeriod] = useState<Period>("month");

  const total = useMemo(() => {
    if (period === "week") return sumWithin(entries, startOfWeek(now));
    if (period === "month") return sumWithin(entries, startOfMonth(now));
    if (period === "year") return sumWithin(entries, startOfYear(now));
    return sumWithin(entries, null);
  }, [entries, period, now]);

  const allFirst = period === "all" ? firstEntryDate(entries) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>총 소요 시간</span>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(v) => v && setPeriod(v as Period)}
            variant="outline"
            size="sm"
            aria-label="기간"
          >
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <ToggleGroupItem key={p} value={p}>
                {PERIOD_LABELS[p]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-0.5">
          {period === "all" && allFirst && (
            <p className="text-xs text-muted-foreground">
              {formatFirstDate(allFirst)}부터
            </p>
          )}
          <p className="text-2xl font-semibold">{formatDuration(total)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
