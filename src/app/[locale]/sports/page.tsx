import { generateLocalizedMetadata } from "@/lib/seo";
import ClientPage from "./ClientPage";

export const generateMetadata = (props: { params: Promise<{ locale: string }> }) => generateLocalizedMetadata(props, "/sports");

export default function Page() {
  return <ClientPage />;
}
