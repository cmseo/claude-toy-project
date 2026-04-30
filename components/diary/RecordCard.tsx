"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/time";
import type { DiaryEntry } from "@/types/diary";

interface RecordCardProps {
  entry: DiaryEntry;
  onDelete?: (entry: DiaryEntry) => void;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export function RecordCard({ entry, onDelete }: RecordCardProps) {
  const typeLabel = entry.type === "lesson" ? "레슨" : "경기";
  return (
    <Card data-testid="record-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge variant={entry.type === "match" ? "default" : "secondary"}>
            {typeLabel}
          </Badge>
          <span>{formatDate(entry.date)}</span>
          <span className="text-muted-foreground">· {formatDuration(entry.duration)}</span>
        </CardTitle>
        <CardAction>
          <div className="flex gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="기록 편집">
              <Link href={`/edit/${entry.id}`}>
                <Pencil />
              </Link>
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="기록 삭제"
                onClick={() => onDelete(entry)}
              >
                <Trash2 />
              </Button>
            )}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {entry.type === "match" && (entry.score || entry.result) && (
          <div className="flex items-center gap-2 text-sm">
            {entry.score && <span>스코어 {entry.score}</span>}
            {entry.result && (
              <Badge variant={entry.result === "win" ? "default" : "secondary"}>
                {entry.result === "win" ? "승" : "패"}
              </Badge>
            )}
          </div>
        )}
        {entry.notes && (
          <p className="whitespace-pre-line text-sm text-muted-foreground">{entry.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
