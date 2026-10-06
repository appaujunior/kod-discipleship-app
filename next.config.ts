import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The KJV text lives in public/bible and is read server-side for
  // verse-of-the-day and reading previews, so trace it into serverless functions.
  outputFileTracingIncludes: {
    "/**": ["./public/bible/**/*"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
