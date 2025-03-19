/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations pour Netlify
  swcMinify: true,
  optimizeFonts: true,
  poweredByHeader: false,
  reactStrictMode: true,
  output: 'standalone',

  images: {
    unoptimized: true,
    domains: ['api.jobandgo.fr'],
  },

  // Configuration webpack
  webpack: (config, { isServer }) => {
    // Optimisations des images
    config.module.rules.push({
      test: /\.(png|svg|jpg|jpeg|gif)$/i,
      type: 'asset/resource',
    });

    // Optimisations des polices
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    return config;
  },

  // Configuration des redirections API
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://api.jobandgo.fr/api/:path*'
          : 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 