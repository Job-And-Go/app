import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      version: '1.0',
      endpoints: {
        jobs: '/api/v1/jobs',
        auth: '/api/v1/auth',
        applications: '/api/v1/applications',
        users: '/api/v1/users'
      },
      documentation: '/api/v1/docs'
    });
  }
  
  return res.status(405).json({ error: 'Méthode non autorisée' });
} 