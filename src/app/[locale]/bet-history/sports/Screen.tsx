import { requireAuth } from "@/lib/auth-guards";
import { SportsBetHistorySection } from "@/sections/profile/bet-history/index";

export const beforeLoad = requireAuth;

export default SportsBetHistorySection;
