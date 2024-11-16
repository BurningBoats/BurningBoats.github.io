import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProduction ? '/burningboats.github.io' : '',
  assetPrefix: isProduction ? '/burningboats.github.io' : '',
};

export default nextConfig;
