/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ['better-sqlite3', 'bcryptjs'],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('better-sqlite3');
        }
        return config;
    },
};

export default nextConfig;
