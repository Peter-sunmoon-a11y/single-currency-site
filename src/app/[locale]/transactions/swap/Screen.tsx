import { requireAuth } from "@/lib/auth-guards";
import { SwapSection } from "@/sections/profile/transactions/SwapSection";

export const beforeLoad = requireAuth;

export default SwapSection;
