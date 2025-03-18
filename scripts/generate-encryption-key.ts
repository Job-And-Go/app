import crypto from 'crypto';

// Génère une clé de chiffrement sécurisée
const generateEncryptionKey = () => {
    const key = crypto.randomBytes(32).toString('hex');
    console.log('Votre nouvelle clé de chiffrement :');
    console.log(key);
    console.log('\nAjoutez cette ligne dans votre .env :');
    console.log(`DATABASE_ENCRYPTION_KEY=${key}`);
};

generateEncryptionKey(); 