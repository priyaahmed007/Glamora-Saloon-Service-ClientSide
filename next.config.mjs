// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   eslint: { ignoreDuringBuilds: true },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.SERVER_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;