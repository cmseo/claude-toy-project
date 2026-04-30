"use client";

import { useCallback, useEffect, useState } from "react";
import type { DiaryEntry, Playbook } from "@/types/diary";
import {
  addEntry as storageAddEntry,
  deleteEntry as storageDeleteEntry,
  getEntries,
  getPlaybook,
  savePlaybook,
  updateEntry as storageUpdateEntry,
} from "@/lib/storage";
import { generatePlaybook } from "@/lib/playbook";

export interface UseDiaryResult {
  entries: DiaryEntry[];
  playbook: Playbook | null;
  hydrated: boolean;
  addEntry: (entry: DiaryEntry) => void;
  updateEntry: (id: string, patch: Partial<DiaryEntry>) => void;
  deleteEntry: (id: string) => void;
}

function buildPlaybook(entries: DiaryEntry[]): Playbook {
  return {
    items: generatePlaybook(entries),
    updatedAt: new Date().toISOString(),
  };
}

export function useDiary(): UseDiaryResult {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [playbook, setPlaybook] = useState<Playbook | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setEntries(getEntries());
    setPlaybook(getPlaybook());
    setHydrated(true);
  }, []);

  const addEntry = useCallback((entry: DiaryEntry) => {
    storageAddEntry(entry);
    const next = getEntries();
    const nextPlaybook = buildPlaybook(next);
    savePlaybook(nextPlaybook);
    setEntries(next);
    setPlaybook(nextPlaybook);
  }, []);

  const updateEntry = useCallback((id: string, patch: Partial<DiaryEntry>) => {
    storageUpdateEntry(id, patch);
    const next = getEntries();
    const nextPlaybook = buildPlaybook(next);
    savePlaybook(nextPlaybook);
    setEntries(next);
    setPlaybook(nextPlaybook);
  }, []);

  const deleteEntry = useCallback((id: string) => {
    storageDeleteEntry(id);
    const next = getEntries();
    const nextPlaybook = buildPlaybook(next);
    savePlaybook(nextPlaybook);
    setEntries(next);
    setPlaybook(nextPlaybook);
  }, []);

  return { entries, playbook, hydrated, addEntry, updateEntry, deleteEntry };
}
