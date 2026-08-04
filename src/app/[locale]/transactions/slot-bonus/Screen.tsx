import { requireAuth } from "@/lib/auth-guards";
import { BonusStoreSection } from "@/sections/profile/transactions/BonusStoreSection";

export const beforeLoad = requireAuth;

export default BonusStoreSection;
