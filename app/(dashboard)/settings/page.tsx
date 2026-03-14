"use client";

import { Card } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Basic configuration for the admin workspace.
        </p>
      </div>
      <Card className="p-6 text-sm text-muted-foreground">
        This starter dashboard exposes a minimal settings surface. Extend this
        page with theme toggles, editorial guidelines, or integration keys as
        your needs grow.
      </Card>
    </div>
  );
}
