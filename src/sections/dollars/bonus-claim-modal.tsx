import { Suspense, lazy } from "react";
import type { BonusClaimModalProps } from "@/sections/dollars/bonus-claim-modal-content.tsx";

const BonusClaimModalContent = lazy(() => import("@/sections/dollars/bonus-claim-modal-content.tsx").then((m) => ({ default: m.BonusClaimModalContent })));

export const BonusClaimModal = (props: BonusClaimModalProps) => {
  if (!props.open) return null;

  return (
    <Suspense fallback={null}>
      <BonusClaimModalContent {...props} />
    </Suspense>
  );
};

export { InnerCoinBox } from "@/sections/dollars/inner-coin-box.tsx";
