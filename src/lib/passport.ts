import { useCallback, useEffect, useState } from "react";

import { LOCATIONS, SECTORS, type SectorId, TOTAL_LOCATIONS } from "./locations";

const STORAGE_KEY = "lenk-quest-passport-v1";

export interface UnlockedEntry {
  locationId: string;
  photo: string;
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

  const unlock = useCallback((locationId: string, photo: string) => {
    const next = {
      ...read(),
      [locationId]: { locationId, photo, unlockedAt: new Date().toISOString() },
    };
    write(next);
  }, []);

  const reset = useCallback(() => write({}), []);

  const remove = useCallback((locationId: string) => {
    const next = { ...read() };
    delete next[locationId];
    write(next);
  }, []);

  const entries = LOCATIONS.map((l) => state[l.id]).filter(Boolean) as UnlockedEntry[];

  const sectorProgress = (sector: SectorId) => {
    const all = LOCATIONS.filter((l) => l.sector === sector);
    return { current: all.filter((l) => state[l.id]).length, total: all.length };
  };

  return {
    state,
    hydrated,
    unlock,
    reset,
    remove,
    entries,
    scanned: entries.length,
    total: TOTAL_LOCATIONS,
    isUnlocked: (id: string) => Boolean(state[id]),
    sectorProgress,
    sectors: SECTORS,
  };
}
