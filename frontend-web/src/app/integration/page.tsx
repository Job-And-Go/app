'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const PLATFORM_TYPES = [
  {
    id: 'moodle',
    name: 'Moodle', 
    icon: '🎓',
    description: 'Plateforme d\'apprentissage open source'
  },
  {
    id: 'smartschool',
    name: 'Smartschool',
    icon: '🏫', 
    description: 'Plateforme éducative numérique'
  },
  {
    id: 'toledo',
    name: 'Toledo',
    icon: '🎯',
    description: 'Système de gestion d\'apprentissage de KU Leuven'
  },
  {
    id: 'eperso',
    name: 'e-Perso',
    icon: '👤',
    description: 'Portail personnel étudiant'
  }
];

export default function IntegrationPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform_type: '',
    platform_name: '',
    platform_url: '',
    contact_email: '',
    contact_name: '',
    institution_size: ''
  });

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_integration_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!profile?.is_integration_admin) {
          router.push('/');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la vérification des droits:', error);
        router.push('/');
      }
    };

    checkAdminAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/integration/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Erreur lors de l\'inscription');

      const data = await response.json();
      router.push(`/integration/success?id=${data.platform_id}`);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (isLoading) {
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
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-b from-green-400 to-white pt-8 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                Intégrer Job And GO
              </h1>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Connectez votre établissement à Job And GO. Offrez à vos étudiants un accès direct 
                aux opportunités d'emploi directement depuis votre plateforme éducative.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="mb-12">
              <div className="flex justify-center items-center space-x-4 mb-8">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= num
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {step === 1 && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold mb-6">
                  Choisissez votre plateforme
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {PLATFORM_TYPES.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => {
                        setFormData({ ...formData, platform_type: platform.id });
                        setStep(2);
                      }}
                      className={`p-6 border-2 rounded-lg text-left hover:border-green-500 transition-colors ${
                        formData.platform_type === platform.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <h4 className="font-semibold">{platform.name}</h4>
                      <p className="text-sm text-black">{platform.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-semibold mb-6">
                  Informations de l'établissement
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-black">
                    Nom de l'établissement
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.platform_name}
                    onChange={(e) => setFormData({ ...formData, platform_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black">
                    URL de la plateforme
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.platform_url}
                    onChange={(e) => setFormData({ ...formData, platform_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="https://moodle.votreecole.be"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Nom du contact
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Email du contact
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black">
                    Taille de l'établissement
                  </label>
                  <select
                    value={formData.institution_size}
                    onChange={(e) => setFormData({ ...formData, institution_size: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="">Sélectionnez une option</option>
                    <option value="small">Moins de 1000 étudiants</option>
                    <option value="medium">1000 à 5000 étudiants</option>
                    <option value="large">Plus de 5000 étudiants</option>
                  </select>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-100 text-black px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
                  >
                    Envoyer la demande
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡️</div>
              <h3 className="font-semibold mb-2">Installation rapide</h3>
              <p className="text-black">
                Intégration en quelques minutes avec une configuration automatisée
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">Sécurisé</h3>
              <p className="text-black">
                Authentification SSO et chiffrement des données
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Analytics</h3>
              <p className="text-black">
                Suivez l'engagement des étudiants et les performances
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}