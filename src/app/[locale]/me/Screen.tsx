import { requireAuth } from "@/lib/auth-guards";
import { ProfileMsg } from "@/sections/profile";

export const beforeLoad = requireAuth;

export default ProfileMsg;
