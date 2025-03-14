'use client';

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LocationSearch from '@/components/LocationSearch';
import FileUpload from '@/components/FileUpload'; 
import { useNotificationStore } from '@/store/notificationStore';
import Layout from '@/components/Layout';

interface UserProfile {
  id: string;
  full_name: string;
  type: string;
  bio: string;
  avatar_url: string;
  cv_url: string;
  code_postal: string;
  localite: string;
  is_private: boolean;
  accept_dm: boolean;
  is_integration_admin: boolean;
  first_name?: string;
  last_name?: string;
  educational_institution?: string;
  level?: string;
  contact_preference?: string;
  company_name?: string;
  legal_name?: string;
  tax_number?: string;
  sector?: string;
  contact_person_name?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  phone: string;
}

export default function Profile() {
  const router = useRouter();
  const { setNotification } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    full_name: "",
    type: "",
    bio: "",
    avatar_url: "",
    cv_url: "",
    code_postal: "",
    localite: "",
    is_private: true,
    accept_dm: false,
    is_integration_admin: false,
    first_name: "",
    last_name: "",
    phone: ""
  });

  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        // Vérifier si le profil existe
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Le profil n'existe pas, on le crée
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || "",
              type: user.user_metadata?.type || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              is_private: true,
              accept_dm: false,
              is_integration_admin: false
            });

          if (insertError) throw insertError;

          // Récupérer le profil nouvellement créé
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (newProfile) {
            setUserProfile({
              id: newProfile.id,
              full_name: newProfile.full_name || "",
              type: newProfile.type || "",
              bio: newProfile.bio || "",
              avatar_url: newProfile.avatar_url || "",
              cv_url: newProfile.cv_url || "",
              code_postal: newProfile.code_postal || "",
              localite: newProfile.localite || "",
              is_private: newProfile.is_private ?? true,
              accept_dm: newProfile.accept_dm ?? false,
              is_integration_admin: newProfile.is_integration_admin ?? false,
              first_name: newProfile.first_name || "",
              last_name: newProfile.last_name || "",
              educational_institution: newProfile.educational_institution || "",
              level: newProfile.level || "",
              contact_preference: newProfile.contact_preference || "",
              company_name: newProfile.company_name || "",
              tax_number: newProfile.tax_number || "",
              sector: newProfile.sector || "",
              contact_person_name: newProfile.contact_person_name || "",
              contact_person_email: newProfile.contact_person_email || "",
              contact_person_phone: newProfile.contact_person_phone || "",
              phone: newProfile.phone || ""
            });
          }
        } else if (profile) {
          setUserProfile({
            id: profile.id,
            full_name: profile.full_name || "",
            type: profile.type || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
            cv_url: profile.cv_url || "",
            code_postal: profile.code_postal || "",
            localite: profile.localite || "",
            is_private: profile.is_private ?? true,
            accept_dm: profile.accept_dm ?? false,
            is_integration_admin: profile.is_integration_admin ?? false,
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            educational_institution: profile.educational_institution || "",
            level: profile.level || "",
            contact_preference: profile.contact_preference || "",
            company_name: profile.company_name || "",
            tax_number: profile.tax_number || "",
            sector: profile.sector || "",
            contact_person_name: profile.contact_person_name || "",
            contact_person_email: profile.contact_person_email || "",
            contact_person_phone: profile.contact_person_phone || "",
            phone: profile.phone || ""
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        setError("Erreur lors du chargement du profil");
        setLoading(false);
      }
    };

    getProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, type } = e.target;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setUserProfile(prev => {
      const newProfile = {
        ...prev,
        [name]: value
      };

      // Si on active le mode privé, désactiver les messages directs
      if (name === 'is_private' && value === true) {
        newProfile.accept_dm = false;
      }

      return newProfile;
    });
  };

  const handleLocationSelect = (location: string) => {
    const [codePostal, ...localiteParts] = location.split(' ');
    const localite = localiteParts.join(' ');
    
    setUserProfile(prev => ({
      ...prev,
      code_postal: codePostal,
      localite: localite
    }));
  };

  const handleFileUpload = (type: 'cv' | 'avatar') => (url: string) => {
    setUserProfile(prev => ({
      ...prev,
      [type === 'cv' ? 'cv_url' : 'avatar_url']: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = { ...userProfile };
      
      // Gestion des noms selon le type d'utilisateur
      if (userProfile.type === 'student' || userProfile.type === 'particulier') {
        updateData.first_name = userProfile.first_name;
        updateData.last_name = userProfile.last_name;
        updateData.full_name = `${userProfile.first_name} ${userProfile.last_name}`;
      } else {
        updateData.full_name = userProfile.full_name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userProfile.id);

      if (error) throw error;

      setSuccess('Profil mis à jour avec succès');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (userProfile.type) {
      case 'student':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Établissement</label>
              <input
                type="text"
                name="educational_institution"
                value={userProfile.educational_institution}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Niveau d'études</label>
              <input
                type="text"
                name="level"
                value={userProfile.level}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
          </>
        );
      case 'particulier':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Préférence de contact</label>
              <input
                type="text"
                name="contact_preference"
                value={userProfile.contact_preference}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
              />
            </div>
          </>
        );
      case 'professionnel':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom public</label>
              <input
                type="text"
                name="full_name"
                value={userProfile.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dénomination sociale</label>
              <input
                type="text"
                name="company_name"
                value={userProfile.company_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de TVA</label>
              <input
                type="text"
                name="tax_number"
                value={userProfile.tax_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Secteur d'activité</label>
              <input
                type="text"
                name="sector"
                value={userProfile.sector}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
          </>
        );
      case 'etablissement':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom public</label>
              <input
                type="text"
                name="full_name"
                value={userProfile.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dénomination sociale</label>
              <input
                type="text"
                name="company_name"
                value={userProfile.company_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du contact</label>
              <input
                type="text"
                name="contact_person_name"
                value={userProfile.contact_person_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email du contact</label>
              <input
                type="email"
                name="contact_person_email"
                value={userProfile.contact_person_email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone du contact</label>
              <input
                type="tel"
                name="contact_person_phone"
                value={userProfile.contact_person_phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-green-400 to-white py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                name="first_name"
                value={userProfile.first_name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="last_name"
                value={userProfile.last_name || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type de compte</label>
              <input
                type="text"
                name="type"
                value={userProfile.type}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={userProfile.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
              />
            </div>

            {renderTypeSpecificFields()}

            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                name="bio"
                value={userProfile.bio}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-400 focus:ring-green-400 text-black"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Localisation</label>
              <LocationSearch onSelect={handleLocationSelect} />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo de profil
              </label>
              <FileUpload
                type="avatar"
                onUploadComplete={handleFileUpload('avatar')}
                existingUrl={userProfile.avatar_url}
                userId={user?.id || ''}
              />
            </div>

            {userProfile.type === 'student' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CV (PDF)
                  <span className="text-xs text-gray-500 ml-1">
                    (Format PDF uniquement, max 5MB)
                  </span>
                </label>
                <FileUpload
                  type="cv"
                  onUploadComplete={handleFileUpload('cv')}
                  existingUrl={userProfile.cv_url}
                  userId={user?.id || ''}
                />
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_private"
                    checked={userProfile.is_private}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Profil privé
                </label>

                {!userProfile.is_private && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="accept_dm"
                      checked={userProfile.accept_dm}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Accepter les messages directs
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {userProfile.is_private 
                  ? "En mode privé, seules les personnes avec qui vous avez une candidature acceptée peuvent vous contacter"
                  : "En mode public, votre profil est visible par tous les utilisateurs"}
              </p>
            </div>

            {userProfile.type === 'employer' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mode Admin</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={userProfile.is_integration_admin}
                        onChange={(e) => {
                          if (e.target.checked !== userProfile.is_integration_admin) {
                            setShowAdminConfirmation(true);
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Activer le mode admin</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Le mode admin permet d'intégrer l'application sur différentes plateformes et supports
                      <br />
                      <a href="/admin_mode_information" className="text-green-500 hover:text-green-600">En savoir plus sur le mode admin</a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {showAdminConfirmation && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Confirmation du mode admin
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {userProfile.is_integration_admin 
                      ? "Êtes-vous sûr de vouloir désactiver le mode admin ? Vous ne pourrez plus gérer l'intégration de l'application sur vos différentes plateformes."
                      : "Le mode admin vous permettra d'intégrer l'application sur vos différentes plateformes (site web, intranet, applications mobiles, etc.). Cette demande nécessite une validation de notre équipe. "} 
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmation(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const newValue = !userProfile.is_integration_admin;
                        try {
                          const { error } = await supabase
                            .from('profiles')
                            .update({ 
                              is_integration_admin: newValue,
                              updated_at: new Date().toISOString()
                            })
                            .eq('id', user.id);

                          if (error) throw error;
                          
                          setUserProfile(prev => ({
                            ...prev,
                            is_integration_admin: newValue
                          }));
                          
                          alert(newValue ? 'Mode admin activé avec succès !' : 'Mode admin désactivé avec succès !');
                        } catch (error) {
                          console.error("Erreur lors de la mise à jour du mode admin:", error);
                          alert('Erreur lors de la mise à jour du mode admin');
                        } finally {
                          setShowAdminConfirmation(false);
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors"
            >
              Mettre à jour le profil
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
} 