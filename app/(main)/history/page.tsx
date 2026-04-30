"use client";

import { useMemo, useState } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { DeleteDialog } from "@/components/diary/DeleteDialog";
import { RecordCard } from "@/components/diary/RecordCard";
import { TimeSummary } from "@/components/diary/TimeSummary";
import { useDiary } from "@/hooks/useDiary";
import type { DiaryEntry } from "@/types/diary";

export default function HistoryPage() {
  const { entries, hydrated, deleteEntry } = useDiary();
  const [pendingDelete, setPendingDelete] = useState<DiaryEntry | null>(null);

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [entries]);

  function handleConfirmDelete() {
    if (pendingDelete) {
      deleteEntry(pendingDelete.id);
      setPendingDelete(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">히스토리</h1>
      {hydrated && <TimeSummary entries={entries} />}
      {hydrated && sorted.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>기록이 없어요</EmptyTitle>
            <EmptyDescription>첫 기록을 남겨보세요.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent />
        </Empty>
      )}
      <div className="flex flex-col gap-3">
        {sorted.map((entry) => (
          <RecordCard key={entry.id} entry={entry} onDelete={setPendingDelete} />
        ))}
      </div>
      <DeleteDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
