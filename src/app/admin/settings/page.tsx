import { prisma } from "@/lib/prisma";
import SettingsClient from "./SettingsClient";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const currentSettings = await prisma.systemSettings.findUnique({
    where: { id: "default" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">System Settings</h1>
        <p className="text-gray-400 mt-2">Manage global platform configurations, API keys, and maintenance toggles.</p>
      </div>

      <SettingsClient initialSettings={currentSettings} />
    </div>
  );
}
