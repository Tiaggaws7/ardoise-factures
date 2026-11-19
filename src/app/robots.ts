import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.APP_URL ?? "http://localhost:3300";
  return {
    rules: { userAgent: "*", allow: ["/", "/mentions-legales", "/cgu-cgv", "/confidentialite"], disallow: ["/api/", "/tableau-de-bord", "/documents", "/clients", "/profil", "/abonnement"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
