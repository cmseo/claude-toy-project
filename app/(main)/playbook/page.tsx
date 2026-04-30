"use client";

import { useEffect, useRef } from "react";
import { FabBubble } from "@/components/diary/FabBubble";
import { PlaybookList } from "@/components/diary/PlaybookList";
import { useDiary } from "@/hooks/useDiary";

export default function PlaybookPage() {
  const {
    entries,
    playbook,
    hydrated,
    isGenerating,
    isStale,
    regeneratePlaybook,
  } = useDiary();
  const showBubble = hydrated && entries.length === 0;
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (hydrated && isStale && entries.length > 0 && !hasTriggered.current) {
      hasTriggered.current = true;
      regeneratePlaybook().finally(() => {
        hasTriggered.current = false;
      });
    }
  }, [hydrated, isStale, entries.length, regeneratePlaybook]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">플레이북</h1>
      {hydrated && (
        <PlaybookList
          playbook={playbook}
          hasEntries={entries.length > 0}
          isLoading={isGenerating}
          onRefresh={regeneratePlaybook}
        />
      )}
      <FabBubble visible={showBubble} />
    </div>
  );
}
