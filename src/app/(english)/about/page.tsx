import { AboutPage } from "@/components/pages/AboutPage";
import { localizedAlternates } from "@/lib/page-metadata";
export const metadata = { title: "About", alternates: localizedAlternates("/about/") };
export default function Page() { return <AboutPage locale="en" />; }
