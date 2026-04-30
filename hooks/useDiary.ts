"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiaryEntry, Playbook, PlaybookItem } from "@/types/diary";
import {
  addEntry as storageAddEntry,
  deleteEntry as storageDeleteEntry,
  getEntries,
  getPlaybook,
  savePlaybook,
  updateEntry as storageUpdateEntry,
} from "@/lib/storage";
import { pickRandomPlaybook } from "@/lib/playbook";

const STALE_KEY = "tennis-playbook:playbook-stale:v1";

export interface UseDiaryResult {
  entries: DiaryEntry[];
  playbook: Playbook | null;
  hydrated: boolean;
  isGenerating: boolean;
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
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    setEntries(getEntries());
    setPlaybook(getPlaybook());
    setIsStale(checkStale());
    setHydrated(true);
  }, []);

  const regeneratePlaybook = useCallback(async () => {
    const currentEntries = getEntries();
    if (currentEntries.length === 0) return;

    setIsGenerating(true);

    const items: PlaybookItem[] = pickRandomPlaybook(currentEntries);
    const newPlaybook: Playbook = {
      items,
      updatedAt: new Date().toISOString(),
    };

    savePlaybook(newPlaybook);
    clearStale();
    setPlaybook(newPlaybook);
    setIsStale(false);
    setIsGenerating(false);
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
    addEntry,
    updateEntry,
    deleteEntry,
    regeneratePlaybook,
    isStale,
  };
}
