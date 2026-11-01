import { Home } from "@/components/pages/Home";
import { localizedAlternates } from "@/lib/page-metadata";
export const metadata = { alternates: localizedAlternates("/") };
export default function Page() { return <Home locale="en" />; }
