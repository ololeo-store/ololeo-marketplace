<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9">
<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
<xsl:template match="/">
<html lang="id">
<head>
<meta charSet="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Sitemap — Ololeo Store</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; color: #1f2430; background: #fff; }
  .hero { background: #0f1629; color: #fff; padding: 40px 32px; }
  .hero h1 { margin: 0 0 12px; font-size: 28px; font-weight: 800; }
  .hero p { margin: 4px 0; color: #b7bfd4; font-size: 14px; line-height: 1.6; }
  .hero a { color: #8ab4ff; }
  .hero strong { color: #fff; }
  .crumbs { padding: 16px 32px; font-size: 14px; color: #6b7280; }
  .crumbs a { color: #6b7280; text-decoration: none; }
  .crumbs strong { color: #1f2430; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 40px; }
  th { text-align: left; padding: 14px 32px; font-size: 13px; border-bottom: 2px solid #e5e7eb; color: #1f2430; }
  td { padding: 14px 32px; font-size: 14px; border-bottom: 1px solid #f0f1f3; color: #374151; word-break: break-all; }
  tr:nth-child(even) td { background: #fafafa; }
  a.loc { color: #2563eb; text-decoration: none; }
  a.loc:hover { text-decoration: underline; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; background: #eef2ff; color: #4338ca; font-size: 12px; font-weight: 600; }
</style>
</head>
<body>
<div class="hero">
<h1>Sitemap</h1>
<p>Dibuat secara otomatis, ini adalah Sitemap XML yang dimaksudkan untuk dikonsumsi oleh mesin pencari seperti Google atau Bing.</p>
<p>Anda dapat menemukan informasi lebih lanjut tentang sitemap XML di <a href="https://www.sitemaps.org" target="_blank" rel="noreferrer">sitemaps.org</a>.</p>
<p><strong>Sitemap ini berisi <xsl:value-of select="count(sm:urlset/sm:url)"/> URL</strong></p>
</div>
<div class="crumbs"><a href="/">Beranda</a> » <a href="/sitemap.xml">Sitemap Index</a> » <strong>Sitemap</strong></div>
<table>
<thead>
<tr><th>URL</th><th>Terakhir Diperbarui</th><th>Frekuensi</th><th>Prioritas</th></tr>
</thead>
<tbody>
<xsl:for-each select="sm:urlset/sm:url">
<tr>
<td><a class="loc"><xsl:attribute name="href"><xsl:value-of select="sm:loc"/></xsl:attribute><xsl:value-of select="sm:loc"/></a></td>
<td><xsl:value-of select="substring(sm:lastmod, 1, 10)"/></td>
<td><span class="badge"><xsl:value-of select="sm:changefreq"/></span></td>
<td><xsl:value-of select="sm:priority"/></td>
</tr>
</xsl:for-each>
</tbody>
</table>
</body>
</html>
</xsl:template>
</xsl:stylesheet>
