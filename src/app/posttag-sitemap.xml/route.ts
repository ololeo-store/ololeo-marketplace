import { fetchPostTagSitemap } from "@/lib/sitemap-data";
import { buildUrlset, XML_HEADERS } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// Tag CMS asli dari /public/cms-tags.
export async function GET() {
  const { entries } = await fetchPostTagSitemap();
  return new Response(buildUrlset(entries), { headers: XML_HEADERS });
}
