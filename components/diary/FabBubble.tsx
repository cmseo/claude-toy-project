"use client";

interface FabBubbleProps {
  visible: boolean;
}

export function FabBubble({ visible }: FabBubbleProps) {
  if (!visible) return null;
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-md justify-center"
    >
      <div className="relative rounded-full bg-foreground px-4 py-2 text-sm text-background shadow-lg">
        첫 기록을 남겨보세요!
        <span
          aria-hidden
          className="absolute left-1/2 top-full -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-foreground"
        />
      </div>
    </div>
  );
}
