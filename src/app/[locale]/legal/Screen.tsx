import { requireAuth } from "@/lib/auth-guards";
import { Legal } from "@/sections/profile";

export const beforeLoad = requireAuth;

export default Legal;
