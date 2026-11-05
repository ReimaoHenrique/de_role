"use client";

import { useCallback, useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogout } from "@/lib/api";
import { DashboardPanel } from "@/components/admin/dashboard-panel";
import { EventsPanel } from "@/components/admin/events-panel";
import { GuestsPanel } from "@/components/admin/guests-panel";

type AdminTab = "overview" | "events" | "guests";

interface AdminDashboardProps {
  onSessionExpired: (notice: string) => void;
}

const TABS: Array<{
  id: AdminTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "events", label: "Eventos", icon: CalendarDays },
  { id: "guests", label: "Convidados", icon: Users },
];

export function AdminDashboard({ onSessionExpired }: AdminDashboardProps) {
  const [tab, setTab] = useState<AdminTab>("overview");

  const handleUnauthorized = useCallback(() => {
    void adminLogout().catch(() => undefined);
    onSessionExpired("Sua sessão expirou. Faça login novamente.");
  }, [onSessionExpired]);

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // O cookie é httpOnly; a route handler tenta limpá-lo de qualquer forma.
    }
    onSessionExpired("Você saiu do painel administrativo.");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie eventos, convidados e check-ins em um só lugar.
          </p>
        </div>
        <Button variant="outline" onClick={() => void handleLogout()}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b pb-3">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <Button
              key={item.id}
              type="button"
              variant={active ? "default" : "ghost"}
              onClick={() => setTab(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>

      {tab === "overview" && (
        <DashboardPanel onUnauthorized={handleUnauthorized} />
      )}
      {tab === "events" && <EventsPanel onUnauthorized={handleUnauthorized} />}
      {tab === "guests" && <GuestsPanel onUnauthorized={handleUnauthorized} />}
    </div>
  );
}
