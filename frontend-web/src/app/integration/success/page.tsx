'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Layout from '@/components/Layout';

interface IntegrationDetails {
  platform_id: string;
  api_key: string;
  integration_url: string;
  configuration_url: string;
  documentation_url: string;
}

export default function IntegrationSuccess() {
  const searchParams = useSearchParams();
  const [details, setDetails] = useState<IntegrationDetails | null>(null);
  const platformId = searchParams?.get('id');

  useEffect(() => {
    if (platformId) {
      loadIntegrationDetails();
    }
  }, [platformId]);

  const loadIntegrationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_integrations')
        .select('*')
        .eq('id', platformId)
        .single();

      if (error) throw error;
      setDetails(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (!details) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-white py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Félicitations !
            </h1>
            <p className="text-xl text-gray-600">
              Votre demande d'intégration a été enregistrée avec succès.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-black">Prochaines étapes</h2>
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-3">
                  1
                </span>
                <div>
                  <h3 className="font-medium text-black">Vérifiez votre email</h3>
                  <p className="text-gray-600">
                    Nous vous avons envoyé un email avec vos identifiants d'accès
                    au tableau de bord d'administration.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-3">
                  2
                </span>
                <div>
                  <h3 className="font-medium text-black">Configurez l'intégration</h3>
                  <p className="text-gray-600">
                    Suivez notre guide d'installation pas à pas pour configurer
                    l'intégration sur votre plateforme.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-3">
                  3
                </span>
                <div>
                  <h3 className="font-medium text-black">Testez l'intégration</h3>
                  <p className="text-gray-600">
                    Utilisez notre environnement de test pour vérifier que tout
                    fonctionne correctement.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Informations importantes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Identifiant de plateforme
                </label>
                <input
                  type="text"
                  readOnly
                  value={details.platform_id}
                  className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL d'intégration
                </label>
                <input
                  type="text"
                  readOnly
                  value={details.integration_url}
                  className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300"
                />
              </div>
              <div className="pt-4">
                <a
                  href={details.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600"
                >
                  Accéder à la documentation
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}