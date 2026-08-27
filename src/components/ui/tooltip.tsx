"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div 
      className="relative inline-block" 
      onMouseEnter={() => setOpen(true)} 
      onMouseLeave={() => setOpen(false)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open });
        }
        return child;
      })}
    </div>
  );
};

export const TooltipTrigger = React.forwardRef<HTMLDivElement, any>(({ asChild, children, open, ...props }, ref) => {
  const child = asChild ? React.Children.only(children) as React.ReactElement : <button>{children}</button>;
  return React.cloneElement(child, { ref, ...props });
});
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = ({ children, open, className }: any) => {
  if (!open) return null;
  return (
    <div className={cn("absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap", className)}>
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
    </div>
  );
};
