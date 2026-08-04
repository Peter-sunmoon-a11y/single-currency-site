import { requireAuth } from "@/lib/auth-guards";
import { Rollover } from "@/sections/profile";

export const beforeLoad = requireAuth;

export default Rollover;
