import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Lint OK en local, mais ne bloque pas le build de prod
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
