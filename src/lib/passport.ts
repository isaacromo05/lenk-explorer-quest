import { useCallback, useEffect, useState } from "react";

import { LOCATIONS, SECTORS, type SectorId, TOTAL_LOCATIONS } from "./locations";

const STORAGE_KEY = "lenk-quest-passport-v1";

export interface UnlockedEntry {
  locationId: string;
  /** null while the explorer chose "hacer foto más tarde". */
  photo: string | null;
  unlockedAt: string;
}

export type PassportState = Record<string, UnlockedEntry>;

function read(): PassportState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as PassportState) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

const listeners = new Set<(s: PassportState) => void>();

function write(state: PassportState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — keep in-memory state */
  }
  listeners.forEach((fn) => fn(state));
}

/** Passport progress persisted in LocalStorage, shared across mounted components. */
export function usePassport() {
  const [state, setState] = useState<PassportState>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(read());
    setHydrated(true);
    const listener = (s: PassportState) => setState({ ...s });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  /** Mark a location as unlocked (scan-now) and optionally attach a photo (snap-later). */
  const unlock = useCallback((locationId: string, photo: string | null = null) => {
    const current = read();
    const existing = current[locationId];
    const next = {
      ...current,
      [locationId]: {
        locationId,
        photo: photo ?? existing?.photo ?? null,
        unlockedAt: existing?.unlockedAt ?? new Date().toISOString(),
      },
    };
    write(next);
  }, []);

  /** Attach or replace the photo of an already unlocked location. */
  const setPhoto = useCallback((locationId: string, photo: string | null) => {
    const current = read();
    const existing = current[locationId];
    if (!existing) return;
    write({ ...current, [locationId]: { ...existing, photo } });
  }, []);

  const reset = useCallback(() => write({}), []);

  const remove = useCallback((locationId: string) => {
    const next = { ...read() };
    delete next[locationId];
    write(next);
  }, []);

  const entries = LOCATIONS.map((l) => state[l.id]).filter(Boolean) as UnlockedEntry[];
  const photoEntries = entries.filter((e): e is UnlockedEntry & { photo: string } => Boolean(e.photo));

  const sectorProgress = (sector: SectorId) => {
    const all = LOCATIONS.filter((l) => l.sector === sector);
    return { current: all.filter((l) => state[l.id]).length, total: all.length };
  };

  return {
    state,
    hydrated,
    unlock,
    setPhoto,
    reset,
    remove,
    entries,
    photoEntries,
    scanned: entries.length,
    photographed: photoEntries.length,
    total: TOTAL_LOCATIONS,
    isUnlocked: (id: string) => Boolean(state[id]),
    hasPhoto: (id: string) => Boolean(state[id]?.photo),
    sectorProgress,
    sectors: SECTORS,
  };
}
