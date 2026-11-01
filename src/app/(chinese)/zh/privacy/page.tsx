import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { localizedAlternates } from "@/lib/page-metadata";
export const metadata = { title: "隐私", alternates: localizedAlternates("/privacy/") };
export default function Page() { return <PrivacyPage locale="zh" />; }
