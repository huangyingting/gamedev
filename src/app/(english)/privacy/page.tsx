import { PrivacyPage } from "@/components/pages/PrivacyPage";
import { localizedAlternates } from "@/lib/page-metadata";
export const metadata = { title: "Privacy", alternates: localizedAlternates("/privacy/") };
export default function Page() { return <PrivacyPage locale="en" />; }
