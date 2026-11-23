import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-tap disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const variantStyles = {
      primary:
        "bg-accent-primary text-text-inverted hover:bg-accent-primary-hover active:bg-accent-primary-active focus:ring-accent-primary shadow-sm",
      secondary:
        "bg-surface-subtle text-text-primary border border-border-subtle hover:bg-surface-hover active:bg-surface-subtle focus:ring-accent-primary",
      outline:
        "border border-border-subtle bg-transparent text-text-primary hover:bg-surface-subtle active:bg-surface-hover focus:ring-accent-primary",
      ghost:
        "bg-transparent text-text-secondary hover:bg-surface-subtle hover:text-text-primary focus:ring-accent-primary",
      destructive:
        "bg-status-danger-bg text-status-danger-text border border-status-danger-border hover:opacity-90 active:opacity-100 focus:ring-red-500",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-sm min-w-[36px]",
      md: "h-11 px-5 text-base min-w-tap",
      lg: "h-12 px-6 text-lg min-w-tap",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
