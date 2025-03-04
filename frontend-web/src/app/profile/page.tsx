'use client';

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LocationSearch from '@/components/LocationSearch';
import FileUpload from '@/components/FileUpload'; 

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState({
    full_name: "",
    type: "",
    bio: "",
    avatar_url: "",
    cv_url: "",
    code_postal: "",
    localite: "",
    is_private: true,
    accept_dm: false
  });

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUser(user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile({
            full_name: profile.full_name || "",
            type: profile.type || "",
            bio: profile.bio || "",
            avatar_url: profile.avatar_url || "",
            cv_url: profile.cv_url || "",
            code_postal: profile.code_postal || "",
            localite: profile.localite || "",
            is_private: profile.is_private ?? true,
            accept_dm: profile.accept_dm ?? false
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
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
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Non authentifié');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: userProfile.full_name,
          type: userProfile.type,
          bio: userProfile.bio,
          avatar_url: userProfile.avatar_url,
          cv_url: userProfile.cv_url,
          code_postal: userProfile.code_postal,
          localite: userProfile.localite,
          is_private: userProfile.is_private,
          accept_dm: userProfile.accept_dm,
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'id'
        });


      if (error) {
        throw error;
      }

      router.push('/');
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error.message || error);
      // Ajouter une notification d'erreur ici si nécessaire
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-white py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Mon Profil</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom complet</label>
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

          <button
            type="submit"
            className="w-full bg-green-400 text-white py-2 px-4 rounded-md hover:bg-green-500 transition-colors"
          >
            Mettre à jour le profil
          </button>
        </form>
      </div>
    </div>
  );
} 