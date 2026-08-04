import { requireAuth } from "@/lib/auth-guards";
import { CommissionSection } from "@/sections/profile/transactions/CommissionSection";

export const beforeLoad = requireAuth;

export default CommissionSection;
