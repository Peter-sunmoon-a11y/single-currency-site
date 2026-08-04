import { requireAuth } from "@/lib/auth-guards";
import { BonusSection } from "@/sections/profile/transactions/BonusSection";

export const beforeLoad = requireAuth;

export default BonusSection;
