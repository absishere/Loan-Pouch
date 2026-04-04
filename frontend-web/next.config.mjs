/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
        // Don't resolve 'fs' and 'encoding' module on the client side
        // This fixes the 'Module not found: Can't resolve 'fs'' error for face-api.js
        config.resolve.fallback = {
            fs: false,
            encoding: false,
            path: false,
            os: false,
            module: false,
        };
    }
    return config;
  },
};

export default nextConfig;
