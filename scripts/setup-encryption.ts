import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupEncryption() {
    try {
        const encryptionKey = process.env.DATABASE_ENCRYPTION_KEY;
        
        if (!encryptionKey) {
            console.error('La variable DATABASE_ENCRYPTION_KEY n\'est pas définie dans .env');
            process.exit(1);
        }

        // Configure la clé de chiffrement dans la base de données
        const { data, error } = await supabase
            .rpc('setup_encryption_key', {
                encryption_key: encryptionKey
            });

        if (error) throw error;

        console.log('✅ Clé de chiffrement configurée avec succès !');
        
        // Vérifie que la configuration a bien été appliquée
        const { data: verificationData, error: verificationError } = await supabase
            .rpc('verify_encryption_key');
            
        if (verificationError) throw verificationError;
        
        console.log('✅ Vérification de la configuration réussie !');

    } catch (error) {
        console.error('❌ Erreur lors de la configuration :', error);
        process.exit(1);
    }
}

setupEncryption(); 