'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import StudentProfile from '@/components/profiles/StudentProfile';
import ParticularProfile from '@/components/profiles/ParticularProfile';
import CompanyProfile from '@/components/profiles/CompanyProfile';
import LoadingSpinner from '@/components/LoadingSpinner';
import LocationSearch from '@/components/LocationSearch';
import FileUpload from '@/components/FileUpload';
import { useNotificationStore } from '@/store/notificationStore';
import Layout from '@/components/Layout';

interface ProfileData {
  id: string;
  type: string;
  email: string;
  phone: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  code_postal: string;
  localite: string;
  is_private: boolean;
  accept_dm: boolean;
  consent: boolean;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  educational_institution: string;
  level: string;
  cv_url: string;
  contact_preference: string;
  address_street: string;
  address_country: string;
  company_name: string;
  contact_name: string;
  tax_number: string;
  sector: string;
}

export default function ProfilePage() {
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setNotification } = useNotificationStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('type')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserType(profile.type);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setNotification('Erreur lors du chargement du profil', 'error');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, setNotification]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const renderProfileComponent = () => {
    switch (userType) {
      case 'student':
        return <StudentProfile />;
      case 'particulier':
        return <ParticularProfile />;
      case 'professionnel':
        return <CompanyProfile />;
      default:
        return (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800">Type de profil non reconnu</h2>
            <p className="text-gray-600 mt-2">Veuillez contacter le support.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow">
            {renderProfileComponent()}
          </div>
        </div>
      </div>
    </Layout>
  );
} 