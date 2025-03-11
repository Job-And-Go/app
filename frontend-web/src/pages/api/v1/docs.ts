import { NextApiRequest, NextApiResponse } from 'next';

const API_DOCS = {
  openapi: '3.0.0',
  info: {
    title: 'Job And GO API',
    version: '1.0.0',
    description: 'API pour l\'intégration de Job And GO dans d\'autres plateformes'
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
      description: 'Serveur de développement'
    },
    {
      url: 'https://staging.jobandgo.com/api/v1',
      description: 'Serveur de staging'
    },
    {
      url: 'https://api.jobandgo.com/api/v1',
      description: 'Serveur de production'
    }
  ],
  paths: {
    '/auth': {
      post: {
        summary: 'Authentification',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['sso', 'credentials']
                  },
                  provider: {
                    type: 'string',
                    description: 'Pour SSO uniquement'
                  },
                  email: {
                    type: 'string',
                    description: 'Pour credentials uniquement'
                  },
                  password: {
                    type: 'string',
                    description: 'Pour credentials uniquement'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authentification réussie'
          }
        }
      }
    },
    '/jobs': {
      get: {
        summary: 'Liste des offres',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer' }
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' }
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Liste des offres avec pagination'
          }
        }
      },
      post: {
        summary: 'Créer une offre',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  salary: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Offre créée'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer'
      }
    }
  }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(API_DOCS);
  }
  
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 