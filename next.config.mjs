/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server bundle for the container image (.next/standalone).
  output: "standalone",
  poweredByHeader: false,
  // The app uses no next/image. Do not run the image optimizer.
  images: { unoptimized: true },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
export default nextConfig;
