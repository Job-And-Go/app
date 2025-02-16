import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ajout de CORS et autres configurations de production
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/:path*`,
        has: [
          {
            type: 'cookie',
            key: 'session',
          },
        ],
      },
    ];
  },

  // Autres configurations de production
  productionBrowserSourceMaps: false,

  // Optionnel : Configurer les domaines autorisés pour les images et les appels API
  images: {
    domains: ['your-backend-domain.com']
  },

  // Optionnel : Ajouter des en-têtes pour la sécurité
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.API_BASE_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
