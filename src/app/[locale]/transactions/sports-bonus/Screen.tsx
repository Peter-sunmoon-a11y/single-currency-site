import { requireAuth } from "@/lib/auth-guards";
import { SportsBonusStoreSection } from "@/sections/profile/transactions/SportsBonusStoreSection";

export const beforeLoad = requireAuth;

export default SportsBonusStoreSection;
