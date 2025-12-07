// components/ui/scroll-area.tsx
"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

type Props = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  className?: string;
  children?: React.ReactNode;
};

export default function ScrollArea({
  children,
  className = "",
  ...props
}: Props) {
  return (
    <ScrollAreaPrimitive.Root
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className="w-full h-full">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar
        className="flex select-none touch-none p-0.5 bg-transparent"
        orientation="vertical"
      >
        <ScrollAreaPrimitive.Thumb className="flex-1 bg-neutral-300 rounded-full" />
      </ScrollAreaPrimitive.Scrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
