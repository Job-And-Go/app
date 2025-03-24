'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '../LoadingSpinner';
import LocationSearch from '@/components/LocationSearch';
import FileUpload from '@/components/FileUpload';
import { useNotificationStore } from '@/store/notificationStore';
import { useTheme } from '@/components/ThemeProvider';

interface CompanyProfileData {
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
  company_name: string;
  contact_name: string;
  tax_number: string;
  sector: string;
  address_street: string;
  address_country: string;
  contact_person_name: string;
  contact_person_role: string;
  contact_person_email: string;
  contact_person_phone: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  component?: 'location' | 'file';
}

interface Section {
  id: string;
  title: string;
  icon: string;
  fields: FormField[];
}

interface NotificationState {
  message: string | null;
  type: 'success' | 'error' | null;
  setNotification: (message: string | null, type: 'success' | 'error' | null) => void;
  clearNotification: () => void;
}

interface LocationData {
  postal_code: string;
  city: string;
  street?: string;
  country?: string;
}

interface LocationSearchProps {
  onSelect: (location: string) => void;
}

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  existingUrl?: string;
  type: 'cv' | 'avatar';
  userId: string;
}

export default function CompanyProfile() {
  const { userType } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('company');
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setNotification } = useNotificationStore();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data as CompanyProfileData);
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setError('Impossible de charger le profil');
      setNotification('Erreur lors du chargement du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    if (!profile) return;
    
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleLocationSelect = (location: string) => {
    if (!profile) return;

    const [postal_code, city] = location.split(' ');
    setProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        code_postal: postal_code,
        localite: city
      };
    });
  };

  const handleFileUpload = async (url: string, fieldName: string) => {
    try {
      if (!profile?.id) return;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [fieldName]: url })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, [fieldName]: url } : null);
      setNotification('Fichier téléchargé avec succès', 'success');
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      setNotification('Erreur lors du téléchargement du fichier', 'error');
    }
  };

  const handleSave = async (section: string) => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);

      if (error) throw error;
      setSuccess('Modifications enregistrées avec succès');
      setNotification('Profil mis à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
      setNotification('Erreur lors de la sauvegarde du profil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const sections: Section[] = [
    {
      id: 'company',
      title: 'Informations entreprise',
      icon: '🏢',
      fields: [
        { name: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true },
        { name: 'tax_number', label: 'Numéro de TVA', type: 'text', required: true },
        { name: 'sector', label: 'Secteur d\'activité', type: 'text', required: true },
        { name: 'bio', label: 'Description de l\'entreprise', type: 'textarea', required: true }
      ]
    },
    {
      id: 'address',
      title: 'Adresse',
      icon: '📍',
      fields: [
        { name: 'location', label: 'Rechercher une adresse', type: 'text', component: 'location' },
        { name: 'address_street', label: 'Rue et numéro', type: 'text', required: true },
        { name: 'address_country', label: 'Pays', type: 'text', required: true },
        { name: 'code_postal', label: 'Code postal', type: 'text', required: true },
        { name: 'localite', label: 'Localité', type: 'text', required: true }
      ]
    },
    {
      id: 'contact',
      title: 'Contact principal',
      icon: '👥',
      fields: [
        { name: 'contact_person_name', label: 'Nom du contact', type: 'text', required: true },
        { name: 'contact_person_role', label: 'Fonction', type: 'text', required: true },
        { name: 'contact_person_email', label: 'Email professionnel', type: 'email', required: true },
        { name: 'contact_person_phone', label: 'Téléphone', type: 'tel', required: true }
      ]
    },
    {
      id: 'preferences',
      title: 'Préférences',
      icon: '⚙️',
      fields: [
        { name: 'is_private', label: 'Profil privé', type: 'checkbox' },
        { name: 'accept_dm', label: 'Accepter les messages directs', type: 'checkbox' }
      ]
    },
    {
      id: 'logo',
      title: 'Logo entreprise',
      icon: '🖼️',
      fields: [
        { name: 'avatar_url', label: 'Logo', type: 'file', component: 'file' }
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-primary">Profil entreprise</h1>
        <p className="text-gray-600">Gérez les informations de votre entreprise</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-4 gap-6">
        <div className="col-span-1 space-y-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeSection === section.id
                  ? 'bg-theme-light text-theme-primary'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span className="text-xl">{section.icon}</span>
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </div>

        <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-6">
          {sections.map(section => (
            <div
              key={section.id}
              className={activeSection === section.id ? 'block' : 'hidden'}
            >
              <h2 className="text-xl font-semibold text-theme-primary mb-6 flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                {section.title}
              </h2>

              <div className="space-y-6">
                {section.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.component === 'location' ? (
                      <LocationSearch onSelect={handleLocationSelect} />
                    ) : field.component === 'file' ? (
                      <div>
                        <FileUpload
                          onUploadComplete={(url: string) => handleFileUpload(url, field.name)}
                          existingUrl={profile?.[field.name as keyof CompanyProfileData] as string}
                          type="avatar"
                          userId={profile?.id as string}
                        />
                        {profile?.[field.name as keyof CompanyProfileData] && (
                          <a
                            href={profile[field.name as keyof CompanyProfileData] as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-theme-primary hover:text-theme-hover text-sm mt-2 inline-block"
                          >
                            Voir le fichier actuel
                          </a>
                        )}
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={profile?.[field.name as keyof CompanyProfileData] as string || ''}
                        onChange={(e) => handleChange(section.id, field.name, e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-theme-primary focus:ring-theme-primary"
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={profile?.[field.name as keyof CompanyProfileData] as string || ''}
                        onChange={(e) => handleChange(section.id, field.name, e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-theme-primary focus:ring-theme-primary"
                      >
                        <option value="">Sélectionnez une option</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profile?.[field.name as keyof CompanyProfileData] as boolean || false}
                          onChange={(e) => handleChange(section.id, field.name, e.target.checked)}
                          className="rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                        />
                        <span className="ml-2 text-sm text-gray-600">{field.label}</span>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={profile?.[field.name as keyof CompanyProfileData] as string || ''}
                        onChange={(e) => handleChange(section.id, field.name, e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-theme-primary focus:ring-theme-primary"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => handleSave(section.id)}
                    className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-hover transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 