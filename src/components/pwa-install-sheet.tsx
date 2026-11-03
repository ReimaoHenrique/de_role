"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/hooks/usePwaInstall";
import {
  Download,
  Share,
  SquareArrowUp,
  Plus,
  X,
  Check,
} from "lucide-react";

// Imagem de destaque do evento (usada como "capa" do app).
const INSTALL_IMAGE_SRC = "/events/boreal.jpg";

// Logo do PWA (ícone exibido na Tela de Início depois de instalado).
const APP_LOGO_SRC = "/icon-192.png";

const COUNTDOWN_MS = 7000;
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Instruções visuais do fluxo de instalação no iOS.
 */
function IosInstallSteps() {
  return (
    <ol className="space-y-1.5 text-sm text-muted-foreground">
      <li className="flex items-center gap-2">
        <SquareArrowUp className="h-4 w-4 shrink-0 text-blue-600" />
        Toque no botão Compartilhar
      </li>
      <li className="flex items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-blue-600" />
        Escolha “Adicionar à Tela de Início”
      </li>
    </ol>
  );
}

/**
 * Bottom sheet de instalação PWA.
 *
 * - Chrome/Android: usa o prompt nativo (`beforeinstallprompt`).
 * - Safari/iOS: não existe prompt nativo, então mostramos o passo a passo de
 *   "Compartilhar → Adicionar à Tela de Início".
 * - Desktop: não aparece.
 */
export function PwaInstallSheet() {
  const {
    canShow,
    installEvent,
    isIOS,
    canShare,
    shared,
    install,
    shareInstall,
    dismiss,
  } = usePwaInstall();
  const [remaining, setRemaining] = useState(COUNTDOWN_MS);

  // Abre na hora e fecha sozinho depois de 7s
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
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] min-h-[230px] flex-col justify-between gap-3 rounded-t-3xl border-t border-white/40 bg-white/70 px-5 pt-5 pb-8 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.25)] backdrop-blur-2xl animate-in slide-in-from-bottom-full duration-300 ease-out dark:border-white/10 dark:bg-zinc-900/70 sm:h-[30dvh]">
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

        {/* Conteúdo: logo do PWA + imagem do app + texto */}
        <div className="flex items-center gap-4 pr-10">
          <div className="relative shrink-0">
            {/* Logo do PWA que vai aparecer na Tela de Início */}
            <Image
              src={APP_LOGO_SRC}
              alt="Logo do Ingressos"
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
            />
            {/* Imagem do app, levemente sobreposta à logo */}
            <Image
              src={INSTALL_IMAGE_SRC}
              alt="Prévia do app"
              width={40}
              height={40}
              className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl object-cover shadow-md ring-2 ring-white dark:ring-zinc-900"
            />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-600" />
              <h2 className="text-base font-semibold text-foreground">Instalar o app</h2>
            </div>
            <p className="text-sm leading-snug text-muted-foreground">
              {installEvent
                ? "Adicione à tela inicial para abrir mais rápido e usar offline."
                : isIOS
                  ? "Toque no botão Compartilhar e depois em “Adicionar à Tela de Início”."
                  : "No Chrome, toque no menu ⋮ e escolha “Instalar app”."}
            </p>
          </div>
        </div>

        {/* Passos visuais do fluxo de instalação no iOS */}
        {isIOS && !installEvent && !shared && <IosInstallSteps />}

        <div className="flex items-center gap-3">
          {installEvent ? (
            <Button className="flex-1" onClick={install}>
              Instalar agora
            </Button>
          ) : isIOS ? (
            <>
              {shared ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Abra o menu Compartilhar e toque em “Adicionar à Tela de Início”.</span>
                </div>
              ) : (
                <>
                  {canShare && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Compartilhar"
                      title="Compartilhar"
                      onClick={shareInstall}
                    >
                      <Share className="h-5 w-5" />
                    </Button>
                  )}
                  <Button className="flex-1" onClick={dismiss}>
                    Entendi
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button className="flex-1" variant="outline" onClick={dismiss}>
              Entendi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
