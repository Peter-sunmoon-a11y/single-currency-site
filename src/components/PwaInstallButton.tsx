"use client";

import { Modal } from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { Download, Menu, Smartphone } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const isStandaloneDisplay = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (
      window.navigator as Navigator & {
        standalone?: boolean;
      }
    ).standalone === true
  );
};

const isIOS = () => {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
};

export function PwaInstallButton() {
  const { t } = useTranslation("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    setIos(isIOS());
    setReady(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIosHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canShow = useMemo(() => ready && !installed && (deferredPrompt || ios), [deferredPrompt, installed, ios, ready]);

  if (!canShow) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    if (ios) {
      setShowIosHelp(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-soft btn-md italic"
        onClick={handleInstall}
        title={ios ? t("addToHomeScreen", "Add to Home Screen") : t("installApp", "Install app")}
      >
        {ios ? <Smartphone className="w-4 h-4 text-base-content" /> :
          <Download className="w-4 h-4 text-base-content" />}
        <span className="text-base-content font-normal">
          {ios ? t("addToHomeScreen", "Add to Home Screen") : t("installApp", "Install app")}
        </span>
      </button>

      <Modal
        isOpen={showIosHelp}
        onClose={() => setShowIosHelp(false)}
        title={t("addToHomeScreen", "Add to Home Screen")}
        position="modal-middle"
      >
        <div className="space-y-3 text-sm">
          <p>{t("iosIntro", "On iPhone or iPad, use the browser share menu to add this app to your home screen.")}</p>
          <div className="space-y-2 rounded-lg bg-base-200 p-3">
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepShare", "Tap the share button in the browser toolbar.")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepAdd", "Choose \"Add to Home Screen\".")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepConfirm", "Confirm the name and add it.")}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export function PwaInstallBanner() {
  const { t } = useTranslation("pwa");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [ready, setReady] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setInstalled(isStandaloneDisplay());
    setIos(isIOS());
    setReady(true);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowIosHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const canShow = useMemo(() => ready && !installed && (deferredPrompt || ios), [deferredPrompt, installed, ios, ready]);

  if (!canShow) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      return;
    }

    if (ios) {
      setShowIosHelp(true);
    }
  };

  return (
    <>
      <div className="rounded-md border border-base-300 bg-base-200 h-14 px-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-base-content/60">{t("installTitle", "Install app")}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-soft btn-sm px-2 shrink-0 text-base-content"
          onClick={handleInstall}
          title={ios ? t("addToHomeScreen", "Add to Home Screen") : t("installApp", "Install app")}
        >
          {ios ? <Smartphone className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span
            className="text-xs font-medium">{ios ? t("addToHomeScreen", "Add to Home Screen") : t("installApp", "Install app")}</span>
        </button>
      </div>

      <Modal
        isOpen={showIosHelp}
        onClose={() => setShowIosHelp(false)}
        title={t("addToHomeScreen", "Add to Home Screen")}
        position="modal-middle"
      >
        <div className="space-y-3 text-sm">
          <p>{t("iosIntro", "On iPhone or iPad, use the browser share menu to add this app to your home screen.")}</p>
          <div className="space-y-2 rounded-lg bg-base-200 p-3">
            <div className="flex items-center gap-2">
              <Menu className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepShare", "Tap the share button in the browser toolbar.")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepAdd", "Choose \"Add to Home Screen\".")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 shrink-0 text-base-content/60" />
              <span>{t("iosStepConfirm", "Confirm the name and add it.")}</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
