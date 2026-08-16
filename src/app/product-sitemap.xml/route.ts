import { fetchProductSitemap } from "@/lib/sitemap-data";
import { buildUrlset, XML_HEADERS } from "@/lib/sitemap";

export const dynamic = "force-dynamic";

export async function GET() {
  const { entries } = await fetchProductSitemap();
  return new Response(buildUrlset(entries), { headers: XML_HEADERS });
}
