import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev indicator overlaps the sidebar footer; errors still show as an overlay.
  devIndicators: false,
};

export default nextConfig;
