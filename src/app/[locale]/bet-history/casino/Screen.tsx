import { requireAuth } from "@/lib/auth-guards";
import { CasinoBetHistorySection } from "@/sections/profile/bet-history";

export const beforeLoad = requireAuth;

export default CasinoBetHistorySection;
