import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-150 ${
          hoverable ? "hover:border-border-focus hover:shadow-md cursor-pointer" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
