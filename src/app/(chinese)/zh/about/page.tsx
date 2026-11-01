import { AboutPage } from "@/components/pages/AboutPage";
import { localizedAlternates } from "@/lib/page-metadata";
export const metadata = { title: "关于", alternates: localizedAlternates("/about/") };
export default function Page() { return <AboutPage locale="zh" />; }
