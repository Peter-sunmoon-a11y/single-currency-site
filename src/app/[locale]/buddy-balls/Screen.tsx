import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/react-i18next";
import { buddyBallConfigList, getBuddyBallsCount, getBuddyBallsPlay } from "@/services/auth/miniGames";
import { useUserBuddyBallsHome } from "@/hooks/api/useAuth";
import { Dashboard } from "@/sections/buddy-balls/Dashboard.tsx";
import { PlinkoBoard } from "@/components/plinko/PlinkoBoard";
import { useBoundStore } from "@/store";
import { GuestGuide } from "@/components/standard/GuestGuide";

const BALL_IMAGES = [
  "/images/game_buddy_balls/ball.png",
  "/images/game_buddy_balls/ball-pool.png",
  "/images/game_buddy_balls/ball.png",
  "/images/game_buddy_balls/buddy-win.png",
  "/images/game_buddy_balls/ball.png",
  "/images/game_buddy_balls/ball-pool.png",
  "/images/game_buddy_balls/ball.png",
];

function RouteComponent() {
  const { t } = useTranslation(["login"]);
  const user = useBoundStore((state) => state.user);
  const openModal = useBoundStore((state) => state.openModal);
  const { refetch: refetchBuddyBallsHome } = useUserBuddyBallsHome();

  const buddyBallApi = useMemo(() => ({
    getBuddyBallConfig: () => buddyBallConfigList(),
    getBallCount:       () => getBuddyBallsCount(),
    getBall:            () => getBuddyBallsPlay(),
    onBallFallDown:     () => { void refetchBuddyBallsHome(); },
  }), [refetchBuddyBallsHome]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center">
        <GuestGuide
          images={BALL_IMAGES}
          label={t("login:pleaseLoginToContinue")}
          onAction={() => openModal("OPEN_AUTH_MODAL", { initialTab: "signup" })}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pt-4">
        <Dashboard />
      </div>
      <div className="flex-1 min-h-0">
        <PlinkoBoard buddyBallApi={buddyBallApi} />
      </div>
    </div>
  );
}

export const beforeLoad = undefined;

export default RouteComponent;
