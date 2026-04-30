"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { RecordForm, type RecordFormValues } from "@/components/diary/RecordForm";
import { useDiary } from "@/hooks/useDiary";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { entries, hydrated, updateEntry } = useDiary();

  if (!hydrated) {
    return <div className="p-4">불러오는 중…</div>;
  }

  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">기록을 찾을 수 없어요</h1>
        <p className="text-sm text-muted-foreground">삭제된 기록일 수 있어요.</p>
      </div>
    );
  }

  function handleSubmit(values: RecordFormValues) {
    updateEntry(id, values);
    router.push("/history");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">기록 편집</h1>
      <RecordForm
        initialValues={{
          type: entry.type,
          date: entry.date,
          duration: entry.duration,
          notes: entry.notes,
          score: entry.score,
          result: entry.result,
        }}
        submitLabel="저장"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/history")}
      />
    </div>
  );
}
