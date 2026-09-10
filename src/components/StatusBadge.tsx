import type { PredictionStatus } from "@/lib/types";

const MAP: Record<
  PredictionStatus | "pending",
  { label: string; className: string }
> = {
  active: {
    label: "ACTIVE",
    className: "bg-accent/10 text-accent ring-accent/20",
  },
  pending: {
    label: "AWAITING VERDICT",
    className: "bg-pro/10 text-pro ring-pro/20",
  },
  correct: {
    label: "CORRECT",
    className: "bg-correct/12 text-correct ring-correct/25",
  },
  wrong: {
    label: "WRONG",
    className: "bg-wrong/12 text-wrong ring-wrong/25",
  },
};

export function StatusBadge({
  status,
  resolutionDate,
  className = "",
}: {
  status: PredictionStatus;
  resolutionDate?: string;
  className?: string;
}) {
  let key: PredictionStatus | "pending" = status;
  if (
    status === "active" &&
    resolutionDate &&
    new Date(resolutionDate).getTime() < Date.now()
  ) {
    key = "pending";
  }
  const { label, className: c } = MAP[key];
  return (
    <span
      className={`mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${c} ${className}`}
    >
      {key === "active" ? (
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
      ) : null}
      {label}
    </span>
  );
}
