import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const ReferralGuard = ({ children }: { children: (data: boolean) => ReactNode }) => {
  const { status } = useAuth();

  return children(status?.referral_enable !== 0)
};
