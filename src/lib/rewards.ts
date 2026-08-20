import type { SectorId } from "./locations";

/** Official static asset paths — never generated dynamically. */
const badgeWater = "/assets/insignia-agua.png";
const badgeSummit = "/assets/insignia-cumbres.png";
const badgeCulture = "/assets/insignia-tradicion.png";
const pinFront = "/assets/pin-gold-front.png";
const pinBack = "/assets/pin-gold-back.png";

export interface RouteBadge {
  sector: SectorId;
  /** Static insignia render shown on cards, modals and the passport showcase. */
  image: string;
  name: string;
  shortName: string;
}

export const ROUTE_BADGES: Record<SectorId, RouteBadge> = {
  water: {
    sector: "water",
    image: badgeWater,
    name: "Insignia Oficial de la Ruta del Agua",
    shortName: "Insignia del Agua",
  },
  summit: {
    sector: "summit",
    image: badgeSummit,
    name: "Insignia Oficial de la Ruta de Cumbres",
    shortName: "Insignia de Cumbres",
  },
  culture: {
    sector: "culture",
    image: badgeCulture,
    name: "Insignia Oficial de Tradición & AlpKultur",
    shortName: "Insignia de Tradición",
  },
};

/** Supreme reward for 8/8: a two-sided collector pin. */
export const GOLD_PIN = {
  name: "Lenk Gold / Imperial Edition",
  serial: "№ 0382",
  front: {
    image: pinFront,
    title: "Anverso",
    caption: "Cruz Suiza sobre el macizo del Wildstrubel",
  },
  back: {
    image: pinBack,
    title: "Reverso",
    lines: ["LENK GOLD EDITION", "SWITZERLAND • 8/8 TRAILS", "CERTIFIED ALPINIST", "№ 0382"],
  },
} as const;
