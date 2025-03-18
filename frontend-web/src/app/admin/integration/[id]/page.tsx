'use client';

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface IntegrationConfig {
  platform_id: string;
  type: string;
  name: string;
  url: string;
  status: 'pending' | 'active' | 'suspended';
  configuration: any;
}

export default function IntegrationAdmin({ params }: { params: { id: string } }) {
  const [config, setConfig] = useState<IntegrationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadIntegration();
  }, [params.id]);

  const loadIntegration = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_integrations')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'active' | 'suspended') => {
    try {
      const { error } = await supabase
        .from('platform_integrations')
        .update({ status: newStatus })
        .eq('id', params.id);

      if (error) throw error;
      loadIntegration();
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
    }
  };

  const updateConfig = async (newConfig: any) => {
    try {
      const { error } = await supabase
        .from('platform_integrations')
        .update({ configuration: newConfig })
        .eq('id', params.id);

      if (error) throw error;
      loadIntegration();
    } catch (error) {
      console.error('Erreur de configuration:', error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!config) return <div>Intégration non trouvée</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Configuration de l'intégration - {config.name}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <p className="mt-1">{config.type}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL</label>
            <p className="mt-1">{config.url}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select
              value={config.status}
              onChange={(e) => updateStatus(e.target.value as 'active' | 'suspended')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="pending">En attente</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Configuration technique</h2>
        <div className="space-y-4">
          {config.type === 'moodle' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Version LTI
                </label>
                <input
                  type="text"
                  value={config.configuration.lti_version}
                  onChange={(e) => updateConfig({
                    ...config.configuration,
                    lti_version: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL de l'outil
                </label>
                <input
                  type="text"
                  value={config.configuration.tool_url}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300"
                />
              </div>
            </>
          )}

          {config.type === 'smartschool' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL des métadonnées SAML
                </label>
                <input
                  type="text"
                  value={config.configuration.saml_metadata_url}
                  readOnly
                  className="mt-1 block w-full rounded-md bg-gray-50 border-gray-300"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Limite de requêtes (par minute)
            </label>
            <input
              type="number"
              value={config.configuration.rate_limit}
              onChange={(e) => updateConfig({
                ...config.configuration,
                rate_limit: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fonctionnalités activées
            </label>
            <div className="mt-2 space-y-2">
              {Object.entries(config.configuration.features).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={enabled as boolean}
                    onChange={(e) => updateConfig({
                      ...config.configuration,
                      features: {
                        ...config.configuration.features,
                        [feature]: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                  <span className="ml-2">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 