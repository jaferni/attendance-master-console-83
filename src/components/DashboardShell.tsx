
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

interface DashboardShellProps extends PropsWithChildren {
  title?: string;
  description?: string;
  className?: string;
}

export function DashboardShell({
  title,
  description,
  className,
  children,
}: DashboardShellProps) {
  return (
    <div className={cn("space-y-6 p-6 animate-fade-in", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
