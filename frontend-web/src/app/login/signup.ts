import { createClient } from '@supabase/supabase-js';
import { sendConfirmationEmail } from '../../utils/email';

// Créer le client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',  // URL de ton projet Supabase
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' // Clé publique pour l'authentification
);

// Fonction d'inscription
export async function registerUserWithEmail(email: string, password: string) {
  try {
    // Inscrire l'utilisateur avec Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      console.error('Erreur d\'inscription:', error.message);
      throw error;
    }

    console.log('Utilisateur créé:', data);

    // Génération d'un token pour la confirmation d'email
    const confirmationToken = data.user?.id || '';

    // Envoi de l'email de confirmation avec le token
    await sendConfirmationEmail(email, confirmationToken);

    return data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
}
