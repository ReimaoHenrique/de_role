import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const noopSubscribe = () => () => {};

function detectMobile() {
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    window.matchMedia("(max-width: 1024px)").matches
  );
}

function detectIOS() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function detectStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function usePwaInstall() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => setDismissed(true);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!installEvent) return false;

    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;

    if (outcome === "accepted") {
      setInstallEvent(null);
      setDismissed(true);
      return true;
    }

    return false;
  }, [installEvent]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  const isMobile = hydrated && detectMobile();
  const isIOS = hydrated && detectIOS();
  const isInstalled = hydrated && detectStandalone();
  const canShow = isMobile && !isInstalled && !dismissed;

  return { canShow, installEvent, isIOS, install, dismiss };
}
