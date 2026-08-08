"use client";

import { useAppNavigate } from "@/hooks/useAppNavigate";
import { useTranslation } from "@/lib/i18n/react-i18next";

export default function OriginalsScreen() {
  const navigate = useAppNavigate();
  const { t } = useTranslation(["buddyBalls", "luckySpin", "bonus"]);
  const externalGameUrl = "https://jump-jump.lucas-xue2020.workers.dev/";

  type EntryCard = {
    title: string;
    icon: string;
  } & (
    | { kind: "internal"; to: string }
    | { kind: "external"; href: string }
    );

  const entryCards: EntryCard[] = [
    {
      title: t("buddyBalls:buddyBalls"),
      icon: "/images/game_buddy_balls/buddy-win.png",
      kind: "internal",
      to: "/buddy-balls"
    },
    {
      title: t("luckySpin:lucky"),
      icon: "/images/game_lucky_spin/spins.png",
      kind: "internal",
      to: "/lucky-spin"
    },
    {
      title: "Jump Jump",
      icon: "/demo/img.png",
      kind: "external",
      href: externalGameUrl
    }
  ];

  const openExternalGame = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-dvh bg-base-300 px-4 py-4">
      <div className="grid gap-2">
        {entryCards.map((card) => (
          <button
            key={card.title}
            type="button"
            className="group flex flex-col justify-between rounded-lg bg-base-100 p-2 text-left transition-transform duration-200 hover:-translate-y-0.5"
            onClick={() => {
              if (card.kind === "external") {
                openExternalGame(card.href);
                return;
              }

              navigate(card.to);
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-base-200">
                <img
                  src={card.icon}
                  alt=""
                  className="h-10 w-10 object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/50">
                  Originals
                </p>
                <h2 className="mt-2 text-lg font-black leading-tight text-base-content">
                  {card.title}
                </h2>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn btn-primary btn-soft text-sm btn-sm">
                {t("bonus:go")}
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
