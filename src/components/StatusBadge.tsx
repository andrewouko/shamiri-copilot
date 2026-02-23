interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    classes: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  PROCESSED: {
    label: "Processed",
    classes: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  FLAGGED: {
    label: "Flagged for Review",
    classes: "bg-red-100 text-red-700 font-semibold",
    dot: "bg-red-500 animate-pulse",
  },
  SAFE: {
    label: "Safe",
    classes: "bg-green-50 text-green-700",
    dot: "bg-green-500",
  },
  REVIEWED: {
    label: "Reviewed",
    classes: "bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
