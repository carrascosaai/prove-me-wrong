import type { RankingType } from "./types";

export const RANKINGS: {
  type: RankingType;
  title: string;
  blurb: string;
  kind: "prediction" | "user";
}[] = [
  {
    type: "popular",
    title: "Most popular",
    blurb: "The predictions pulling the most eyeballs.",
    kind: "prediction",
  },
  {
    type: "controversial",
    title: "Most controversial",
    blurb: "Where the crowd is most split on the outcome.",
    kind: "prediction",
  },
  {
    type: "confident",
    title: "Most confident",
    blurb: "People who staked the boldest confidence on an open call.",
    kind: "prediction",
  },
  {
    type: "accurate",
    title: "Most accurate",
    blurb: "Predictors with the best hit rate on resolved calls.",
    kind: "user",
  },
  {
    type: "wrong",
    title: "Most wrong",
    blurb: "The hall of shame. Bold calls that didn't land.",
    kind: "user",
  },
];

export function rankingMeta(type: string) {
  return RANKINGS.find((r) => r.type === type);
}
