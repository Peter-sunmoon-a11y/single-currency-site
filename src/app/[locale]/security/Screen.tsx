import { requireAuth } from "@/lib/auth-guards";
import { Security } from "@/sections/profile";

export const beforeLoad = requireAuth;

export default Security;
