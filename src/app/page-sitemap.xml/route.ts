import { getPageSitemap } from "@/lib/sitemap-data";
import { buildUrlset, XML_HEADERS } from "@/lib/sitemap";

// Halaman statis/marketing — bukan dari API, daftarnya fixed di kode.
export function GET() {
  const { entries } = getPageSitemap();
  return new Response(buildUrlset(entries), { headers: XML_HEADERS });
}
