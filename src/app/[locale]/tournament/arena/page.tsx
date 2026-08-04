import { generateLocalizedMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const generateMetadata = (props: { params: Promise<{ locale: string }> }) => generateLocalizedMetadata(props, "/tournament/arena");

export default function Page() {
  return <ClientPage />;
}
