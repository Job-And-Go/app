import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Charger le fichier .env depuis la racine du projet
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

// Vérifier les variables d'environnement
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Les variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const VALID_USER_TYPES = ['student', 'employer'] as const;
type UserType = typeof VALID_USER_TYPES[number];

router.post('/register', async (req, res) => {
  try {
    console.log('Données reçues:', req.body);
    const { email, password, userType, full_name } = req.body;

    // Valider les champs requis
    if (!email || !password || !userType || !full_name) {
      console.log('Validation échouée:', { email, userType, full_name });
      return res.status(400).json({ 
        error: 'Email, mot de passe, type d\'utilisateur et nom complet sont requis' 
      });
    }

    // Valider le type d'utilisateur
    if (!VALID_USER_TYPES.includes(userType as UserType)) {
      return res.status(400).json({ 
        error: 'Type d\'utilisateur invalide' 
      });
    }

    // Créer l'utilisateur
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { type: userType, full_name },
    });

    if (userError || !userData?.user) {
      console.error('Erreur création utilisateur:', userError);
      return res.status(400).json({ 
        error: 'Erreur lors de la création de l\'utilisateur' 
      });
    }

    console.log('Utilisateur créé:', userData.user.id);

    // Créer le profil
    const profileData = {
      id: userData.user.id,
      type: userType,
      full_name: full_name,
      created_at: new Date().toISOString(),
    };

    console.log('Tentative création profil:', profileData);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError || !profile) {
      console.error('Erreur insertion profil:', profileError);
      await supabase.auth.admin.deleteUser(userData.user.id);
      return res.status(400).json({ 
        error: 'Erreur lors de l\'insertion du profil' 
      });
    }

    console.log('Profil créé avec succès:', profile);
    return res.status(201).json({ user: userData, profile });
  } catch (error) {
    console.error('Erreur d\'inscription complète:', error);
    return res.status(500).json({ 
      error: 'Erreur lors de l\'inscription' 
    });
  }
});

export default router;