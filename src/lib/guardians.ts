import type { SectorId } from "./locations";

/** Official static asset paths — never generated dynamically. */
const GUARDIAN_IMAGES = {
  water: "/assets/guardian-agua.png",
  summit: "/assets/guardian-cumbres.png",
  culture: "/assets/guardian-tradicion.png",
} as const;


export interface Guardian {
  /** 3D mascot render for the sector. */
  image: string;
  name: string;
  /** Emoji used on the route badge / insignia. */
  badgeEmoji: string;
  badgeName: string;
  /** Short legend told in the sector modal. */
  story: string;
}

export const GUARDIANS: Record<SectorId, Guardian> = {
  water: {
    image: GUARDIAN_IMAGES.water,
    name: "Guardián del Agua",
    badgeEmoji: "🌊",
    badgeName: "Insignia de la Ruta del Agua",
    story:
      "Nacido de la primera gota de deshielo del glaciar del Wildstrubel, el Guardián del Agua vigila las cascadas del Simme. Dicen que cada salto de agua guarda una de sus risas, y que solo quienes visitan sus tres fuentes escuchan la melodía completa del valle.",
  },
  summit: {
    image: GUARDIAN_IMAGES.summit,
    name: "Guardián Íbice de Cumbres",
    badgeEmoji: "🏔️",
    badgeName: "Insignia de Cumbres",
    story:
      "El Íbice de Cumbres salta entre riscos desde antes de que existieran los senderos. Conoce cada cornisa del Betelberg y solo muestra el panorama secreto del Simmental a los exploradores que alcanzan sus tres miradores.",
  },
  culture: {
    image: GUARDIAN_IMAGES.culture,
    name: "Guardián Queso Berner Alpkäse",
    badgeEmoji: "🧀",
    badgeName: "Insignia de Tradición",
    story:
      "Curado durante generaciones en los chalets de AlpKultur, el Guardián Berner Alpkäse custodia las canciones, los cencerros y las recetas de La Lenk. Comparte su historia con quien recorre los dos hitos de la tradición del valle.",
  },
};
