"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  // Extract options from children to render in native select
  const options = React.Children.toArray(children).flatMap((child) => {
    if (React.isValidElement(child) && (child.type as React.ComponentType)?.displayName === 'SelectContent') {
      return React.Children.toArray((child.props as { children: React.ReactNode }).children)
        .filter((c) => React.isValidElement(c) && (c.type as React.ComponentType)?.displayName === 'SelectItem')
        .map((c) => {
          const props = (c as React.ReactElement<{ value: string; children: React.ReactNode }>).props;
          return { value: props.value, label: String(props.children) };
        });
    }
    return [];
  });

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="truncate">
          {options.find(o => o.value === value)?.label || "Sélectionner"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
        aria-hidden="true"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

Select.displayName = "Select";

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export function SelectTrigger(_props: SelectTriggerProps) {
  // This is kept for compatibility but rendered as part of Select
  return null;
}
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue(_props: SelectValueProps) {
  // This is kept for compatibility but handled by Select
  return null;
}
SelectValue.displayName = "SelectValue";

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent(_props: SelectContentProps) {
  // This is handled by the parent Select
  return null;
}
SelectContent.displayName = "SelectContent";

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem(_props: SelectItemProps) {
  // This is handled by the parent Select
  return null;
}
SelectItem.displayName = "SelectItem";
