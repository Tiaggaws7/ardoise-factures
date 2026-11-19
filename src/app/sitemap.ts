import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "http://localhost:3300";
  return ["", "/inscription", "/connexion", "/mentions-legales", "/cgu-cgv", "/confidentialite"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly", priority: p === "" ? 1 : 0.5 }));
}
