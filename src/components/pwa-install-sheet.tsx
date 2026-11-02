"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import { Download, Share, X } from "lucide-react";

// Troque por qualquer imagem sua. Basta colocar o arquivo em /public
// e atualizar o caminho abaixo.
const INSTALL_IMAGE_SRC = "/events/boreal.jpg";

const COUNTDOWN_MS = 3000;
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function PwaInstallSheet() {
  const { canShow, installEvent, isIOS, install, dismiss } = usePwaInstall();
  const [remaining, setRemaining] = useState(COUNTDOWN_MS);

  // Abre na hora e fecha sozinho depois de 3s (cronômetro)
  useEffect(() => {
    if (!canShow) return;

    const startedAt = Date.now();

    const interval = setInterval(() => {
      setRemaining(Math.max(0, COUNTDOWN_MS - (Date.now() - startedAt)));
    }, 50);

    const autoClose = setTimeout(dismiss, COUNTDOWN_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(autoClose);
    };
  }, [canShow, dismiss]);

  if (!canShow) return null;

  const dashOffset = RING_CIRCUMFERENCE * (1 - remaining / COUNTDOWN_MS);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Instalar aplicativo"
      className="fixed inset-0 z-50"
    >
      {/* Clicar fora fecha */}
      <button
        type="button"
        aria-label="Fechar instalação"
        onClick={dismiss}
        className="absolute inset-0 h-full w-full cursor-default bg-black/10 animate-in fade-in duration-300"
      />

      {/* Bottom sheet ~30% da tela, glassmorphism sutil */}
      <div className="absolute inset-x-0 bottom-0 flex h-[30dvh] min-h-[230px] flex-col justify-between rounded-t-3xl border-t border-white/40 bg-white/70 px-5 pt-5 pb-8 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-2xl animate-in slide-in-from-bottom-full duration-300 ease-out dark:border-white/10 dark:bg-zinc-900/70">
        {/* X com cronômetro circular */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={dismiss}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg
            className="absolute inset-0 h-9 w-9 -rotate-90"
            viewBox="0 0 36 36"
            aria-hidden="true"
          >
            <circle
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.15"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="text-blue-600 transition-[stroke-dashoffset] duration-100 ease-linear"
            />
          </svg>
          <X className="h-4 w-4" />
        </button>

        {/* Conteúdo: imagem + texto */}
        <div className="flex items-center gap-4 pr-10">
          <Image
            src={INSTALL_IMAGE_SRC}
            alt="Prévia do app"
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-semibold text-foreground">Instalar o app</h2>
            </div>
            <p className="text-sm leading-snug text-muted-foreground">
              {installEvent
                ? "Adicione à tela inicial para abrir mais rápido e usar offline."
                : isIOS
                  ? "Toque em Compartilhar e depois em \u201cAdicionar à Tela de Início\u201d."
                  : "No Chrome, toque no menu \u22ee e escolha \u201cInstalar app\u201d."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {installEvent ? (
            <Button className="flex-1" onClick={install}>
              Instalar agora
            </Button>
          ) : (
            <>
              {isIOS && <Share className="h-5 w-5 text-muted-foreground" />}
              <Button className="flex-1" variant="outline" onClick={dismiss}>
                Entendi
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
