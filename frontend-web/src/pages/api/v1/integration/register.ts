import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

interface PlatformRegistration {
  platform_type: 'moodle' | 'smartschool' | 'toledo' | 'eperso';
  platform_url: string;
  platform_name: string;
  contact_email: string;
  callback_url?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const registration: PlatformRegistration = req.body;
    
    // Générer une clé API unique
    const apiKey = crypto.randomBytes(32).toString('hex');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Enregistrer la plateforme
    const { data: platform, error } = await supabase
      .from('platform_integrations')
      .insert({
        type: registration.platform_type,
        url: registration.platform_url,
        name: registration.platform_name,
        contact_email: registration.contact_email,
        callback_url: registration.callback_url,
        api_key_hash: keyHash,
        status: 'pending',
        configuration: generateDefaultConfig(registration.platform_type)
      })
      .select()
      .single();

    if (error) throw error;

    // Envoyer les informations d'intégration
    return res.status(201).json({
      platform_id: platform.id,
      api_key: apiKey,
      integration_url: `${process.env.NEXT_PUBLIC_API_URL}/integration/${platform.id}`,
      configuration_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/integration/${platform.id}`,
      documentation_url: `${process.env.NEXT_PUBLIC_APP_URL}/docs/integration/${registration.platform_type}`
    });

  } catch (error: any) {
    console.error('Erreur d\'enregistrement:', error);
    return res.status(400).json({ error: error.message });
  }
}

function generateDefaultConfig(platformType: string) {
  const baseConfig = {
    sso_enabled: true,
    webhook_enabled: false,
    allowed_origins: [],
    rate_limit: 1000,
    features: {
      jobs: true,
      applications: true,
      messaging: true
    }
  };

  switch (platformType) {
    case 'moodle':
      return {
        ...baseConfig,
        lti_version: '1.3',
        tool_url: `${process.env.NEXT_PUBLIC_API_URL}/lti/launch`,
        auth_login_url: `${process.env.NEXT_PUBLIC_API_URL}/lti/auth`,
        auth_token_url: `${process.env.NEXT_PUBLIC_API_URL}/lti/token`,
        key_set_url: `${process.env.NEXT_PUBLIC_API_URL}/lti/keys`
      };

    case 'smartschool':
      return {
        ...baseConfig,
        saml_metadata_url: `${process.env.NEXT_PUBLIC_API_URL}/saml/metadata`,
        saml_acs_url: `${process.env.NEXT_PUBLIC_API_URL}/saml/acs`,
        saml_sls_url: `${process.env.NEXT_PUBLIC_API_URL}/saml/sls`
      };

    default:
      return baseConfig;
  }
} 