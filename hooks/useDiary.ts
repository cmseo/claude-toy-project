"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DiaryEntry, Playbook } from "@/types/diary";
import {
  addEntry as storageAddEntry,
  deleteEntry as storageDeleteEntry,
  getEntries,
  getPlaybook,
  savePlaybook,
  updateEntry as storageUpdateEntry,
} from "@/lib/storage";

const STALE_KEY = "tennis-playbook:playbook-stale:v1";
const TIMEOUT_MS = 10_000;

export interface UseDiaryResult {
  entries: DiaryEntry[];
  playbook: Playbook | null;
  hydrated: boolean;
  isGenerating: boolean;
  generationError: string | null;
  addEntry: (entry: DiaryEntry) => void;
  updateEntry: (id: string, patch: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
  regeneratePlaybook: () => Promise<void>;
  isStale: boolean;
}

function markStale() {
  localStorage.setItem(STALE_KEY, "true");
}

function clearStale() {
  localStorage.removeItem(STALE_KEY);
}

function checkStale(): boolean {
  return localStorage.getItem(STALE_KEY) === "true";
}

export function useDiary(): UseDiaryResult {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setEntries(getEntries());
    setPlaybook(getPlaybook());
    setIsStale(checkStale());
    setHydrated(true);
  }, []);

  const regeneratePlaybook = useCallback(async () => {
    const currentEntries = getEntries();
    if (currentEntries.length === 0) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const response = await fetch("/api/playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: currentEntries }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "플레이북 생성에 실패했습니다");
      }

      const newPlaybook: Playbook = await response.json();
      savePlaybook(newPlaybook);
      clearStale();
      setPlaybook(newPlaybook);
      setIsStale(false);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setGenerationError("플레이북 생성 시간이 초과되었습니다");
      } else {
        setGenerationError(
          error instanceof Error ? error.message : "플레이북 생성에 실패했습니다"
        );
      }
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, []);

  const addEntry = useCallback((entry: DiaryEntry) => {
    storageAddEntry(entry);
    const next = getEntries();
    setEntries(next);
    markStale();
    setIsStale(true);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<DiaryEntry>) => {
    storageUpdateEntry(id, patch);
    const next = getEntries();
    setEntries(next);
    markStale();
    setIsStale(true);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    storageDeleteEntry(id);
    const next = getEntries();
    setEntries(next);
    markStale();
    setIsStale(true);
  }, []);

  return {
    entries,
    playbook,
    hydrated,
    isGenerating,
    generationError,
    addEntry,
    updateEntry,
    deleteEntry,
    regeneratePlaybook,
    isStale,
  };
}
