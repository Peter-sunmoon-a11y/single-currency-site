import { generateLocalizedMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const generateMetadata = (props: { params: Promise<{ locale: string }> }) =>
  generateLocalizedMetadata(props, "/referral/rewards-schedule");

export default function Page() {
  return <ClientPage />;
}
