import badgeCulture from "@/assets/illustrations/badge-culture.png";
import badgeSummit from "@/assets/illustrations/badge-summit.png";
import badgeWater from "@/assets/illustrations/badge-water.png";
import pinBack from "@/assets/illustrations/pin-back.png";
import pinFront from "@/assets/illustrations/pin-front.png";
import type { SectorId } from "./locations";

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
  name: "Lenk Gold Edition",
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
