/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/c/new',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
