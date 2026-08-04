import { requireAuth } from "@/lib/auth-guards";
import { ReferralSection } from "@/sections/profile/transactions/ReferralSection";

export const beforeLoad = requireAuth;

export default ReferralSection;
