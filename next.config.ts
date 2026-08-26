import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limite padrão (1MB) é pequeno demais para upload de fotos de produto no
  // admin (/admin/fotos-produtos).
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
