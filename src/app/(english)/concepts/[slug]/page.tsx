import { ConceptPage } from "@/components/pages/ConceptPage";
import { concepts } from "@/lib/concepts";
import { conceptMetadata } from "@/lib/page-metadata";

export const dynamicParams = false;
export const generateStaticParams = () => concepts.map(concept => ({ slug: concept.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return conceptMetadata((await params).slug, "en");
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ConceptPage slug={(await params).slug} locale="en" />;
}
