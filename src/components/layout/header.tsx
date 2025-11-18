"use client";

import { Badge } from "@/components/ui/badge";

export function Header() {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || "local";

  const envVariant = {
    local: "secondary" as const,
    staging: "warning" as const,
    production: "success" as const,
  }[environment] || "secondary" as const;

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <div className="flex h-16 items-center px-6 gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Welcome</h2>
        </div>
        <Badge variant={envVariant}>{environment.toUpperCase()}</Badge>
      </div>
    </header>
  );
}
