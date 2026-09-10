export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface CountdownParts {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function countdown(targetIso: string, now: number = Date.now()): CountdownParts {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const s = Math.floor(diff / 1000);
  return {
    done: false,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function relativeFromNow(iso: string, now: number = Date.now()): string {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const day = 86400_000;
  const hour = 3600_000;
  const min = 60_000;
  const fmt = (n: number, unit: string) =>
    `${n} ${unit}${n === 1 ? "" : "s"}`;
  let text: string;
  if (abs >= day) text = fmt(Math.round(abs / day), "day");
  else if (abs >= hour) text = fmt(Math.round(abs / hour), "hour");
  else text = fmt(Math.max(1, Math.round(abs / min)), "minute");
  return diff >= 0 ? `in ${text}` : `${text} ago`;
}
