import { SiteLayout, siteMetadata } from "@/components/SiteLayout";
export { viewport } from "@/components/SiteLayout";
export const metadata = siteMetadata("en");

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteLayout locale="en">{children}</SiteLayout>;
}
