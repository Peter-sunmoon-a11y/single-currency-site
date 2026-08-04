import { requireAuth } from "@/lib/auth-guards";
import { WithdrawSection } from "@/sections/profile/transactions/WithdrawSection";

export const beforeLoad = requireAuth;

export default WithdrawSection;
