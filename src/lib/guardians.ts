import type { SectorId } from "./locations";

/** Official static asset paths — never generated dynamically. */
const GUARDIAN_IMAGES = {
  water: "/assets/guardian-agua-removebg-preview.png",
  summit: "/assets/guardian-cumbres.png",
  culture: "/assets/guardian-tradicion.png",
} as const;

/** Optional 3D models (.glb). Files that are not published yet fall back to the PNG. */
const GUARDIAN_MODELS = {
  water: "/assets/figura-3d-preview.glb",
  summit: "/assets/guardian-cumbres.glb",
  culture: "/assets/guardian-tradicion.glb",
} as const;

export interface Guardian {
  /** Stable id of the guardian, e.g. "guardian-agua". */
  id: string;
  /** 3D mascot render for the sector. */
  image: string;
  /** Path to the .glb collectible model, when available. */
  model3d: string;
  name: string;
  /** Human readable route name. */
  sector: string;
  /** Short product/collection description. */
  description: string;
  /** Emoji used on the route badge / insignia. */
  badgeEmoji: string;
  badgeName: string;
  /** Short legend told in the sector modal. */
  story: string;
}

export const GUARDIANS: Record<SectorId, Guardian> = {
  water: {
    id: "guardian-agua",
    image: GUARDIAN_IMAGES.water,
    model3d: GUARDIAN_MODELS.water,
    name: "Guardián del Agua",
    sector: "Ruta del Agua",
    description: "Espíritu de agua cristalina de las cascadas de Simmenfälle e Iffigfall.",
    badgeEmoji: "🌊",
    badgeName: "Insignia de la Ruta del Agua",
    story:
      "Nacido de la primera gota de deshielo del glaciar del Wildstrubel, el Guardián del Agua vigila las cascadas del Simme. Dicen que cada salto de agua guarda una de sus risas, y que solo quienes visitan sus tres fuentes escuchan la melodía completa del valle.",
  },
  summit: {
    id: "guardian-cumbres",
    image: GUARDIAN_IMAGES.summit,
    model3d: GUARDIAN_MODELS.summit,
    name: "Íbice Guardián de Cumbres",
    sector: "Ruta de las Cumbres",
    description: "Ágil íbice de las cumbres de Betelberg y los acantilados de Gryden.",
    badgeEmoji: "🏔️",
    badgeName: "Insignia de Cumbres",
    story:
      "El Íbice de Cumbres salta entre riscos desde antes de que existieran los senderos. Conoce cada cornisa del Betelberg y solo muestra el panorama secreto del Simmental a los exploradores que alcanzan sus tres miradores.",
  },
  culture: {
    id: "guardian-tradicion",
    image: GUARDIAN_IMAGES.culture,
    model3d: GUARDIAN_MODELS.culture,
    name: "Queso Alpino Guardián de Tradición",
    sector: "Ruta Tradición & AlpKultur",
    description: "Cuña de queso Berner Alpkäse con cencerro, símbolo de la cultura de Lenk.",
    badgeEmoji: "🧀",
    badgeName: "Insignia de Tradición",
    story:
      "Curado durante generaciones en los chalets de AlpKultur, el Guardián Berner Alpkäse custodia las canciones, los cencerros y las recetas de La Lenk. Comparte su historia con quien recorre los dos hitos de la tradición del valle.",
  },
};

/** Ordered list for selectors/tabs. */
export const GUARDIAN_LIST = [
  { sector: "water" as SectorId, emoji: "💧", tab: "Guardián del Agua" },
  { sector: "summit" as SectorId, emoji: "🐐", tab: "Íbice de Cumbres" },
  { sector: "culture" as SectorId, emoji: "🧀", tab: "Queso de Tradición" },
];
