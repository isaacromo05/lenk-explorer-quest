export type SectorId = "water" | "summit" | "culture";

export interface Sector {
  id: SectorId;
  name: string;
  mascot: string;
  mascotEmoji: string;
}

export interface Location {
  id: string;
  name: string;
  sector: SectorId;
  hint: string;
}

export const SECTORS: Record<SectorId, Sector> = {
  water: { id: "water", name: "Ruta del Agua", mascot: "Guardián del Agua", mascotEmoji: "🌊" },
  summit: { id: "summit", name: "Ruta de las Cumbres", mascot: "Guardián Íbice de Cumbres", mascotEmoji: "🏔️" },
  culture: { id: "culture", name: "Ruta de la Tradición & AlpKultur", mascot: "Excursionista Guardián de Tradición", mascotEmoji: "🥾" },
};

export const LOCATIONS: Location[] = [
  { id: "simmenfalle", name: "Simmenfälle", sector: "water", hint: "Cascadas del Simme" },
  { id: "sibe-brunne", name: "Siebenbrunnen", sector: "water", hint: "Las siete fuentes" },
  { id: "iffigsee", name: "Iffigsee", sector: "water", hint: "El lago del Iffig" },
  { id: "betelberg", name: "Betelberg", sector: "summit", hint: "Mirador panorámico" },
  { id: "gryden", name: "Gryden", sector: "summit", hint: "Prados alpinos" },
  { id: "wallbach", name: "Wallbachschlucht", sector: "summit", hint: "Sendero del arroyo" },
  { id: "lenkerseeli", name: "Lenkerseeli", sector: "culture", hint: "El lago del pueblo" },
  { id: "metschstand", name: "Metschstand", sector: "culture", hint: "Tradición AlpKultur" },
];

export const TOTAL_LOCATIONS = LOCATIONS.length;

/** Resolve a scanned QR payload (id, name or lenk://<id> URL) to a known location. */
export function resolveLocation(raw: string): Location | undefined {
  const value = raw.trim().toLowerCase().replace(/^lenk:\/\//, "").replace(/\/+$/, "");
  const tail = value.split("/").pop() ?? value;
  return LOCATIONS.find(
    (l) => l.id === tail || l.name.toLowerCase() === tail || l.id === value || l.name.toLowerCase() === value,
  );
}

export function locationsBySector(sector: SectorId) {
  return LOCATIONS.filter((l) => l.sector === sector);
}
