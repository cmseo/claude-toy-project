"use client";

import { useEffect } from "react";
import { FabBubble } from "@/components/diary/FabBubble";
import { PlaybookList } from "@/components/diary/PlaybookList";
import { useDiary } from "@/hooks/useDiary";

export default function PlaybookPage() {
  const { entries, playbook, hydrated, isGenerating, isStale, regeneratePlaybook } =
    useDiary();
  const showBubble = hydrated && entries.length === 0;

  useEffect(() => {
    if (hydrated && isStale && entries.length > 0 && !isGenerating) {
      regeneratePlaybook();
    }
  }, [hydrated, isStale, entries.length, isGenerating, regeneratePlaybook]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">플레이북</h1>
      {hydrated && (
        <PlaybookList
          playbook={playbook}
          hasEntries={entries.length > 0}
          isLoading={isGenerating}
        />
      )}
      <FabBubble visible={showBubble} />
    </div>
  );
}
