import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      if (req.body.type === 'sso') {
        return handleSSO(req, res);
      } else if (req.body.type === 'credentials') {
        return handleCredentials(req, res);
      }
      return res.status(400).json({ error: 'Type d\'authentification non supporté' });

    case 'GET':
      return handleSession(req, res);

    default:
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

async function handleSSO(req: NextApiRequest, res: NextApiResponse) {
  const { provider, redirectUrl } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleCredentials(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body;
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function handleSession(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    return res.status(200).json(session);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
} 