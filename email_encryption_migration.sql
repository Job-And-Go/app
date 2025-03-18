-- =============================================
-- MIGRATION DES EMAILS VERS UN SYSTÈME CHIFFRÉ
-- =============================================

-- !!! IMPORTANT !!!
-- 1. FAITES UN BACKUP DE VOTRE BASE DE DONNÉES AVANT DE COMMENCER
-- 2. TESTEZ D'ABORD SUR UN ENVIRONNEMENT DE DÉVELOPPEMENT
-- 3. GARDEZ PRÉCIEUSEMENT LA CLÉ DE CHIFFREMENT

-- =============================================
-- ÉTAPE 1 : Préparation de la base de données
-- =============================================

-- Activation de l'extension pgcrypto nécessaire pour le chiffrement
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- ÉTAPE 2 : Création des fonctions utilitaires
-- =============================================

-- Fonction pour générer un vecteur d'initialisation (IV)
-- L'IV est unique pour chaque email et nécessaire pour le chiffrement
CREATE OR REPLACE FUNCTION generate_iv() 
RETURNS text AS $$
BEGIN
    RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour chiffrer un email
-- Utilise AES avec l'IV généré précédemment
CREATE OR REPLACE FUNCTION encrypt_email(email text, iv text)
RETURNS text AS $$
DECLARE
    encryption_key text = current_setting('app.encryption_key');
BEGIN
    RETURN encode(
        encrypt_iv(
            email::bytea,
            decode(encryption_key, 'hex'),
            decode(iv, 'hex'),
            'aes'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer un tag d'authentification
-- Permet de vérifier l'intégrité des données chiffrées
CREATE OR REPLACE FUNCTION generate_email_tag(email text, iv text)
RETURNS text AS $$
BEGIN
    RETURN encode(
        hmac(
            email || iv,
            current_setting('app.encryption_key'),
            'sha256'
        ),
        'hex'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour déchiffrer un email
-- Utilisée pour récupérer l'email en clair quand nécessaire
CREATE OR REPLACE FUNCTION decrypt_email(encrypted_email text, iv text)
RETURNS text AS $$
DECLARE
    encryption_key text = current_setting('app.encryption_key');
BEGIN
    RETURN convert_from(
        decrypt_iv(
            decode(encrypted_email, 'hex'),
            decode(encryption_key, 'hex'),
            decode(iv, 'hex'),
            'aes'
        ),
        'utf8'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ÉTAPE 3 : Configuration de la clé de chiffrement
-- =============================================

-- !!! REMPLACER 'votre_clé_secrète_très_longue' par une vraie clé de chiffrement !!!
-- La clé doit être en hexadécimal et faire au moins 32 caractères
ALTER DATABASE postgres SET app.encryption_key = 'votre_clé_secrète_très_longue';

-- =============================================
-- ÉTAPE 4 : Modification de la table profiles
-- =============================================

-- Ajout des nouvelles colonnes pour stocker les données chiffrées
ALTER TABLE profiles 
ADD COLUMN encrypted_email TEXT,
ADD COLUMN email_iv TEXT,
ADD COLUMN email_tag TEXT;

-- Migration des données existantes
-- Chiffre tous les emails existants
UPDATE profiles
SET 
    email_iv = generate_iv(),
    encrypted_email = encrypt_email(email, email_iv),
    email_tag = generate_email_tag(email, email_iv)
WHERE email IS NOT NULL;

-- Ajout d'une contrainte pour s'assurer de l'intégrité des données
-- Soit toutes les colonnes sont NULL, soit aucune ne l'est
ALTER TABLE profiles
ADD CONSTRAINT email_encryption_complete 
CHECK (
    (encrypted_email IS NULL AND email_iv IS NULL AND email_tag IS NULL) OR
    (encrypted_email IS NOT NULL AND email_iv IS NOT NULL AND email_tag IS NOT NULL)
);

-- =============================================
-- ÉTAPE 5 : Vérification de la migration
-- =============================================

-- Cette requête permet de vérifier que le chiffrement fonctionne
-- Elle affiche les emails originaux et déchiffrés pour comparaison
SELECT 
    email as email_original,
    encrypted_email,
    email_iv,
    email_tag,
    decrypt_email(encrypted_email, email_iv) as email_dechiffre
FROM profiles
LIMIT 5;

-- =============================================
-- ÉTAPE 6 : Suppression de l'ancienne colonne
-- =============================================

-- !!! NE FAIRE CETTE ÉTAPE QU'APRÈS AVOIR VÉRIFIÉ QUE TOUT FONCTIONNE !!!
-- ALTER TABLE profiles DROP COLUMN email;

-- =============================================
-- ÉTAPE 7 : Création d'une vue pour faciliter l'accès
-- =============================================

-- Cette vue permet d'accéder facilement aux emails déchiffrés
-- tout en gardant la sécurité du chiffrement
CREATE OR REPLACE VIEW profiles_with_email AS
SELECT 
    p.*,
    decrypt_email(encrypted_email, email_iv) as email
FROM profiles p;

-- =============================================
-- NOTES IMPORTANTES
-- =============================================
-- 1. Gardez une copie sécurisée de la clé de chiffrement
-- 2. Mettez à jour votre application pour utiliser les nouvelles colonnes
-- 3. Utilisez la vue profiles_with_email pour un accès simplifié aux emails
-- 4. Ne supprimez l'ancienne colonne qu'après avoir tout testé
-- 5. Pensez à mettre à jour vos sauvegardes et procédures de récupération 