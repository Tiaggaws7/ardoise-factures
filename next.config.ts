import type { NextConfig } from "next";

const config: NextConfig = {
  // PGlite (base locale de dev) et react-pdf ne doivent pas être bundlés.
  serverExternalPackages: ["@electric-sql/pglite", "@react-pdf/renderer", "bcryptjs"],
  // Les polices du PDF sont lues sur le disque : on les inclut dans le déploiement.
  outputFileTracingIncludes: { "/api/documents/**": ["./assets/fonts/**"] },
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  experimental: { optimizePackageImports: ["lucide-react"] },
};

export default config;
