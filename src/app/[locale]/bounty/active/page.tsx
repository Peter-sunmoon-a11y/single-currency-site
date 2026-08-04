import { generateLocalizedMetadata } from "@/lib/seo.ts";
import BountyClientPage from "../BountyClientPage.tsx";

export const generateMetadata = (props: { params: Promise<{ locale: string }> }) => generateLocalizedMetadata(props, "/bounty/active");

export default function Page() {
  return <BountyClientPage tab="active" />;
}
