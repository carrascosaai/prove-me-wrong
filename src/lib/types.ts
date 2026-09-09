export type PredictionStatus = "active" | "correct" | "wrong";

export interface Prediction {
  id: string;
  slug: string;
  prediction: string;
  category: string;
  resolution_date: string; // ISO
  evidence_url: string | null;
  username: string;
  confidence: number; // 0..100
  status: PredictionStatus;
  is_pro: boolean;
  is_sponsored: boolean;
  sponsor_name: string | null;
  views: number;
  agree_count: number;
  doubt_count: number;
  created_at: string; // ISO
  resolved_at: string | null;
}

/** Prediction plus the secret token that lets the creator resolve it. */
export interface PredictionWithToken extends Prediction {
  manage_token: string;
}

export interface Comment {
  id: string;
  prediction_id: string;
  username: string;
  body: string;
  url: string | null;
  created_at: string;
}

export interface UserStat {
  username: string;
  total: number;
  correct: number;
  wrong: number;
  resolved: number;
  accuracy: number; // 0..1 over resolved
}

export type RankingType =
  | "confident"
  | "controversial"
  | "accurate"
  | "wrong"
  | "popular";
