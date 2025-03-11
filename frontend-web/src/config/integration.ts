import { Provider } from '@supabase/supabase-js';

export type IntegrationProvider = 'moodle' | 'smartschool' | 'toledo' | 'eperso';

interface IntegrationConfig {
  name: string;
  type: 'lti' | 'sso';
  provider: Provider;
  clientId?: string;
  authEndpoint?: string;
  tokenEndpoint?: string;
  scopes: string[];
}

export const INTEGRATION_CONFIGS: Record<IntegrationProvider, IntegrationConfig> = {
  moodle: {
    name: 'Moodle',
    type: 'lti',
    provider: 'azure' as Provider, // Temporaire, à remplacer par le vrai provider Moodle
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: '/auth/lti/moodle',
    tokenEndpoint: '/auth/lti/moodle/token'
  },
  smartschool: {
    name: 'Smartschool',
    type: 'sso',
    provider: 'azure' as Provider, // Temporaire, à remplacer par le vrai provider Smartschool
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: '/auth/sso/smartschool'
  },
  toledo: {
    name: 'Toledo',
    type: 'lti',
    provider: 'azure' as Provider, // Temporaire, à remplacer par le vrai provider Toledo
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: '/auth/lti/toledo'
  },
  eperso: {
    name: 'e-Perso',
    type: 'sso',
    provider: 'azure' as Provider, // Temporaire, à remplacer par le vrai provider e-Perso
    scopes: ['openid', 'profile', 'email'],
    authEndpoint: '/auth/sso/eperso'
  }
};

export const isLTIProvider = (provider: IntegrationProvider): boolean => {
  return INTEGRATION_CONFIGS[provider].type === 'lti';
};

export const getProviderConfig = (provider: IntegrationProvider): IntegrationConfig => {
  return INTEGRATION_CONFIGS[provider];
}; 