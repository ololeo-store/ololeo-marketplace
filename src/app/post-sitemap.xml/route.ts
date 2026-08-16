import { fetchPostSitemap } from "@/lib/sitemap-data";
import { buildUrlset, XML_HEADERS } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

// CMS post asli dari /public/cms-posts (cuma yang PUBLISHED, difilter server-side).
export async function GET() {
  const { entries } = await fetchPostSitemap();
  return new Response(buildUrlset(entries), { headers: XML_HEADERS });
}
