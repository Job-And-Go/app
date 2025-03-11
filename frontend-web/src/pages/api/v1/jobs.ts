import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      if (req.query.id) {
        return getJob(req, res);
      }
      return getJobs(req, res);

    case 'POST':
      return createJob(req, res);

    case 'PUT':
      return updateJob(req, res);

    case 'DELETE':
      return deleteJob(req, res);

    default:
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

async function getJobs(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', limit = '10', search, type } = req.query;
  
  try {
    let query = supabase
      .from('jobs')
      .select('*, employer:profiles(id, full_name)');

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const from = (parseInt(page as string) - 1) * parseInt(limit as string);
    query = query
      .range(from, from + parseInt(limit as string) - 1)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;

    return res.status(200).json({
      data,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: count
      }
    });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function getJob(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, employer:profiles(id, full_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function createJob(req: NextApiRequest, res: NextApiResponse) {
  const { title, description, location, salary, type } = req.body;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        location,
        salary,
        type,
        employer_id: session.user.id
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function updateJob(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updates = req.body;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .update(updates)
      .eq('id', id)
      .eq('employer_id', session.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Offre non trouvée ou non autorisé' });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

async function deleteJob(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('employer_id', session.user.id);

    if (error) throw error;
    return res.status(204).send(null);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
} 