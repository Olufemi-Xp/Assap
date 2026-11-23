import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "neutral",
  children,
  ...props
}) => {
  const variantStyles = {
    success: "bg-status-success-bg text-status-success-text border-status-success-border",
    warning: "bg-status-warning-bg text-status-warning-text border-status-warning-border",
    danger: "bg-status-danger-bg text-status-danger-text border-status-danger-border",
    info: "bg-status-info-bg text-status-info-text border-status-info-border",
    neutral: "bg-surface-subtle text-text-secondary border-border-subtle",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
