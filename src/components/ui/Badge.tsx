import React from "react";

interface BadgeProps {
  status: "open" | "upcoming" | "closed";
  label: string;
  className?: string;
}

export function Badge({ status, label, className = "" }: BadgeProps) {
  const statusColors = {
    open: "text-success border-success/40 bg-success/10",
    upcoming: "text-warning border-warning/40 bg-warning/10",
    closed: "text-danger border-danger/40 bg-danger/10",
  };

  const dotColors = {
    open: "status-dot--open",
    upcoming: "status-dot--upcoming",
    closed: "status-dot--closed",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 border-2 rounded-full font-mono text-mono-sm tracking-wider uppercase font-bold ${statusColors[status]} ${className}`}
    >
      <span className={`status-dot animate-pulse-dot ${dotColors[status]}`} />
      {label}
    </span>
  );
}
