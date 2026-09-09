import type { Comment, PredictionWithToken } from "./types";

/**
 * In-memory fallback store. Used only when Supabase is not configured, so the
 * whole UI is browsable with zero setup. Data resets when the server restarts.
 * Persisted on globalThis to survive dev hot-reloads.
 */
interface DemoData {
  predictions: PredictionWithToken[];
  comments: Comment[];
  votes: Set<string>; // `${slug}:${voterHash}`
  seeded: boolean;
}

const g = globalThis as unknown as { __pmw_demo?: DemoData };

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86400_000).toISOString();
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString();
}

function seed(): DemoData {
  const base: Omit<
    PredictionWithToken,
    "id" | "slug" | "manage_token"
  >[] = [
    {
      prediction: "Bitcoin will pass $150,000 before 2027.",
      category: "Crypto",
      resolution_date: daysFromNow(320),
      evidence_url: "https://www.coingecko.com/en/coins/bitcoin",
      username: "satoshis_cousin",
      confidence: 82,
      status: "active",
      is_pro: true,
      is_sponsored: false,
      sponsor_name: null,
      views: 4210,
      agree_count: 130,
      doubt_count: 240,
      created_at: daysAgo(12),
      resolved_at: null,
    },
    {
      prediction: "Real Madrid will win the 2027 Champions League.",
      category: "Sports",
      resolution_date: daysFromNow(250),
      evidence_url: null,
      username: "halamadrid",
      confidence: 64,
      status: "active",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 2890,
      agree_count: 210,
      doubt_count: 190,
      created_at: daysAgo(9),
      resolved_at: null,
    },
    {
      prediction: "Apple will announce new smart glasses before June 2026.",
      category: "Tech",
      resolution_date: daysFromNow(2),
      evidence_url: "https://www.apple.com/newsroom/",
      username: "not_gruber",
      confidence: 55,
      status: "active",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 6120,
      agree_count: 95,
      doubt_count: 320,
      created_at: daysAgo(40),
      resolved_at: null,
    },
    {
      prediction: "A single AI model will score above 90% on ARC-AGI-2 in 2026.",
      category: "Science",
      resolution_date: daysFromNow(110),
      evidence_url: "https://arcprize.org/",
      username: "benchmark_bear",
      confidence: 38,
      status: "active",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 1740,
      agree_count: 60,
      doubt_count: 150,
      created_at: daysAgo(5),
      resolved_at: null,
    },
    {
      prediction: "England will win the 2026 FIFA World Cup.",
      category: "Sports",
      resolution_date: daysAgo(3),
      evidence_url: null,
      username: "itscominghome",
      confidence: 70,
      status: "wrong",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 9800,
      agree_count: 400,
      doubt_count: 610,
      created_at: daysAgo(200),
      resolved_at: daysAgo(2),
    },
    {
      prediction: "The Fed will cut rates at its next meeting.",
      category: "Economy",
      resolution_date: daysAgo(20),
      evidence_url: null,
      username: "macro_maxi",
      confidence: 60,
      status: "correct",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 3300,
      agree_count: 220,
      doubt_count: 205,
      created_at: daysAgo(80),
      resolved_at: daysAgo(19),
    },
    {
      prediction: "My team (Leganés) will get promoted this season.",
      category: "Personal",
      resolution_date: daysFromNow(60),
      evidence_url: null,
      username: "pepinero",
      confidence: 49,
      status: "active",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 240,
      agree_count: 12,
      doubt_count: 9,
      created_at: daysAgo(2),
      resolved_at: null,
    },
    {
      prediction: "GTA VI will slip to 2027.",
      category: "Entertainment",
      resolution_date: daysFromNow(30),
      evidence_url: "https://www.rockstargames.com/VI",
      username: "delaydar",
      confidence: 77,
      status: "active",
      is_pro: true,
      is_sponsored: false,
      sponsor_name: null,
      views: 5400,
      agree_count: 500,
      doubt_count: 120,
      created_at: daysAgo(15),
      resolved_at: null,
    },
    {
      prediction: "2026 will be the hottest year on record.",
      category: "Climate",
      resolution_date: daysFromNow(150),
      evidence_url: "https://climate.copernicus.eu/",
      username: "keeling_curve",
      confidence: 66,
      status: "active",
      is_pro: false,
      is_sponsored: true,
      sponsor_name: "ClimateWatch",
      views: 2100,
      agree_count: 140,
      doubt_count: 90,
      created_at: daysAgo(7),
      resolved_at: null,
    },
    {
      prediction: "Tesla will deliver an unsupervised robotaxi ride in NYC in 2026.",
      category: "Tech",
      resolution_date: daysFromNow(200),
      evidence_url: null,
      username: "range_anxiety",
      confidence: 44,
      status: "active",
      is_pro: false,
      is_sponsored: false,
      sponsor_name: null,
      views: 3900,
      agree_count: 180,
      doubt_count: 420,
      created_at: daysAgo(11),
      resolved_at: null,
    },
  ];

  const predictions: PredictionWithToken[] = base.map((p, i) => ({
    ...p,
    id: `demo-${i + 1}`,
    slug: `demo${i + 1}${["aa", "bt", "cx", "dk", "ep", "fm", "gq", "hr", "js", "kt"][i]}`,
    manage_token: `demo-token-${i + 1}`,
  }));

  const comments: Comment[] = [
    {
      id: "c1",
      prediction_id: "demo-1",
      username: "gold_bug",
      body: "No chance. Liquidity is drying up.",
      url: null,
      created_at: daysAgo(6),
    },
    {
      id: "c2",
      prediction_id: "demo-1",
      username: "hodler",
      body: "Halving cycle says otherwise.",
      url: "https://www.bitcoinmagazine.com/",
      created_at: daysAgo(4),
    },
    {
      id: "c3",
      prediction_id: "demo-3",
      username: "leaker",
      body: "Supply chain reports point to a delay.",
      url: null,
      created_at: daysAgo(20),
    },
  ];

  return { predictions, comments, votes: new Set(), seeded: true };
}

export function demo(): DemoData {
  if (!g.__pmw_demo) g.__pmw_demo = seed();
  return g.__pmw_demo;
}
