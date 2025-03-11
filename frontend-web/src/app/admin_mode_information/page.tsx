'use client';

import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminModeInformation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setIsLoading(false);
    }
  }, []);

  const features = [
    {
      icon: '🔌',
      title: 'Intégration API',
      description: 'Connectez StuJob à vos systèmes existants via notre API RESTful'
    },
    {
      icon: '🔄',
      title: 'Synchronisation',
      description: 'Synchronisez automatiquement les données entre vos plateformes et StuJob'
    },
    {
      icon: '📱',
      title: 'Multi-Plateformes',
      description: 'Compatible avec Moodle, Smartschool et autres plateformes éducatives'
    },
    {
      icon: '🔐',
      title: 'Sécurité',
      description: 'Authentification sécurisée via tokens JWT et HTTPS'
    }
  ];

  const requirements = [
    {
      icon: '💻',
      title: 'Compétences Techniques',
      description: 'Connaissances en API REST et intégration de systèmes'
    },
    {
      icon: '📋',
      title: 'Documentation',
      description: 'Accès à notre documentation technique détaillée'
    },
    {
      icon: '🔑',
      title: 'Clés API',
      description: 'Obtention des clés API et tokens d\'authentification'
    }
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-b from-blue-600 to-blue-400 pt-12 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                Mode Intégration
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                Intégrez StuJob à vos plateformes existantes
              </p>
              <button
                onClick={() => router.push('/integration')}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Commencer à intégrer
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-black">
              Fonctionnalités d'Intégration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-6 rounded-lg border border-gray-100 hover:border-blue-500 transition-colors">
                  <div className="text-4xl">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-black">{feature.title}</h3>
                    <p className="text-black">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-black">
              Prérequis Techniques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {requirements.map((requirement, index) => (
                <div key={index} className="text-center p-6">
                  <div className="text-4xl mb-4">{requirement.icon}</div>
                  <h3 className="font-semibold text-lg mb-2 text-black">{requirement.title}</h3>
                  <p className="text-black">{requirement.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-black">
              Comment Commencer l'Intégration
            </h2>
            <div className="prose max-w-none">
              <p className="text-black mb-4">
                Pour intégrer StuJob à votre plateforme, suivez ces étapes :
              </p>
              <ul className="list-decimal pl-6 text-black">
                <li>Activez le mode intégration dans vos paramètres de compte</li>
                <li>Consultez notre documentation technique</li>
                <li>Obtenez vos clés API dans l'espace développeur</li>
                <li>Testez l'intégration dans notre environnement de développement</li>
                <li>Déployez en production une fois les tests validés</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-black">
              Support Technique
            </h2>
            <div className="prose max-w-none">
              <p className="text-black mb-4">
                Notre équipe technique est disponible pour vous accompagner dans votre processus d'intégration :
              </p>
              <ul className="list-disc pl-6 text-black">
                <li>Documentation technique complète</li>
                <li>Support par email dédié aux intégrations a l'adresse : <a href="mailto:dev@stujob.be">dev@stujob.be</a></li>
                <li>Environnement de test disponible</li>
                <li>Exemples de code et SDK disponibles</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}