"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminLogin } from "@/components/admin/admin-login";
import { adminMe } from "@/lib/api";

type AuthState = "checking" | "anonymous" | "authenticated";

export default function AdminPage() {
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [notice, setNotice] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    adminMe()
      .then(() => {
        if (active) setAuthState("authenticated");
      })
      .catch(() => {
        if (active) setAuthState("anonymous");
      });

    return () => {
      active = false;
    };
  }, []);

  if (authState === "checking") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Verificando sessão...
      </div>
    );
  }

  if (authState === "anonymous") {
    return (
      <AdminLogin
        onSuccess={() => {
          setNotice(undefined);
          setAuthState("authenticated");
        }}
        notice={notice}
      />
    );
  }

  return (
    <AdminDashboard
      onSessionExpired={(message) => {
        setNotice(message);
        setAuthState("anonymous");
      }}
    />
  );
}
