'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '../LoadingSpinner';
import LocationSearch from '@/components/LocationSearch';
import FileUpload from '@/components/FileUpload';
import { useNotificationStore } from '@/store/notificationStore';
import { useTheme } from '@/components/ThemeProvider';
import categories from '@/data/categories.json';
import { Check, X } from 'lucide-react';

interface StudentProfileData {
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
  skills?: string[];
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
  fields: FormField[];
}

export default function StudentProfile() {
  const { userType } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setNotification } = useNotificationStore();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [availableCategories] = useState(Object.keys(categories.categories));

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
      setProfile(data as StudentProfileData);
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

  const handleFileUpload = async (url: string, field: string) => {
    if (!profile) return;

    handleChange('documents', field, url);
    setNotification('Fichier téléchargé avec succès', 'success');
  };

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < 4) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSaveSkills = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({ skills: selectedSkills })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, skills: selectedSkills });
      setSuccess('Compétences mises à jour avec succès');
      setNotification('Compétences mises à jour avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des compétences:', error);
      setError('Erreur lors de la mise à jour des compétences');
      setNotification('Erreur lors de la mise à jour des compétences', 'error');
    } finally {
      setLoading(false);
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
      id: 'personal',
      title: 'Informations personnelles',
      fields: [
        { name: 'first_name', label: 'Prénom', type: 'text', required: true },
        { name: 'last_name', label: 'Nom', type: 'text', required: true },
        { name: 'date_of_birth', label: 'Date de naissance', type: 'date', required: true },
        { name: 'phone', label: 'Téléphone', type: 'tel', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'bio', label: 'Bio', type: 'textarea' }
      ]
    },
    {
      id: 'address',
      title: 'Adresse',
      fields: [
        { name: 'location', label: 'Rechercher une adresse', type: 'text', component: 'location' },
        { name: 'address_street', label: 'Rue et numéro', type: 'text', required: true },
        { name: 'address_country', label: 'Pays', type: 'text', required: true },
        { name: 'code_postal', label: 'Code postal', type: 'text', required: true },
        { name: 'localite', label: 'Localité', type: 'text', required: true }
      ]
    },
    {
      id: 'education',
      title: 'Formation',
      fields: [
        { name: 'educational_institution', label: 'Établissement', type: 'text', required: true },
        { name: 'level', label: 'Niveau d\'études', type: 'select', options: [
          'Secondaire',
          'Bachelier',
          'Master',
          'Doctorat'
        ], required: true }
      ]
    },
    {
      id: 'preferences',
      title: 'Préférences',
      fields: [
        { name: 'contact_preference', label: 'Préférence de contact', type: 'select', options: [
          'Email',
          'Téléphone',
          'Les deux'
        ], required: true },
        { name: 'is_private', label: 'Profil privé', type: 'checkbox' },
        { name: 'accept_dm', label: 'Accepter les messages directs', type: 'checkbox' }
      ]
    },
    {
      id: 'skills',
      title: 'Compétences',
      fields: [
        { name: 'skills', label: 'Sélectionnez vos compétences', type: 'skills' }
      ]
    },
    {
      id: 'documents',
      title: 'Documents',
      fields: [
        { name: 'cv_url', label: 'CV', type: 'file', component: 'file' },
        { name: 'avatar_url', label: 'Photo de profil', type: 'file', component: 'file' }
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-theme-primary">Profil étudiant</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et professionnelles</p>
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
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-theme-light text-theme-primary'
                  : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
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
              <h2 className="text-xl font-semibold text-theme-primary mb-6">
                {section.title}
              </h2>

              <div className="space-y-6">
                {section.fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'skills' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableCategories.map((category) => (
                            <button
                              key={category}
                              onClick={() => handleSkillToggle(category)}
                              className={`p-3 rounded-lg border transition-all duration-200 flex items-center justify-between ${
                                selectedSkills.includes(category)
                                  ? 'bg-theme-primary text-white border-theme-primary shadow-md'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-theme-primary hover:shadow-sm'
                              }`}
                            >
                              <span>{category}</span>
                              {selectedSkills.includes(category) && (
                                <Check className="w-4 h-4 ml-2" />
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">
                              {selectedSkills.length}/4 compétences sélectionnées
                            </p>
                            {selectedSkills.length === 4 && (
                              <span className="text-sm text-red-500">
                                Maximum atteint
                              </span>
                            )}
                          </div>
                          <button
                            onClick={handleSaveSkills}
                            disabled={loading || selectedSkills.length === 0}
                            className="px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                Enregistrement...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Enregistrer
                              </>
                            )}
                          </button>
                        </div>
                        {profile?.skills && profile.skills.length > 0 && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">Compétences actuelles</h3>
                            <div className="flex flex-wrap gap-2">
                              {profile.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                                >
                                  {skill}
                                  <button
                                    onClick={() => {
                                      setSelectedSkills(profile.skills?.filter((_, i) => i !== index) || []);
                                      handleSaveSkills();
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : field.component === 'location' ? (
                      <LocationSearch onSelect={handleLocationSelect} />
                    ) : field.component === 'file' ? (
                      <div>
                        <FileUpload
                          onUploadComplete={(url: string) => handleFileUpload(url, field.name)}
                          existingUrl={profile?.[field.name as keyof StudentProfileData] as string}
                          type={field.name === 'cv_url' ? 'cv' : 'avatar'}
                          userId={profile?.id as string}
                        />
                        {profile?.[field.name as keyof StudentProfileData] && (
                          <a
                            href={profile[field.name as keyof StudentProfileData] as string}
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
                        value={profile?.[field.name as keyof StudentProfileData] as string || ''}
                        onChange={(e) => handleChange(section.id, field.name, e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-theme-primary focus:ring-theme-primary"
                        rows={4}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={profile?.[field.name as keyof StudentProfileData] as string || ''}
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
                          checked={profile?.[field.name as keyof StudentProfileData] as boolean || false}
                          onChange={(e) => handleChange(section.id, field.name, e.target.checked)}
                          className="rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                        />
                        <span className="ml-2 text-sm text-gray-600">{field.label}</span>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={profile?.[field.name as keyof StudentProfileData] as string || ''}
                        onChange={(e) => handleChange(section.id, field.name, e.target.value)}
                        className="w-full rounded-lg border-gray-300 focus:border-theme-primary focus:ring-theme-primary"
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                {section.id !== 'skills' && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => handleSave(section.id)}
                      className="bg-theme-primary text-white px-6 py-2 rounded-lg hover:bg-theme-hover transition-colors"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 