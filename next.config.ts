import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (the parent folder also contains
  // other sites with their own lockfiles).
  turbopack: {
    root: fileURLToPath(new URL(".", import.meta.url)),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    // Images live on Cloudinary, which already resizes and delivers them from
    // its own CDN. The custom loader keeps <Image> responsive without Vercel's
    // optimizer in the path.
    loader: "custom",
    loaderFile: "./image-loader.js",
    // Fewer candidate widths = fewer CDN variants generated per image.
    deviceSizes: [640, 1080, 1920],
    imageSizes: [96, 256, 384],
    // Content images are hosted on Cloudinary; local SVG placeholders are
    // allowed so the seeded catalog renders before uploads are configured.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
