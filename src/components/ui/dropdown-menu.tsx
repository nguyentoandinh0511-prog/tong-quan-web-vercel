"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen });
        }
        return child;
      })}
    </div>
  );
};

export const DropdownMenuTrigger = React.forwardRef<HTMLDivElement, any>(({ asChild, children, open, setOpen, ...props }, ref) => {
  const child = asChild ? React.Children.only(children) as React.ReactElement : <button>{children}</button>;
  return React.cloneElement(child, {
    ref,
    ...props,
    onClick: (e: any) => {
      e.preventDefault();
      setOpen(!open);
      if (child.props.onClick) child.props.onClick(e);
    }
  });
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuContent = ({ children, open, setOpen, align = "center", className }: any) => {
  if (!open) return null;
  return (
    <div className={cn("absolute z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none", align === "end" ? "right-0" : "left-0", className)}>
      <div className="py-1" role="menu" aria-orientation="vertical">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, { setOpen });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, setOpen, className, disabled }: any) => {
  return (
    <button
      className={cn("w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50", className)}
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return;
        if (onClick) onClick(e);
        setOpen(false);
      }}
    >
      {children}
    </button>
  );
};
