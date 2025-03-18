-- Fonction pour configurer la clé de chiffrement de manière sécurisée
CREATE OR REPLACE FUNCTION setup_encryption_key(encryption_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Configure la clé de chiffrement
    EXECUTE format('ALTER DATABASE postgres SET app.encryption_key = %L', encryption_key);
    RETURN true;
END;
$$;

-- Fonction pour vérifier que la clé est bien configurée
CREATE OR REPLACE FUNCTION verify_encryption_key()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    key_value text;
BEGIN
    SELECT current_setting('app.encryption_key') INTO key_value;
    RETURN key_value IS NOT NULL;
END;
$$; 