import { requireAuth } from "@/lib/auth-guards";
import { FreeSpins } from "@/sections/profile";

export const beforeLoad = requireAuth;

export default FreeSpins;
