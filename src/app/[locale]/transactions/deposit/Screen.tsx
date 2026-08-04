import { requireAuth } from "@/lib/auth-guards";
import { DepositSection } from "@/sections/profile/transactions/DepositSection";

export const beforeLoad = requireAuth;

export default DepositSection;
