"use client";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import { Download, X } from "lucide-react";

export function PwaInstallBanner() {
  const { canShow, install, dismiss } = usePwaInstall();

  if (!canShow) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicativo"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Download className="h-4 w-4 text-blue-600" />
          <span>Instale o Ingressos no seu celular e use offline.</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={install}>
            Instalar
          </Button>
          <button
            type="button"
            aria-label="Fechar"
            onClick={dismiss}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
