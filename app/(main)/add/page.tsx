"use client";

import { useRouter } from "next/navigation";
import { RecordForm, type RecordFormValues } from "@/components/diary/RecordForm";
import { useDiary } from "@/hooks/useDiary";
import type { DiaryEntry } from "@/types/diary";

export default function AddPage() {
  const router = useRouter();
  const { addEntry } = useDiary();

  function handleSubmit(values: RecordFormValues) {
    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...values,
    };
    addEntry(entry);
    router.push("/playbook");
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">기록 추가</h1>
      <RecordForm onSubmit={handleSubmit} onCancel={() => router.back()} />
    </div>
  );
}
