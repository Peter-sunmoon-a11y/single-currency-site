import { generateLocalizedMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const generateMetadata = (props: { params: Promise<{ locale: string }> }) => generateLocalizedMetadata(props, "/referral");

export default function Page() {
  return <ClientPage />;
}
