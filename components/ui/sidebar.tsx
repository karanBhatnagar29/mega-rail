"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Home,
  CreditCard,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/create-card", label: "Create Card", icon: CreditCard },
  { href: "/cards", label: "All Cards", icon: List },
];

interface SidebarProps {
  className?: string; // ✅ allow custom className
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-white border-r shadow-sm min-h-screen flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className // ✅ now external className works
      )}
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h1 className="text-lg font-bold">Card Panel</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md p-2 text-sm font-medium hover:bg-gray-100 transition-colors",
              collapsed && "justify-center"
            )}
          >
            <Icon className="h-5 w-5" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
