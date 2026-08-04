import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Lottie from "lottie-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import clownHatData from "./animations/clown-hat.json";
import giftBoxData from "./animations/gift-box.json";
import { useJokerBonusOverlay } from "./useJokerBonusOverlay";
import { useTranslation } from "../../lib/i18n/react-i18next";
import { BonusClaimModal, InnerCoinBox } from "@/sections/dollars/bonus-claim-modal.tsx";
import { Modal } from "@/components/ui/Modal.tsx";
import { TextBaseContent } from "@/components/standard/TextBaseContent.tsx";
import { InnerConfirmBox } from "@/sections/dollars/inner-confirm-box.tsx";

const jokerImg = "/images/bonus_joker/joker-spring.png";

interface Props {
  active: boolean;
  page: string;
}

type PopPhase = 0 | 1 | 2 | 3;

export function JokerBonusGameOverlay({ active, page }: Props) {
  const { t } = useTranslation("bonus");
  const { user } = useAuth();
  const userId = Number(user?.id ?? 0);
  const { activeInstance, phase, reward, clickJoker, openBox, claim, dismissClaimed } = useJokerBonusOverlay({
    userId,
    active: active && userId > 0,
    page
  });
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [popPhase, setPopPhase] = useState<PopPhase>(0);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [boxOpened, setBoxOpened] = useState(false);
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jokerTransitionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const boxTransitionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const boxCount = Math.max(1, Math.min(12, activeInstance?.box_count ?? 3));

  const moveRandomly = useCallback(() => {
    const width = typeof window === "undefined" ? 390 : window.innerWidth;
    const height = typeof window === "undefined" ? 844 : window.innerHeight;
    const isDesktop = width >= 768;
    const minX = isDesktop ? Math.max(24, width * 0.45 - 160) : 18;
    const maxX = isDesktop ? Math.min(width - 180, width * 0.55 + 160) : Math.max(18, width - 96);
    const minY = isDesktop ? height * 0.52 : height * 0.62;
    const maxY = Math.max(minY, height - 150);
    setPosition({
      x: Math.round(minX + Math.random() * Math.max(1, maxX - minX)),
      y: Math.round(minY + Math.random() * Math.max(1, maxY - minY))
    });
  }, []);

  useEffect(() => {
    if (phase !== "visible") return;
    moveRandomly();
    const schedule = () => {
      moveTimeoutRef.current = setTimeout(() => {
        moveRandomly();
        schedule();
      }, 900);
    };
    schedule();
    return () => {
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
      moveTimeoutRef.current = null;
    };
  }, [moveRandomly, phase, activeInstance?.instance_id]);

  useEffect(() => {
    if (phase !== "visible" && phase !== "clicked" && phase !== "box_selecting") {
      setPopPhase(0);
    }
    if (phase !== "box_selecting") {
      setSelectedBox(null);
      setBoxOpened(false);
    }
  }, [phase, activeInstance?.instance_id]);

  useEffect(() => () => {
    jokerTransitionTimersRef.current.forEach(clearTimeout);
    boxTransitionTimersRef.current.forEach(clearTimeout);
  }, []);

  const handleJokerClick = useCallback(async () => {
    if (phase !== "visible") return;
    jokerTransitionTimersRef.current.forEach(clearTimeout);
    jokerTransitionTimersRef.current = [];
    setPopPhase(1);
    jokerTransitionTimersRef.current.push(
      setTimeout(() => setPopPhase(2), 200),
      setTimeout(() => setPopPhase(3), 600)
    );
    await clickJoker();
  }, [clickJoker, phase]);

  const handleBoxClick = useCallback((boxIndex: number) => {
    if (selectedBox !== null || phase !== "box_selecting") return;
    boxTransitionTimersRef.current.forEach(clearTimeout);
    boxTransitionTimersRef.current = [];
    setSelectedBox(boxIndex);
    boxTransitionTimersRef.current.push(
      setTimeout(() => setBoxOpened(true), 100),
      setTimeout(() => void openBox(boxIndex), 950)
    );
  }, [openBox, phase, selectedBox]);

  const boxes = useMemo(() => Array.from({ length: boxCount }, (_, index) => index + 1), [boxCount]);
  const isVisiblePhase = phase === "visible" && !!activeInstance;
  const isClickedPhase = phase === "clicked" && !!activeInstance;
  const isBoxSelectingPhase = phase === "box_selecting" && !!activeInstance;
  const isClaimedPhase = phase === "claimed";
  const isClaimModalOpen = phase === "opening" || phase === "opened_reward" || phase === "claiming";

  if (!active || !userId || (!activeInstance && phase !== "claimed")) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[120] overflow-hidden">
      {isVisiblePhase && (
        <JokerFloatingTrigger position={position} onClick={handleJokerClick} />
      )}

      {isClickedPhase && (
        <JokerClickedStage position={position} popPhase={popPhase} />
      )}

      <JokerBoxSelectModal
        isOpen={isBoxSelectingPhase}
        boxCount={boxCount}
        boxes={boxes}
        boxOpened={boxOpened}
        popPhase={popPhase}
        selectedBox={selectedBox}
        onBoxClick={handleBoxClick}
        onClose={dismissClaimed}
        title={t("bonus:joker_bonus_choose_box")}
        description={t("bonus:joker_bonus_choose_box_desc")}
      />

      <JokerClaimedModal
        isOpen={isClaimedPhase}
        onClose={dismissClaimed}
        title={t("bonus:joker_bonus_reward_claimed_title")}
        description={t("bonus:joker_bonus_claim_wallet_shortly", {
          bonusName: t("bonus:joker_bonus_name")
        })}
        buttonLabel={t("bonus:joker_bonus_got_it")}
      />

      <BonusClaimModal
        isBonus
        open={isClaimModalOpen}
        bonus={String(reward?.reward_amount ?? reward?.reward_rule_snapshot?.amount ?? "0.00")}
        loading={phase === "claiming"}
        onClick={(currency) => void claim(currency)}
        onClose={dismissClaimed}
        imageSrc={jokerImg}
        animateCls="animate-gift-shake"
      />
    </div>
  );
}

function JokerFloatingTrigger({
                                position,
                                onClick
                              }: {
  position: { x: number; y: number };
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="pointer-events-auto absolute select-none"
      style={{
        left: position.x,
        top: position.y,
        transition: "left 600ms ease, top 450ms ease",
        animation: "joker-enter 500ms ease-out both"
      }}
      onClick={onClick}
      aria-label="Joker bonus"
    >
      <div className="origin-center md:scale-[1.65]" style={{ animation: "joker-hop 520ms ease-in-out infinite" }}>
        <Lottie animationData={clownHatData} loop autoplay className="h-[86px] w-[120px]" />
      </div>
    </button>
  );
}

function JokerClickedStage({
                             position,
                             popPhase
                           }: {
  position: { x: number; y: number };
  popPhase: PopPhase;
}) {
  return (
    <div
      className="pointer-events-none absolute select-none"
      style={{
        left: position.x,
        top: position.y,
        transition: "left 600ms ease, top 450ms ease"
      }}
      aria-hidden="true"
    >
      <div className="relative h-[180px] w-[140px] origin-center md:scale-[1.65]">
        <div
          className="absolute left-0"
          style={{
            top: popPhase === 1 ? 60 : popPhase === 2 ? 50 : 46,
            zIndex: popPhase === 1 ? 2 : 1,
            animation: popPhase === 1
              ? "joker-hat-squish 200ms ease-in forwards"
              : "joker-hat-knock-up 600ms ease-out forwards"
          }}
        >
          <Lottie animationData={clownHatData} loop={false} autoplay className="h-[100px] w-[140px]" />
        </div>
        <div
          className="absolute left-[0px]"
          style={{
            zIndex: 3,
            opacity: popPhase >= 2 ? 1 : 0,
            animation: popPhase === 2
              ? "joker-pop-out 500ms cubic-bezier(.34,1.56,.64,1) both"
              : popPhase >= 3
                ? "joker-happy-bounce 600ms ease-in-out infinite"
                : "none"
          }}
        >
          <img src={jokerImg} alt="" className="h-[132px] w-auto" />
        </div>
        {popPhase >= 3 && <JokerConfetti />}
      </div>
    </div>
  );
}

function JokerBoxSelectModal({
                               isOpen,
                               boxCount,
                               boxes,
                               boxOpened,
                               popPhase,
                               selectedBox,
                               onBoxClick,
                               onClose,
                               title,
                               description
                             }: {
  isOpen: boolean;
  boxCount: number;
  boxes: number[];
  boxOpened: boolean;
  popPhase: PopPhase;
  selectedBox: number | null;
  onBoxClick: (boxIndex: number) => void;
  onClose: () => void;
  title: string;
  description: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      position="modal-middle"
      outsideClose={false}
    >
      <div className="relative">
        <div className="pointer-events-none absolute left-1/2 flex h-full -translate-x-1/2 items-center justify-center">
          {popPhase >= 2 && (
            <img
              src={jokerImg}
              alt=""
              className="mx-auto h-[132px] w-auto"
              style={{ animation: popPhase === 2 ? "joker-pop 520ms cubic-bezier(.34,1.56,.64,1) both" : "joker-wobble 900ms ease-in-out infinite" }}
            />
          )}
        </div>
        <TextBaseContent text={description} className="text-center italic" />
        <div
          className={cn("mt-4 grid gap-4", boxCount <= 4 ? "grid-cols-2" : boxCount <= 9 ? "grid-cols-3" : "grid-cols-4")}>
          {boxes.map((boxIndex) => (
            <button
              key={boxIndex}
              type="button"
              onClick={() => onBoxClick(boxIndex)}
              disabled={selectedBox !== null && selectedBox !== boxIndex}
              className={cn(
                "relative flex items-center justify-center transition",
                selectedBox === boxIndex ? "scale-120" : "hover:scale-120",
                selectedBox !== null && selectedBox !== boxIndex && "scale-90 opacity-40"
              )}
            >
              <Lottie animationData={giftBoxData} loop={selectedBox !== boxIndex || !boxOpened} autoplay
                      className="h-[78px] w-[78px]" />
              {selectedBox === boxIndex && !boxOpened && <JokerIndicator />}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function JokerClaimedModal({
                             isOpen,
                             onClose,
                             title,
                             description,
                             buttonLabel
                           }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonLabel: string;
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      position="modal-middle"
      outsideClose={false}
    >
      <InnerCoinBox imageSrc={jokerImg} animateCls="animate-gift-shake" />
      <div className="mt-4 flex flex-col items-center justify-center gap-4">
        <h1 className="text-base font-bold text-primary">{title}</h1>
        <TextBaseContent text={description} className="text-center" />
        <InnerConfirmBox onClick={onClose}>{buttonLabel}</InnerConfirmBox>
      </div>
    </Modal>
  );
}

function JokerIndicator() {
  return (
    <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2">
      <span className="loading loading-bars w-5 h-5" />
    </div>
  );
}

function JokerConfetti() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[54px] z-[4] h-0 w-0 -translate-x-1/2">
      {Array.from({ length: 18 }, (_, index) => {
        const angle = (Math.PI * 2 * index) / 18;
        const distance = 44 + (index % 4) * 10;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 20;
        const colors = ["#facc15", "#fb7185", "#38bdf8", "#4ade80", "#c084fc"];
        return (
          <span
            key={index}
            className="absolute block h-2 w-1 rounded-sm"
            style={{
              backgroundColor: colors[index % colors.length],
              transform: `translate(${x}px, ${y}px) rotate(${index * 23}deg)`,
              opacity: 0.95
            }}
          />
        );
      })}
    </div>
  );
}
