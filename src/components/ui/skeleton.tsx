import React from "react";

export function Skeleton({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface-subtle border border-border-subtle/50 ${className}`}
      {...props}
    />
  );
}
